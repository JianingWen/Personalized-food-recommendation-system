import React, { useState, useEffect, Component } from 'react';
import { Bar } from 'react-chartjs-2';
import './dietForm.css';
import 'chart.js/auto';
// import recipeImageIcon from './image_sources/image_icon.png';

function DietForm() {
    const [formData, setFormData] = useState({
        age: 0,
        heightCm: 0,
        heightFt: 0,
        heightIn: 0,
        weightKg: 0,
        weightIb: 0,
        gender: 'male',
        activity: 'sedentary',
        weightPlan: 'Maintain weight',
        hasRestrictions: false, 
        foodRestriction: '',
        specifiedIngredients: '',
        noIngredients: '',
        mealsPerDay: 3,

        calories: 500,
        fatContent: 50,
        saturatedFatContent: 0,
        cholesterolContent: 0,
        sodiumContent: 400,
        carbohydrateContent: 100,
        fiberContent: 10,
        sugarContent: 10,
        proteinContent: 10,
    });
    
    const [recommendations, setRecommendations] = useState([]);   //, setRecommendedCalories
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [unit, setUnit] = useState('metric');
    const [showNutrition, setShowNutrition] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [chartData, setChartData] = useState(null);
    // const toggleUnit = () => {
    //     setUnit(prevUnit => (prevUnit === 'metric' ? 'english' : 'metric'));
    // };  
    
    const toggleUnit = (newUnit) => {
        setUnit(newUnit);
    };
    

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData(prevState => {
            const newState = {
                ...prevState,
                [name]: type === 'checkbox' ? checked : value
            };
    
            if (unit === 'english' && (name === 'heightFt' || name === 'heightIn')) {
                return convertHeightToCm(newState);
            }
            
            if (unit === 'english' && name === 'weightIb') {
                return convertWeightToKg(newState);
            }
    
            return newState;
        });
    };

    const handleNutritionChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: parseInt(value, 10) // Ensuring the value is treated as a number
        }));
    }; 

    const convertHeightToCm = (formData) => {
        const heightFt = parseFloat(formData.heightFt || 0);
        const heightIn = parseFloat(formData.heightIn || 0);
        const heightCm = Math.round((heightFt * 12 + heightIn) * 2.54);
        return {
            ...formData,
            heightCm
        };
    };
    
    const convertWeightToKg = (formData) => {
        const weightIb = parseFloat(formData.weightIb || 0);
        const weightKg = Math.round(weightIb * 0.453592)
        return {
            ...formData,
            weightKg
        };
    };
    
    // useEffect(() => {
    //     convertHeightToCm();
    // }, [unit]);

    const calculateBMI = () => {
        const { weightKg, heightCm } = formData;
        console.log(weightKg)
        console.log(heightCm)
        const heightInMeters = heightCm / 100;
        const bmi = weightKg / (heightInMeters * heightInMeters);
        let category, color;

        if (bmi < 18.5) {
            category = 'Underweight';
            color = 'red';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal';
            color = 'green';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            color = '#f2c41d';
        } else {
            category = 'Obesity';
            color = 'red';
        }

        return { bmi, category, color };
    }

    const calculateBMR = () => {    //https://www.verywellfit.com/how-many-calories-do-i-need-each-day-2506873
        const { weightKg, heightCm, age, gender } = formData;
        const bmr = gender === 'male'
            ? 9.563 * weightKg + 1.850 * heightCm - 4.676 * age + 655.1
            : 13.75 * weightKg + 5.003 * heightCm - 6.755 * age + 66.47;
        return bmr;
    }

    const calculateCalories = (bmr) => {    //https://www.calories.info/calorie-intake-calculator
        const activityLevels = {
            sedentary : 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        // console.log("bmr: ", bmr)
        // console.log("formData.activity: ", formData.activity)
        // console.log("activityLevels[formData.activity]: ", activityLevels[formData.activity])
        const maintenanceCalories = bmr * activityLevels[formData.activity]
        console.log("maintenanceCalories: ", maintenanceCalories)
        let calroiesNeed;
        switch (formData.weightPlan) {
            case 'Lose weight':
                calroiesNeed =  maintenanceCalories - 500; // Deficit for weight loss
                break;
            case 'Gain weight':
                calroiesNeed =  maintenanceCalories + 500; // Surplus for weight gain
                break;
            default:
                calroiesNeed =  maintenanceCalories; // Maintain weight
        }
        console.log("calroiesNeed: ", calroiesNeed)
        return calroiesNeed
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { bmi, category, color } = calculateBMI();
        const bmr = calculateBMR();
        const calroiesNeed = calculateCalories(bmr);
        // const maintenanceCalories = calculateRecommendedCalories();

        setFormData(prevState => ({
            ...prevState,
            bmi: `${bmi.toFixed(1)} kg/m²`,
            category,
            color,
            bmr: bmr.toFixed(0),
            calroiesNeed: `${calroiesNeed.toFixed(0)} calories/day`
        }));

        setShowNutrition(true);  
    };
    const [nutritionRecommendations, setNutritionRecommendations] = useState([]);

    const handleGenerateClick = async () => {
        setNutritionRecommendations(generateRecommendations()); 
        setRecommendations([]);
        const payload = {
            nutrition_input: [
                formData.calories,
                formData.fatContent,
                formData.saturatedFatContent,
                formData.cholesterolContent,
                formData.sodiumContent,
                formData.carbohydrateContent,
                formData.fiberContent,
                formData.sugarContent,
                formData.proteinContent,
            ],
            ingredients: formData.specifiedIngredients
            ? formData.specifiedIngredients.split(";").map((item) => item.trim())
            : [],
            // food_restrictions: formData.hasRestrictions ? [formData.foodRestriction] : [],
            food_restrictions: formData.foodRestriction ? formData.foodRestriction.split(";").map((item) => item.trim()): [],
            params: {
                n_neighbors: 5,
                return_distance: false,
            },
        };

        console.log('payload', payload)
        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            const data = await response.json();
            console.log('Response:', data);
            if (data.output) {
                setRecommendations(data.output); // Store the recommendations in state
                
            } else {
                console.log(data.message ||"No recommendations found");

            }
        } catch (error)
        {
            console.log("Error generating recommendations:", error);
        }
    };

    const toggleExpand = (recipeName, index) => {
        setSearchTerm(recipeName)
        if (expandedIndex === index) {
            setExpandedIndex(null);
            setImageIndex(null);
            // setExpandedImageIndex(null);  
        } else {
            setExpandedIndex(index);
            setImageIndex(index);
            fetchImage();
        }
    };

    const [isPressed, setIsPressed] = useState(false);
    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    
    const [searchTerm, setSearchTerm] = useState('');
    const [imageIndex, setImageIndex] = useState(null);

    const fetchImage = async () => {
        try {
            console.log("searchTerm: ", encodeURIComponent(searchTerm))
            const response = await fetch(`http://localhost:5000/api/images?recipe_name=${encodeURIComponent(searchTerm)}`);
            console.log("response: ", response)
            if (response.ok) {
                const data = await response.json();  
                console.log("Image URL here: ", data);
                setImageUrl(data.imageUrl);  
                setError('');  
            } else {
                throw new Error('Failed to fetch image: ' + response.statusText);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);  // Set error message
            setImageUrl('');  // Reset image URL on error
        }
    };

    const viewNutritions = (recipe, index) => {
        setShowChart(true);
        setExpandedIndex(index);

        const recipeNutrition = [
            recipe.Calories,
            recipe.FatContent,
            recipe.SaturatedFatContent,
            recipe.CholesterolContent,
            recipe.SodiumContent,
            recipe.CarbohydrateContent,
            recipe.FiberContent,
            recipe.SugarContent,
            recipe.ProteinContent,
        ];
        const userInputNutrition = [
            formData.calories,
            formData.fatContent,
            formData.saturatedFatContent,
            formData.cholesterolContent,
            formData.sodiumContent,
            formData.carbohydrateContent,
            formData.fiberContent,
            formData.sugarContent,
            formData.proteinContent,
        ];
        setChartData({
            labels: [
                'Calories', 'Fat (g)', 'Saturated Fat (g)', 'Cholesterol (mg)',
                'Sodium (mg)', 'Carbohydrates (g)', 'Fiber (g)', 'Sugars (g)', 'Proteins (g)'
            ],
            datasets: [
                {
                    label: 'User Input Nutritional Values',
                    data: userInputNutrition,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Recipe Nutritional Values',
                    data: recipeNutrition,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',  // Red
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        });
    };
    const generateRecommendations = () => {
        const { age, gender, weightPlan} = formData;
        const nutrientLimits = {
            calories: gender === 'male' ? 2500 : 2000,
            fatContent: 70,
            saturatedFatContent: 20,
            cholesterolContent: 300,
            sodiumContent: 2300,
            carbohydrateContent: 275,
            fiberContent: 28,
            sugarContent: 50,
            proteinContent: 50,
        };
        if (age > 50) {
            nutrientLimits.sodiumContent = 1500; // Lower sodium limit for older adults
        }
        if (weightPlan === 'Lose weight') {
            nutrientLimits.calories -= 500; // Reduce calories for weight loss
        } else if (weightPlan === 'Gain weight') {
            nutrientLimits.calories += 500; // Increase calories for weight gain
        }
        const recommendations = [];
        const nutrients = [
            { name: 'Calories', value: formData.calories, limit: nutrientLimits.calories },
            { name: 'Fat', value: formData.fatContent, limit: nutrientLimits.fatContent },
            { name: 'Saturated Fat', value: formData.saturatedFatContent, limit: nutrientLimits.saturatedFatContent },
            { name: 'Cholesterol', value: formData.cholesterolContent, limit: nutrientLimits.cholesterolContent },
            { name: 'Sodium', value: formData.sodiumContent, limit: nutrientLimits.sodiumContent },
            { name: 'Carbohydrates', value: formData.carbohydrateContent, limit: nutrientLimits.carbohydrateContent },
            { name: 'Fiber', value: formData.fiberContent, limit: nutrientLimits.fiberContent },
            { name: 'Sugar', value: formData.sugarContent, limit: nutrientLimits.sugarContent },
            { name: 'Protein', value: formData.proteinContent, limit: nutrientLimits.proteinContent },
        ];

        nutrients.forEach((nutrient) => {
            if (nutrient.value > nutrient.limit) {
                recommendations.push(`⚠️ ${nutrient.name} exceeds the recommended limit (${nutrient.limit}). Consider reducing it.`);
            } else if (nutrient.value < nutrient.limit * 0.7) {
                recommendations.push(`🔹 ${nutrient.name} is quite low. Aim to increase it.`);
            } else {
                recommendations.push(`✅ ${nutrient.name} is within a healthy range.`);
            }
        });

        return recommendations;
    };
    useEffect(() => {
        setNutritionRecommendations(generateRecommendations(formData));
    }, []);
    return (
        <div className="diet-info-container">
            <form onSubmit={handleSubmit}>
                <div className="diet-form">
                    <h1>Welcome to your personalized Diet Recommendation System</h1>
                    
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="button" onClick={() => toggleUnit('metric')} className={`unit-button ${unit === 'metric' ? 'active' : ''}`} style={{ width: '100px', alignItems: 'center', marginRight: '10px'}}>
                            Metric
                        </button>
                        <button type="button" onClick={() => toggleUnit('english')} className={`unit-button ${unit === 'english' ? 'active' : ''}`} style={{ width: '100px', alignItems: 'center', marginLeft: '10px'}}>
                            English
                        </button>
                    </div>
                    <label>Age<input type="number" name="age" value={formData.age} onChange={handleChange} /></label>
                    {/* <label>Height(cm)<input type="number" name="height" value={formData.height} onChange={handleChange} /></label>
                    <label>Weight(kg)<input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label> */}
                    {/* <label>Weight ({unit === 'metric' ? 'kg' : 'lbs'}):<input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label> */}
                    <label><div>
                        {unit === 'metric' ? (
                            <label>Weight (kg):
                                <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} />
                            </label>
                        ) : 
                        (
                            <label>Weight (Ibs):
                                <input type="number" name="weightIb" value={formData.weightIb} onChange={handleChange}/>
                            </label>
                        )}
                    </div></label>
                    
                    {/* <label>Height ({unit === 'metric' ? 'cm' : 'inches'}):<input type="number" name="height" value={formData.height} onChange={handleChange} /></label> */}
                    <label><div>
                        {unit === 'metric' ? (
                            <label>Height (cm):
                                <input type="number" name="heightCm" value={formData.heightCm} onChange={handleChange} />
                            </label>
                        ) : 
                        (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ marginRight: '10px' }}>Height Ft.:
                                    <input type="number" name="heightFt" value={formData.heightFt} onChange={handleChange} style={{ width: '70px', marginLeft: '5px' }} />
                                </label>
                                <label>In.:
                                    <input type="number" name="heightIn" value={formData.heightIn} onChange={handleChange} style={{ width: '70px', marginLeft: '5px' }} />
                                </label>
                            </div>
                        )}
                    </div></label>
                
                    <label>
                        Gender
                        <div>
                            <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} /> Male
                            <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} /> Female
                        </div>
                    </label>
                    <label>Activity Level
                        <select name="activity" value={formData.activity} onChange={handleChange}>
                            <option value="sedentary">Sedentary (little or no exercise)</option>
                            <option value="lightly_active">Lightly Active (exercise 1–3 days/week)</option>
                            <option value="moderately_active">Moderately Active (exercise 3–5 days/week)</option>
                            <option value="active">Active (exercise 6–7 days/week)</option>
                            <option value="very_active">Very Active (hard exercise 6–7 days/week)</option>
                        </select>
                    </label>
                    <label>Choose your weight loss plan:
                        <select name="weightPlan" value={formData.weightPlan} onChange={handleChange}>
                            <option value="Maintain weight">Maintain weight</option>
                            <option value="Lose weight">Lose weight</option>
                            <option value="Gain weight">Gain weight</option>
                        </select>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="hasRestrictions"
                            checked={formData.hasRestrictions}
                            onChange={handleChange}
                        />
                        Click the checkbox if you have any Food Restrictions.
                    </label>
                    {formData.hasRestrictions && (
                        
                        <label>
                            Specify ingredients to not include, separated by ";" :
                            <input
                                type="text"
                                name="foodRestriction"
                                placeholder="Ingredient1;Ingredient2;..."
                                value={formData.foodRestriction}
                                onChange={handleChange}
                            />
                        </label>
                    )}
                    <label>
                        Specify ingredients to include, separated by ";" :
                        <input
                            type="text"
                            name="specifiedIngredients"
                            placeholder="Ingredient1;Ingredient2;..."
                            value={formData.specifiedIngredients}
                            onChange={handleChange}
                        />
                    </label>
                    
                    <button type="submit">Submit</button>
                </div>
            </form>

            <div className="right-container">
                <div className="results" style={{ display: 'flex'}}>
                    <div>
                        <h2>Body Mass Index (BMI):</h2>
                        
                        <div style={{ fontSize: '20px', color: formData.color}}>
                            {formData.bmi} <span style={{ marginLeft: '20px', color: formData.color }}>{formData.category}</span>
                        </div>
                        <div style={{ color: 'grey' }}>
                            """ Healthy BMI range: 18.5 kg/m² - 24.9 kg/m². """
                        </div>
                    </div>
                    <div style={{ height: 'auto', width: '1px', backgroundColor: '#000', margin: '0 20px'}}></div>
                    <div>
                        <h2>Suggested Calories:</h2>

                        <div style={{ color: '#ba5b07', fontSize: '25px' }}> 
                            {formData.weightPlan}: <span style={{ textDecoration: 'underline', color: '#8a5322' }}>Around {formData.calroiesNeed}</span>
                        </div>
                        <p style={{ color: '#7b93ba', fontSize: '18px', marginTop: '10px' }}>
                            This is a personalized daily calorie intake suggestion based on your individual profile. Feel free to mix and match recipes based on their calorie content and nutritional values to meet your goals.
                        </p>
                    </div>
                    
                </div>
                
                {showNutrition && (
                    <div className="nutrition-container">
                        <div className="nutrition-tracking">
                            <h2>Nutrition Tracking</h2>
                            <label><b>Calories:</b>
                                <input type="range" name="calories" min="0" max="2000" value={formData.calories} onChange={handleNutritionChange} />
                                {formData.calories} kcal
                            </label>
                            <label><b>Fat Content:</b>
                                <input type="range" name="fatContent" min="0" max="100" value={formData.fatContent} onChange={handleNutritionChange} />
                                {formData.fatContent} g
                            </label>
                            <label><b>Saturated Fat Content:</b>
                                <input type="range" name="saturatedFatContent" min="0" max="13" value={formData.saturatedFatContent} onChange={handleNutritionChange} />
                                {formData.saturatedFatContent} g
                            </label>
                            <label><b>Cholesterol Content:</b>
                                <input type="range" name="cholesterolContent" min="0" max="300" value={formData.cholesterolContent} onChange={handleNutritionChange} />
                                {formData.cholesterolContent} mg
                            </label>
                            <label><b>Sodium Content:</b>
                                <input type="range" name="sodiumContent" min="0" max="2300" value={formData.sodiumContent} onChange={handleNutritionChange} />
                                {formData.sodiumContent} mg
                            </label>
                            <label><b>Carbohydrate Content:</b>
                                <input type="range" name="carbohydrateContent" min="0" max="325" value={formData.carbohydrateContent} onChange={handleNutritionChange} />
                                {formData.carbohydrateContent} g
                            </label>
                            <label><b>Fiber Content:</b>
                                <input type="range" name="fiberContent" min="0" max="50" value={formData.fiberContent} onChange={handleNutritionChange} />
                                {formData.fiberContent} g
                            </label>
                            <label><b>Sugar Content:</b>
                                <input type="range" name="sugarContent" min="0" max="40" value={formData.sugarContent} onChange={handleNutritionChange} />
                                {formData.sugarContent} g
                            </label>
                            <label><b>Protein Content:</b>
                                <input type="range" name="proteinContent" min="0" max="40" value={formData.proteinContent} onChange={handleNutritionChange} />
                                {formData.proteinContent} g
                            </label>
                            <button type="button" onClick={handleGenerateClick} style={{ marginTop: '10px' }}>Generate</button>
                        </div>

                        {nutritionRecommendations.length > 0 && (
                            <div className="nutrition-recommendations">
                                <h3>Nutrition Recommendations</h3>
                                <ul>
                                    {nutritionRecommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
)}
 
                {showNutrition && (    
                    <div className="food-recommendations">
                        <h2>Food Recommendations</h2>
                        {recommendations.length > 0 ? (
                            <ul>
                                {recommendations.map((recipe, index) => (
                                    <li key={index}>
                                        <div
                                            onClick={() => toggleExpand(recipe.Name, index)}
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: expandedIndex === index ? "#007BFF" : "#000",
                                            }}>
                                            {recipe.Name} ({recipe.Calories} Calories)
                                            <button onClick={() => viewNutritions(recipe)} style={{ marginLeft: '10px' }}>See Details</button>
                                        </div>
                                        {expandedIndex === index && imageIndex === index &&(
                                            <div className="recipe-details" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                                {showChart && chartData && (
                                                    <div style={{ width: '100%', maxWidth: '500px', height: '300px' }}>
                                                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                                    </div>
                                                )}
                                                {imageUrl && (
                                                    <div style={{ flex: '0 0 200px', height: '200px', marginTop: '20px'}}>
                                                        <img src={imageUrl} alt="Recipe Image" style={{ width: '100%', height:'100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}/>
                                                    </div>
                                                )}
                                                    {/* {error && <p>Error: {error}</p>} */}
                                                <div style={{ flex: '1 1 300px' }}>
                                                <p>
                                                    <b>Ingredients:</b>{" "}
                                                    {recipe.RecipeIngredientParts.join(", ")}
                                                </p>
                                                <p>
                                                    <b>Instructions:</b>{" "}
                                                    {recipe.RecipeInstructions.join("\n")}
                                                </p>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recommendations yet. Adjust the Calories and Nutrition values based on your needs, and click <span style={{ color: 'blue' }}>"Generate"</span> button to get started!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DietForm;

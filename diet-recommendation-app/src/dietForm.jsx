import React, { useState, useEffect, Component } from 'react';
import axios from 'axios';
import './dietForm.css';

function DietForm() {
    const [formData, setFormData] = useState({
        age: 0,
        heightCm: 0,
        heightFt: 0,
        heightIn: 0,
        weight: 0,
        gender: 'male',
        activity: 'little',
        weightPlan: 'maintain',
        hasRestrictions: false, 
        foodRestriction: '',
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

    const [unit, setUnit] = useState('metric');

    const toggleUnit = () => {
        setUnit(prevUnit => (prevUnit === 'metric' ? 'english' : 'metric'));
    };

    // useEffect(() => {
    //     if (unit === 'english') {
    //         setFormData(prevState => ({
    //             ...prevState,
    //             weight: Math.round(prevState.weight * 2.20462),
    //             height: Math.round(prevState.height * 0.393701)
    //         }));
    //     } else {
    //         setFormData(prevState => ({
    //             ...prevState,
    //             weight: Math.round(prevState.weight * 0.453592),
    //             height: Math.round(prevState.height * 2.54)
    //         }));
    //     }
    // }, [unit]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };   

    const handleNutritionChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: parseInt(value, 10) // Ensuring the value is treated as a number
        }));
    };
    
    
    const convertHeightToCm = () => {
        if (unit === 'metric') {
        //     // Convert cm to feet and inches
        //     const totalInches = formData.heightCm / 2.54;
        //     const heightFt = Math.floor(totalInches / 12);
        //     const heightIn = Math.round(totalInches % 12);
        //     setFormData(prevState => ({
        //         ...prevState,
        //         heightFt,
        //         heightIn
        //     }));
        // } else {
        //     // Convert feet and inches to cm
        //     const heightCm = Math.round((formData.heightFt * 12 + formData.heightIn) * 2.54);
        //     setFormData(prevState => ({
        //         ...prevState,
        //         heightCm
        //     }));
            const heightCm = Math.round((formData.heightFt * 12 + formData.heightIn) * 2.54);
            // const weightKg = Math.round(formData.weight * 0.453592);
            setFormData(prevState => ({
                ...prevState,
                heightCm,
                // weightKg
            }));
        }
    };
    
    useEffect(() => {
        convertHeightToCm();
    }, [unit]);

    const calculateBMI = () => {
        const { weight, heightCm } = formData;
        console.log(weight)
        console.log(heightCm)
        const heightInMeters = heightCm / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        let category, color;

        if (bmi < 18.5) {
            category = 'Underweight';
            color = 'red';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal';
            color = 'green';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            color = 'yellow';
        } else {
            category = 'Obesity';
            color = 'red';
        }

        return { bmi, category, color };
    }

    const calculateBMR = () => {    //https://www.verywellfit.com/how-many-calories-do-i-need-each-day-2506873
        const { weight, height, age, gender } = formData;
        const bmr = gender === 'male'
            ? 9.563 * weight + 1.850 * height - 4.676 * age + 655.1
            : 13.75 * weight + 5.003 * height - 6.755 * age + 66.47;
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
        return bmr * activityLevels[formData.activity];
    }

    // const [calories, setCalories] = useState(500);

    // const handleCaloriesChange = (e) => {
    //     setCalories(e.target.value);
    // };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const { bmi, category, color } = calculateBMI();
        const bmr = calculateBMR();
        const maintenanceCalories = calculateCalories(bmr);

        setFormData(prevState => ({
            ...prevState,
            bmi: `${bmi.toFixed(1)} kg/m²`,
            category,
            color,
            bmr: bmr.toFixed(0),
            maintenanceCalories: maintenanceCalories.toFixed(0)
        }));


        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json(); // Assuming the server responds with JSON
            console.log(data); 
            // const response = await axios.post('/submit', formData);
            // console.log(response.data);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleGenerateClick = () => {
        console.log("Generating menu:", formData);
    };
    

    return (
        <div className="diet-info-container">
            <form onSubmit={handleSubmit}>
                <div className="diet-form">
                    <h1>Welcome to your personalized Diet Recommendation System</h1>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="button" id='unit' onClick={toggleUnit} className={`unit-button ${unit === 'metric' ? 'active' : ''}`} style={{ width: '100px', alignItems: 'center', marginRight: '10px'}}>Metric</button>
                        <button type="button" onClick={toggleUnit} className={`unit-button ${unit === 'metric' ? 'active' : ''}`} style={{ width: '100px', alignItems: 'center', marginLeft: '10px'}}>English</button>
                    </div>
                    <label>Age<input type="number" name="age" value={formData.age} onChange={handleChange} /></label>
                    {/* <label>Height(cm)<input type="number" name="height" value={formData.height} onChange={handleChange} /></label>
                    <label>Weight(kg)<input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label> */}
                    <label>Weight ({unit === 'metric' ? 'kg' : 'lbs'}):<input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label>
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
                            <option value="maintain">Maintain weight</option>
                            <option value="lose">Lose weight</option>
                            <option value="gain">Gain weight</option>
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
                            Select your food restriction:
                            <select
                                name="foodRestriction"
                                value={formData.foodRestriction}
                                onChange={handleChange}
                            >
                                <option value="">Please select</option>
                                <option value="glutenFree">Gluten-Free</option>
                                <option value="nutFree">Nut-Free</option>
                                <option value="dairyFree">Dairy-Free</option>
                                <option value="vegan">Vegan</option>
                            </select>
                        </label>
                    )}
                    <label>Meals per day<input type="number" name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} /></label>
                    {/* <button onClick={() => console.log(formData)}>Generate</button> */}

                    {/* <label>Results:</label>
                    <div>BMI: {formData.bmi} (Category: <span style={{ color: formData.color }}>{formData.category}</span>)</div>
                    <div>BMR: {formData.bmr} calories/day</div>
                    <div>Maintenance Calories: {formData.maintenanceCalories} calories/day</div> */}
                    
                    <button type="submit">Submit</button>
                </div>
            </form>

            <div className="right-container">
                <div className="results">
                    <h2>Body Mass Index (BMI):</h2>
                    
                    <div style={{ fontSize: '20px', color: formData.color}}>
                        {formData.bmi} <span style={{ marginLeft: '20px', color: formData.color }}>{formData.category}</span>
                    </div>
                    <div style={{ color: 'grey' }}>""" Healthy BMI range: 18.5 kg/m² - 25 kg/m². """</div>
                    

                    <p>Calories: {formData.maintenanceCalories} calories/day</p>
                </div>
                <div className="nutrition-tracking">
                    <h2>Nutrition Tracking</h2>
                    <label><b>Calories:</b>
                        <input type="range" name="calories" min="0" max="2000" value={formData.calories} onChange={handleNutritionChange} />
                        {formData.calories} kcal | 
                    </label>
                    <label><b>Fat Content:</b>
                        <input type="range" name="fatContent" min="0" max="100" value={formData.fatContent} onChange={handleNutritionChange} />
                        {formData.fatContent} g | 
                    </label>
                    <label><b>Saturated Fat Content:</b>
                        <input type="range" name="saturatedFatContent" min="0" max="13" value={formData.saturatedFatContent} onChange={handleNutritionChange} />
                        {formData.saturatedFatContent} g | 
                    </label>
                    <label><b>Cholesterol Content:</b>
                        <input type="range" name="cholesterolContent" min="0" max="300" value={formData.cholesterolContent} onChange={handleNutritionChange} />
                        {formData.cholesterolContent} mg | 
                    </label>
                    <label><b>Sodium Content:</b>
                        <input type="range" name="sodiumContent" min="0" max="2300" value={formData.sodiumContent} onChange={handleNutritionChange} />
                        {formData.sodiumContent} mg | 
                    </label>
                    <label><b>Carbohydrate Content:</b>
                        <input type="range" name="carbohydrateContent" min="0" max="325" value={formData.carbohydrateContent} onChange={handleNutritionChange} />
                        {formData.carbohydrateContent} g | 
                    </label>
                    <label><b>Fiber Content:</b>
                        <input type="range" name="fiberContent" min="0" max="50" value={formData.fiberContent} onChange={handleNutritionChange} />
                        {formData.fiberContent} g | 
                    </label>
                    <label><b>Sugar Content:</b>
                        <input type="range" name="sugarContent" min="0" max="40" value={formData.sugarContent} onChange={handleNutritionChange} />
                        {formData.sugarContent} g | 
                    </label>
                    <label><b>Protein Content:</b>
                        <input type="range" name="proteinContent" min="0" max="40" value={formData.proteinContent} onChange={handleNutritionChange} />
                        {formData.proteinContent} g | 
                    </label>
                    {/* <label>Calories:
                        <div className="slider-value">{formData.calories} kcal</div>
                        <input type="range" name="calories" min="0" max="2000" value={formData.calories} onChange={handleNutritionChange} />
                    </label>
                    <label>Fat Content:
                        <div className="slider-value">{formData.fatContent} g</div>
                        <input type="range" name="fatContent" min="0" max="100" value={formData.fatContent} onChange={handleNutritionChange} />
                    </label> */}
                    <div>
                        <button type="button" onClick={handleGenerateClick}>Generate</button>
                    </div>
                    

                </div>

            </div>

            {/* <div className="results">
                <h2>Body Mass Index (BMI):</h2>
                
                <div style={{ fontSize: '20px', color: formData.color}}>
                    {formData.bmi} <span style={{ marginLeft: '20px', color: formData.color }}>{formData.category}</span>
                </div>
                <div style={{ color: 'grey' }}>""" Healthy BMI range: 18.5 kg/m² - 25 kg/m². """</div>
                

                <p>Calories: {formData.maintenanceCalories} calories/day</p>
            </div> */}

            {/* <div className="nutrition-sliders">
                <h2>Nutrition Tracking</h2>
                <label>Calories:
                    <input type="range" name="calories" min="0" max="2000" value={formData.calories} onChange={handleChange} />
                    {formData.calories} kcal
                </label>
            </div> */}
        </div>
    );
}

export default DietForm;

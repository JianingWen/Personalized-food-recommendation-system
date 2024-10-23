import React, { useState } from 'react';
import axios from 'axios';
import './dietForm.css';

function DietForm() {
    const [formData, setFormData] = useState({
        age: 0,
        height: 0,
        weight: 0,
        gender: 'male',
        activity: 'little',
        weightPlan: 'maintain',
        hasRestrictions: false, 
        foodRestriction: '',
        mealsPerDay: 3
    });

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="diet-form">
                <h1>Welcome to your personalized Diet Recommendation System</h1>
                <label>Age<input type="number" name="age" value={formData.age} onChange={handleChange} /></label>
                <label>Height(cm)<input type="number" name="height" value={formData.height} onChange={handleChange} /></label>
                <label>Weight(kg)<input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label>
                <label>
                    Gender
                    <div>
                        <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} /> Male
                        <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} /> Female
                    </div>
                </label>
                <label>Activity Level
                    <select name="activity" value={formData.activity} onChange={handleChange}>
                        <option value="little">Lightly Active</option>
                        <option value="extra">Moderately Active</option>
                        <option value="extra">Active</option>
                        <option value="extra">Very Active</option>
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
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}

export default DietForm;

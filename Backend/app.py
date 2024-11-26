# import os
# import sys
# from os import environ as env
# from flask import Flask, render_template, redirect, url_for
# from flask_bootstrap import Bootstrap5

# from flask_wtf import FlaskForm, CSRFProtect
# from wtforms import StringField, SubmitField
# from wtforms.validators import DataRequired, Length

# app = Flask(__name__)
# app.secret_key = os.environ["FLASK_SECRET_KEY"]

# # Bootstrap-Flask requires this line
# bootstrap = Bootstrap5(app)
# # Flask-WTF requires this line
# csrf = CSRFProtect(app)

import logging
from flask import Flask, request, jsonify, send_from_directory
from model import recommend, output_recommended_recipes  # Import functions from model.py
import pandas as pd
from flask_cors import CORS
import os
app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

'''
@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.get_json()
    # Process the form data here (e.g., save to a database)
    app.logger.debug(f"Received data: {data}")
    return jsonify({'message': 'Form submitted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
'''

app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)
logging.basicConfig(level=logging.DEBUG)
dataset_path = "Data/dataset.csv"
# Load your dataset
dataset = pd.read_csv('Data/dataset.csv', compression='gzip')
if not os.path.exists(dataset_path):
    logging.error(f"Dataset not found at path: {dataset_path}")
    dataset = None
else:
    dataset = pd.read_csv(dataset_path, compression="gzip")
    logging.info("Dataset loaded successfully.")

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")
@app.route('/predict', methods=['POST'])
def predict():
    app.logger.debug("Predict endpoint called")
    try:
        # Get JSON payload from the frontend
        data = request.get_json()
        app.logger.debug(f"Received data: {data}")

        # Extract input from the received data
        nutrition_input = data.get('nutrition_input', [])
        ingredients = data.get('ingredients', [])
        food_restrictions = data.get('food_restrictions', [])
        params = data.get('params', {'n_neighbors': 5, 'return_distance': False})

        if dataset is None:
            return jsonify({"error": "Dataset not loaded!"}), 500
        # Call the recommendation logic
        recommendation_dataframe = recommend(
            dataset,
            nutrition_input,
            ingredients,
            food_restrictions,
            params
        )

        # Process the recommendations into a JSON response
        output = output_recommended_recipes(recommendation_dataframe)
        if output is None:
            return jsonify({'output': None, 'message': 'No recommendations found!'})
        else:
            return jsonify({'output': output, 'message': 'Recommendations generated successfully!'})

    except Exception as e:
        app.logger.error(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
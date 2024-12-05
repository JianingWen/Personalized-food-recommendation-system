import logging
from flask import Flask, request, jsonify, send_from_directory
from model import recommend, output_recommended_recipes  
import pandas as pd
from flask_cors import CORS
import os
app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)
logging.basicConfig(level=logging.DEBUG)
dataset_path = "Data/dataset.csv"
# Load dataset
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

        # Extract input from the received customized data
        nutrition_input = data.get('nutrition_input', [])
        ingredients = data.get('ingredients', [])
        food_restrictions = data.get('food_restrictions', [])
        params = data.get('params', {'n_neighbors': 5, 'return_distance': False})

        if dataset is None:
            return jsonify({"error": "Dataset not loaded!"}), 500

        recommendation_dataframe = recommend(
            dataset,
            nutrition_input,
            ingredients,
            food_restrictions,
            params
        )

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

# Personalized Food Recommendation System

This system provides personalized food recommendations through a web interface. Below are instructions on how to set up and run the frontend and backend components of the application.

## Prerequisites

Ensure you have the following installed:
- Node.js
- npm (usually comes with Node.js)
- Python
- pip (usually comes with Python)

## Frontend Setup

Follow these steps to get the frontend running:

1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd diet-recommendation-app\src
   ```
2. Install necessary dependencies (**First Time Only**):
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm start
   ```

## Backend Setup

Setting up the backend involves creating a virtual environment, activating it, and installing dependencies.

### Virtual Environment Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create a virtual environment (**First Time Only**):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows**:
     ```bash
     .\venv\Scripts\activate
     ```
   - **Mac/Linux**:
     ```bash
     source venv/bin/activate
     ```

### Install Dependencies

4. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
   If your project utilizes environment variables through a `.env` file:
   ```bash
   pip install python-dotenv
   ```

### Run the Backend

5. Start the server:
   ```bash
   python app.py
   ```


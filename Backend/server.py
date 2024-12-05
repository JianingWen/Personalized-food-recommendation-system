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

# import logging
# from flask import Flask, request, jsonify

# app = Flask(__name__)
# logging.basicConfig(level=logging.DEBUG)

# @app.route('/submit', methods=['POST'])
# def submit_form():
#     data = request.get_json()
#     # Process the form data here (e.g., save to a database)
#     app.logger.debug(f"Received data: {data}")
#     return jsonify({'message': 'Form submitted successfully!'})

# if __name__ == '__main__':
#     app.run(debug=True)
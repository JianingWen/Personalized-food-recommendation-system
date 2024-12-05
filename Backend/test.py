# import requests

# url = "http://127.0.0.1:5000/predict"
# payload = {
#     "nutrition_input": [500, 50, 0, 0, 400, 100, 10, 10, 10],
#     "ingredients": ["chicken", "broccoli"],
#     "food_restrictions": ["glutenFree"],
#     "params": {
#         "n_neighbors": 5,
#         "return_distance": False
#     }
# }
# headers = {
#     "Content-Type": "application/json"
# }

# response = requests.post(url, json=payload, headers=headers)

# if response.status_code == 200:
#     print("Response:", response.json())
# else:
#     print("Error:", response.status_code, response.text)

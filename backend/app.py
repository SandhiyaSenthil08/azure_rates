from flask import Flask, jsonify
from flask_cors import CORS
import requests
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)

# Cache for Azure data
azure_data_cache = []

# Function to fetch data from Azure API
def fetch_azure_data():
    global azure_data_cache
    url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview"
    response = requests.get(url)
    if response.status_code == 200:
        azure_data_cache = response.json().get("Items", [])
    else:
        azure_data_cache = []

# Fetch data every 30 minutes
scheduler = BackgroundScheduler()
scheduler.add_job(func=fetch_azure_data, trigger="interval", minutes=30)
scheduler.start()

# API to serve cached data
@app.route("/api/azure-rates", methods=["GET"])
def get_azure_rates():
    return jsonify(azure_data_cache)

if __name__ == "__main__":
    fetch_azure_data()  # Initial fetch
    app.run(host="0.0.0.0", port=5000)

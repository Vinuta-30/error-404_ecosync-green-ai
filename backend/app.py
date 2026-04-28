

from flask import Flask, request, jsonify
from model import ecosync_decision

app = Flask(__name__)

@app.route("/")
def home():
    return "EcoSync Backend Running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)  # safer than request.json
        supply = data.get("supply")
        demand = data.get("demand")

        result = ecosync_decision(supply, demand)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

import random
@app.route("/simulate", methods=["GET"])
def simulate():
    supply = random.randint(80, 150)
    demand = random.randint(100, 180)

    result = ecosync_decision(supply, demand)

    return jsonify({
        "supply": supply,
        "demand": demand,
        "result": result
    })
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
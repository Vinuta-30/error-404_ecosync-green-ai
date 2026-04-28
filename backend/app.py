from flask import Flask, request, jsonify
from flask_cors import CORS
from model import ecosync_decision

# Person 3 imports
from prediction import predict as get_prediction
from insights import generate_insight
from carbon import calculate_carbon

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "EcoSync Backend Running"


# 🔵 USER INPUT API (manual prediction)
@app.route("/predict", methods=["POST"])
def predict_api():
    try:
        data = request.get_json(force=True)

        supply = data.get("supply")
        demand = data.get("demand")

        result = ecosync_decision(supply, demand)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 🟢 MAIN AI SIMULATION (Person 3 + Your logic)
@app.route("/simulate", methods=["GET"])
def simulate():

    # Step 1: Get data from Person 3
    data = get_prediction()

    supply = data["supply"]
    demand = data["demand"]

    # Step 2: Your decision logic
    result = ecosync_decision(supply, demand)

    # Step 3: Extra AI features
    insight = generate_insight(supply, demand)
    carbon = calculate_carbon(supply, demand)

    return jsonify({
        "supply": supply,
        "demand": demand,
        "result": result,
        "insight": insight,
        "carbon": carbon
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
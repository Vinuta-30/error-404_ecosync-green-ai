import pandas as pd
from sklearn.linear_model import LinearRegression

# Load dataset
df = pd.read_csv("data/energy_data.csv")

X = df[["hour"]]
y = df["demand"]

# Train model
model = LinearRegression()
model.fit(X, y)

print("=== Full Day Demand Prediction ===")

for hour in range(1, 25):
    pred = model.predict(pd.DataFrame([[hour]], columns=["hour"]))[0]

    status = "✅ Stable"
    if pred > 90:
        status = "⚠ High Demand"
    elif pred > 70:
        status = "🟡 Medium Load"

    print(f"Hour {hour}:00 -> {round(pred,2)} MW | {status}")
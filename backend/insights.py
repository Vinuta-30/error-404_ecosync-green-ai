import pandas as pd
from sklearn.linear_model import LinearRegression

df = pd.read_csv("data/energy_data.csv")

X = df[["hour"]]
y = df["demand"]

model = LinearRegression()
model.fit(X, y)

def generate_insight(supply, demand):
    pred = model.predict([[12]])[0]

    if demand > 90:
        return "⚠ High demand predicted. AI suggests load balancing."
    elif demand > 70:
        return "🟡 Moderate load. Optimizing energy usage."
    else:
        return "✅ Grid stable and efficient."
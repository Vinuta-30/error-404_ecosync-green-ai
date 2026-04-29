import pandas as pd
import random

def predict():
    df = pd.read_csv("data/energy_data.csv")

    latest = df.iloc[-1]

    demand = int(latest["demand"])

    # Generate realistic supply
    supply = demand + random.randint(-2000, 2000)

    return {
        "supply": supply,
        "demand": demand
    }
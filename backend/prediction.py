import pandas as pd
import random
import os

def predict():
    # Correct absolute path
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "data", "energy_data.csv")

    df = pd.read_csv(file_path)

    latest = df.iloc[-1]

    demand = int(latest["demand"])

    # Generate realistic supply
    supply = demand + random.randint(-2000, 2000)

    return {
        "supply": supply,
        "demand": demand
    }
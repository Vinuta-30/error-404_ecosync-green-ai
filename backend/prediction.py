import pandas as pd

def predict():
    df = pd.read_csv("data/energy_data.csv")

    # Take latest row (simulate current time)
    latest = df.iloc[-1]

    return {
        "supply": int(latest["supply"]),
        "demand": int(latest["demand"])
    }
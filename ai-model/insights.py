import pandas as pd
import os

def generate_insight(supply, demand):
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "data", "energy_data.csv")

        print("Reading file from:", file_path)  # DEBUG

        df = pd.read_csv(file_path)

    except Exception as e:
        print("ERROR:", e)

    # Your logic (independent of file for now)
    if demand > supply:
        return "⚠ Demand exceeds supply. Optimize distribution."
    elif demand > 0.8 * supply:
        return "🟡 Demand nearing capacity."
    else:
        return "✅ System stable."
import pandas as pd
import os

# Get correct path to CSV
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "data", "energy_data.csv")

df = pd.read_csv(file_path)

def generate_insight(supply, demand):
    if demand > supply:
        return "⚠ Demand exceeds supply. Optimize distribution."
    elif demand > 0.8 * supply:
        return "🟡 Demand nearing capacity. Monitor closely."
    else:
        return "✅ System stable and efficient."
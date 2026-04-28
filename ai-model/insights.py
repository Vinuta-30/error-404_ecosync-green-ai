import pandas as pd

print("=== EcoSync Smart Recommendations ===")

df = pd.read_csv("data/energy_data.csv")

for _, row in df.iterrows():
    hour = row["hour"]
    demand = row["demand"]

    if demand > 90:
        print(f"Hour {hour}:00 ⚠ Peak Load")
        print("   ➜ Delay EV charging")
        print("   ➜ Use battery backup")
        print("   ➜ Prioritize hospitals")

    elif demand > 70:
        print(f"Hour {hour}:00 🟡 Medium Load")
        print("   ➜ Dim streetlights by 10%")

    else:
        print(f"Hour {hour}:00 ✅ Stable")
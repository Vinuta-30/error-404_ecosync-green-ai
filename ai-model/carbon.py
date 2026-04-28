import pandas as pd

print("=== EcoSync Sustainability Report ===")

# Load data
df = pd.read_csv("data/energy_data.csv")

# Carbon factors (kg CO2 per unit)
coal_rate = 100
gas_rate = 60
renewable_rate = 10

normal_total = 0
optimized_total = 0

for demand in df["demand"]:
    # Normal city usage
    coal = demand * 0.5
    gas = demand * 0.3
    renewable = demand * 0.2

    carbon_normal = (coal * coal_rate) + (gas * gas_rate) + (renewable * renewable_rate)
    normal_total += carbon_normal

    # EcoSync optimized usage
    coal = demand * 0.2
    gas = demand * 0.2
    renewable = demand * 0.6

    carbon_optimized = (coal * coal_rate) + (gas * gas_rate) + (renewable * renewable_rate)
    optimized_total += carbon_optimized

saved = ((normal_total - optimized_total) / normal_total) * 100

print("Carbon Without EcoSync:", round(normal_total,2), "kg CO2")
print("Carbon With EcoSync:", round(optimized_total,2), "kg CO2")
print("Carbon Saved:", round(saved,2), "%")

if saved > 25:
    print("🌱 Excellent Sustainability Performance")
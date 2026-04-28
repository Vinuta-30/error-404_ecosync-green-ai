def ecosync_decision(supply, demand):
    actions = []
    carbon_saved = 0

    if demand <= supply:
        return {
            "status": "stable",
            "actions": ["System stable"],
            "carbon_saved": carbon_saved
        }

    overload = demand - supply

    actions.append(f"⚠ Overload: {overload} units")

    # Priority 3 (EV Charging)
    if overload > 0:
        actions.append("🔌 Stop EV Charging (low priority)")
        carbon_saved += 10
        overload -= 30

    # Priority 2 (Streetlights)
    if overload > 0:
        actions.append("💡 Dim Streetlights by 50%")
        carbon_saved += 5
        overload -= 20

    # Priority 2 (Malls)
    if overload > 0:
        actions.append("🏢 Reduce Mall Power Usage")
        carbon_saved += 5
        overload -= 20

    # Priority 1 (Never touched)
    actions.append("🏥 Hospitals unaffected")

    return {
        "status": "critical",
        "actions": actions,
        "carbon_saved": carbon_saved
    }
def calculate_carbon(supply, demand):
    diff = supply - demand

    if diff > 20:
        return 40
    elif diff > 10:
        return 25
    else:
        return 10
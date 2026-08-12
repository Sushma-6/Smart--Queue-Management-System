import pandas as pd
import random
from datetime import datetime, timedelta

# -----------------------------
# SETTINGS
# -----------------------------
NUM_ROWS = 1000
NUM_DAYS = 30
COUNTERS = ["C1", "C2"]
START_DATE = datetime(2025, 3, 1)

# -----------------------------
# HELPERS
# -----------------------------
def get_peak_multiplier(hour, day_name):
    multiplier = 1.0

    # Peak hours
    if 10 <= hour <= 13:
        multiplier += 1.2
    if 16 <= hour <= 18:
        multiplier += 1.0

    # Weekend lower traffic
    if day_name in ["Saturday", "Sunday"]:
        multiplier -= 0.3

    # Monday and Friday slightly higher
    if day_name in ["Monday", "Friday"]:
        multiplier += 0.3

    return max(multiplier, 0.5)

def random_arrival_time(base_date):
    hour = random.randint(9, 19)   # queue active from 9 AM to 7 PM
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return datetime(
        base_date.year, base_date.month, base_date.day,
        hour, minute, second
    )

# -----------------------------
# GENERATE DATA
# -----------------------------
rows = []

for i in range(1, NUM_ROWS + 1):
    day_offset = random.randint(0, NUM_DAYS - 1)
    current_date = START_DATE + timedelta(days=day_offset)
    day_name = current_date.strftime("%A")

    arrival_dt = random_arrival_time(current_date)
    hour = arrival_dt.hour

    peak_multiplier = get_peak_multiplier(hour, day_name)

    # Simulated queue length
    base_queue = random.randint(3, 20)
    queue_length = int(base_queue * peak_multiplier)
    queue_length = max(queue_length, 1)

    # People ahead should be less than queue_length
    people_ahead = random.randint(0, max(queue_length - 1, 0))

    # Service time per person
    service_time_minutes = random.randint(5, 20)

    # Wait time depends on people ahead and 2 counters
    estimated_batches = people_ahead / 2
    wait_time_minutes = round(estimated_batches * service_time_minutes + random.uniform(0, 5), 2)

    # Service start and finish
    service_start_dt = arrival_dt + timedelta(minutes=wait_time_minutes)
    finish_dt = service_start_dt + timedelta(minutes=service_time_minutes)

    # Historical dataset mostly served
    status = random.choices(
        ["served", "cancelled"],
        weights=[95, 5],
        k=1
    )[0]

    counter_id = random.choice(COUNTERS)

    rows.append({
        "id": i,
        "date": current_date.strftime("%Y-%m-%d"),
        "day_of_week": day_name,
        "arrival_time": arrival_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "hour": hour,
        "service_time_minutes": service_time_minutes,
        "wait_time_minutes": wait_time_minutes,
        "queue_length": queue_length,
        "people_ahead": people_ahead,
        "status": status,
        "counter_id": counter_id
    })

# -----------------------------
# SAVE CSV
# -----------------------------
df = pd.DataFrame(rows)
df = df.sort_values(by="arrival_time").reset_index(drop=True)
df.to_csv("synthetic_queue_dataset.csv", index=False)

print("Dataset created successfully: synthetic_queue_dataset.csv")
print(df.head())
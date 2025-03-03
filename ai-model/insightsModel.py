from fastapi import FastAPI, HTTPException
import pandas as pd
from prophet import Prophet
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Define Input Data Model
class EmployeeProductivityData(BaseModel):
    employeeId: str
    sickLeavesUsed: int
    maxSickLeaves: int
    vacationTaken: int
    totalVacation: int
    attendanceRecords: List[dict]  # List of { date, status }

# Sample Data for Training Prophet Model
df = pd.DataFrame({
    "ds": pd.date_range(start="2024-01-01", periods=30, freq="D"),
    "y": [85, 80, 78, 76, 75, 72, 70, 68, 60, 58, 56, 55, 50, 45, 42, 40, 38, 37, 36, 35, 34, 33, 31, 30, 28, 27, 25, 24, 23, 22]
})

# Initialize & Train Prophet Model
model = Prophet()
model.fit(df)  # ✅ Ensure the model is trained before predictions

@app.post("/predict")
def predict_productivity(employee_data: EmployeeProductivityData):
    try:
        # Extract Employee Data for Analysis
        sick_leave_usage = (employee_data.sickLeavesUsed / employee_data.maxSickLeaves) * 100
        vacation_usage = (employee_data.vacationTaken / employee_data.totalVacation) * 100

        # Create Future Dates for Prediction
        future = model.make_future_dataframe(periods=7)
        forecast = model.predict(future)

        # Generate Burnout Risk Score
        burnout_risk = min(100, (sick_leave_usage + vacation_usage) / 2)

        return {
            "employeeId": employee_data.employeeId,
            "burnoutRisk": f"{burnout_risk:.2f}%",
            "futureProductivity": forecast[['ds', 'yhat']].tail(7).to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

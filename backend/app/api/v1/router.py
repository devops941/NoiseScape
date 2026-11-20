from fastapi import APIRouter
from app.api.v1 import stations, readings, alerts, analytics, predict

api_router = APIRouter()

api_router.include_router(stations.router, prefix="/stations", tags=["Stations"])
api_router.include_router(readings.router, prefix="/readings", tags=["Readings"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(predict.router, prefix="/predict", tags=["ML Prediction"])


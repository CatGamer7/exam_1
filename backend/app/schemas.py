from pydantic import BaseModel
from datetime import date
from typing import Optional

class DashboardFilters(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    regions: Optional[list[str]] = None
    categories: Optional[list[str]] = None
    clinics: Optional[list[str]] = None

class KPIResponse(BaseModel):
    total_revenue: float
    total_operations: int
    unique_clients: int
    avg_check: float
    weighted_discount_pct: float

class MonthlyTrendResponse(BaseModel):
    months: list[str]
    revenue: list[float]
    min_month_idx: int
    max_month_idx: int

class CategoryStructureResponse(BaseModel):
    categories: list[str]
    revenue: list[float]
    percentages: list[float]

class HeatmapResponse(BaseModel):
    days: list[str]
    hours: list[int]
    z_values: list[list[float]]

class Variant11AvgCheckResponse(BaseModel):
    categories: list[str]
    clinics: list[str]
    avg_check_matrix: list[list[float]]

class DetailTableResponse(BaseModel):
    total_count: int
    rows: list[dict]

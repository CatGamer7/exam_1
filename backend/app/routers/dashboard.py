from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import date
from app.db import get_df
from app.schemas import DashboardFilters, KPIResponse, MonthlyTrendResponse, CategoryStructureResponse, HeatmapResponse, Variant11AvgCheckResponse, DetailTableResponse
import pandas as pd

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def get_filters(
    date_from: Optional[date] = None, 
    date_to: Optional[date] = None,
    regions: Optional[str] = Query(None), 
    categories: Optional[str] = Query(None), 
    clinics: Optional[str] = Query(None)
) -> DashboardFilters:
    def parse_list(val: Optional[str], type_func=str) -> Optional[list]:
        if not val: return None
        return [type_func(v.strip()) for v in val.split(",") if v.strip()]
        
    return DashboardFilters(
        date_from=date_from, 
        date_to=date_to,
        regions=parse_list(regions), 
        categories=parse_list(categories),
        clinics=parse_list(clinics)
    )

def apply_filters(df: pd.DataFrame, f: DashboardFilters) -> pd.DataFrame:
    if f.date_from: df = df[df['appointment_date'] >= pd.to_datetime(f.date_from)]
    if f.date_to: df = df[df['appointment_date'] <= pd.to_datetime(f.date_to)]
    if f.regions: df = df[df['patient_region'].isin(f.regions)]
    if f.categories: df = df[df['category'].isin(f.categories)]
    if f.clinics: df = df[df['clinic_name'].isin(f.clinics)]
    return df

@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    rev = df['revenue'].sum()
    gross = df['revenue_gross'].sum()
    return KPIResponse(
        total_revenue=round(rev, 2),
        total_operations=len(df),
        unique_clients=df['patient_id'].nunique(),
        avg_check=round(rev / len(df), 2) if len(df) > 0 else 0,
        weighted_discount_pct=round((gross - rev) / gross * 100, 2) if gross > 0 else 0
    )

@router.get("/trends/monthly", response_model=MonthlyTrendResponse)
async def get_monthly_trend(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    monthly = df.groupby(df['month'].dt.to_period('M'))['revenue'].sum().sort_index()
    return MonthlyTrendResponse(
        months=[str(p) for p in monthly.index],
        revenue=monthly.values.tolist(),
        min_month_idx=int(monthly.values.argmin()),
        max_month_idx=int(monthly.values.argmax())
    )

@router.get("/structure/categories", response_model=CategoryStructureResponse)
async def get_category_structure(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    cat_rev = df.groupby('category')['revenue'].sum().sort_values(ascending=False)
    total = cat_rev.sum()
    return CategoryStructureResponse(
        categories=cat_rev.index.tolist(),
        revenue=cat_rev.values.tolist(),
        percentages=(cat_rev / total * 100).round(2).values.tolist() if total > 0 else []
    )

@router.get("/structure/volume")
async def get_category_volume(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    cat_vol = df.groupby('category').size().sort_values(ascending=False)
    return {
        "categories": cat_vol.index.tolist(),
        "volume": cat_vol.values.tolist()
    }

@router.get("/structure/discounts")
async def get_discount_distribution(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    dist = df.groupby('discount_pct').size().sort_index()
    return {
        "discounts": [int(d) for d in dist.index.tolist()],
        "counts": dist.values.tolist()
    }

@router.get("/activity/heatmap", response_model=HeatmapResponse)
async def get_heatmap(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    pivot = df.pivot_table(index='day_of_week', columns='hour', values='revenue', aggfunc='sum', fill_value=0)
    pivot = pivot.reindex(index=range(7), columns=range(24), fill_value=0)
    return HeatmapResponse(
        days=["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        hours=list(range(24)),
        z_values=pivot.values.tolist()
    )

@router.get("/variant11/avg_check", response_model=Variant11AvgCheckResponse)
async def get_variant11(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    pivot = df.pivot_table(index='clinic_name', columns='category', values='revenue', aggfunc='mean', fill_value=0)
    return Variant11AvgCheckResponse(
        categories=list(pivot.columns),
        clinics=list(pivot.index),
        avg_check_matrix=pivot.round(2).values.tolist()
    )

@router.get("/details", response_model=DetailTableResponse)
async def get_details(f: DashboardFilters = Depends(get_filters)):
    df = apply_filters(await get_df(), f)
    cols = ['appointment_date', 'clinic_name', 'category', 'service_name', 'quantity', 'revenue', 'patient_region']
    return DetailTableResponse(
        total_count=len(df),
        rows=df[cols].to_dict(orient='records')
    )

@router.get("/meta")
async def get_meta():
    df = await get_df()
    regions = sorted(df['patient_region'].dropna().unique().tolist())
    categories = sorted(df['category'].dropna().unique().tolist())
    clinics = sorted(df['clinic_name'].dropna().unique().tolist())
    return {
        "regions": regions, 
        "categories": categories, 
        "clinics": clinics
    }
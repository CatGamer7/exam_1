import pandas as pd
import os
from sqlalchemy import create_engine

DB_URL = os.getenv("DATABASE_URL", "postgresql://admin:secret@db:5432/dental_bi")
CSV_PATH = os.getenv("CSV_PATH", "/data/dataset_clean.csv")

def main():
    print(f"Connecting to DB and reading {CSV_PATH}...")
    engine = create_engine(DB_URL)
    
    # Read the CSV exported from Part A
    df = pd.read_csv(CSV_PATH, encoding='utf-8')
    
    # Map Russian columns from Part A to our DB schema
    col_map = {
        'Дата и время': 'appointment_date', 'Месяц (строка)': 'month',
        'День недели': 'day_of_week', 'Час': 'hour', 'Номер недели': 'week_number',
        'ID позиции': 'service_id', 'Наименование': 'service_name', 'Категория': 'category',
        'Цена, руб.': 'price', 'Количество': 'quantity', 'Скидка, %': 'discount_pct',
        'Выручка': 'revenue', 'Выручка со скидкой': 'revenue_gross', 'Скидка в рублях': 'discount_rub',
        'ID клиента': 'patient_id', 'Регион пациента': 'patient_region',
        'ID подразделения': 'clinic_id', 'Название клиники': 'clinic_name', 'Регион подразделения': 'clinic_region'
    }
    
    df = df.rename(columns=col_map)
    df['month'] = pd.to_datetime(df['month'].astype(str) + '-01')
    
    db_cols = list(col_map.values())
    df = df[db_cols]
    
    print("Loading data into Postgres...")
    df.to_sql('dashboard_data', engine, if_exists='replace', index=False, chunksize=1000)
    print("Ingestion complete!")

if __name__ == "__main__":
    main()
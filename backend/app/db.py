import pandas as pd
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:secret@db:5432/dental_bi")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Global DataFrame cache for fast in-memory filtering
_df_cache: pd.DataFrame | None = None

async def get_df() -> pd.DataFrame:
    global _df_cache
    if _df_cache is None:
        async with engine.connect() as conn:
            # 1. Execute the query asynchronously
            result = await conn.execute(text("SELECT * FROM dashboard_data"))
            rows = result.fetchall()
            columns = list(result.keys())
            
        # 2. Construct the DataFrame directly from the fetched rows
        _df_cache = pd.DataFrame(rows, columns=columns)
        
        # 3. Ensure datetime columns are properly typed for filtering
        _df_cache['appointment_date'] = pd.to_datetime(_df_cache['appointment_date'])
        _df_cache['month'] = pd.to_datetime(_df_cache['month'])
        _df_cache['patient_region'] = _df_cache['patient_region'].fillna('Не указан')
        
    return _df_cache
import os
import alpaca_trade_api as tradeapi
from typing import Dict, List, Optional
import pandas as pd

class AlpacaClient:
    def __init__(self):
        self.api_key = os.getenv("ALPACA_API_KEY")
        self.secret_key = os.getenv("ALPACA_SECRET_KEY")
        self.base_url = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
        
        self.api = tradeapi.REST(
            self.api_key,
            self.secret_key,
            self.base_url,
            api_version='v2'
        )
    
    def get_bars(self, symbol: str, timeframe: str = '1D', limit: int = 100) -> pd.DataFrame:
        """주식 데이터 가져오기"""
        try:
            bars = self.api.get_bars(symbol, timeframe, limit=limit)
            df = bars.df
            return df
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return pd.DataFrame()
    
    def get_current_price(self, symbol: str) -> Optional[float]:
        """현재 가격 가져오기"""
        try:
            ticker = self.api.get_latest_trade(symbol)
            return ticker.price
        except Exception as e:
            print(f"Error fetching current price for {symbol}: {e}")
            return None
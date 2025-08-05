import os
import alpaca_trade_api as tradeapi
from typing import Dict, List, Optional
import pandas as pd

class AlpacaClient:
    def __init__(self):
        self.api_key = os.getenv("ALPACA_API_KEY", "demo_key")
        self.secret_key = os.getenv("ALPACA_SECRET_KEY", "demo_secret")
        self.base_url = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
        
        # API 키가 없으면 데모 모드
        if self.api_key == "demo_key":
            self.demo_mode = True
            self.api = None
        else:
            self.demo_mode = False
            self.api = tradeapi.REST(
                self.api_key,
                self.secret_key,
                self.base_url,
                api_version='v2'
            )
    
    def get_bars(self, symbol: str, timeframe: str = '1D', limit: int = 100) -> pd.DataFrame:
        """주식 데이터 가져오기"""
        if self.demo_mode:
            # 데모 모드: 가짜 데이터 생성
            return self._generate_demo_data(symbol, limit)
        
        try:
            bars = self.api.get_bars(symbol, timeframe, limit=limit)
            df = bars.df
            return df
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return self._generate_demo_data(symbol, limit)
    
    def get_current_price(self, symbol: str) -> Optional[float]:
        """현재 가격 가져오기"""
        if self.demo_mode:
            # 데모 모드: 가짜 가격 반환
            import random
            base_prices = {'AAPL': 150, 'TSLA': 250, 'SPY': 450, 'GOOGL': 140, 'MSFT': 380}
            base_price = base_prices.get(symbol, 100)
            return base_price + random.uniform(-10, 10)
        
        try:
            ticker = self.api.get_latest_trade(symbol)
            return ticker.price
        except Exception as e:
            print(f"Error fetching current price for {symbol}: {e}")
            return None
    
    def _generate_demo_data(self, symbol: str, limit: int) -> pd.DataFrame:
        """데모용 가짜 데이터 생성"""
        import random
        from datetime import datetime, timedelta
        
        base_prices = {'AAPL': 150, 'TSLA': 250, 'SPY': 450, 'GOOGL': 140, 'MSFT': 380}
        base_price = base_prices.get(symbol, 100)
        
        data = []
        current_date = datetime.now()
        
        for i in range(limit):
            date = current_date - timedelta(days=limit-i-1)
            price_change = random.uniform(-0.02, 0.02)  # ±2% 변동
            close_price = base_price * (1 + price_change)
            open_price = close_price * random.uniform(0.98, 1.02)
            high_price = max(open_price, close_price) * random.uniform(1.0, 1.03)
            low_price = min(open_price, close_price) * random.uniform(0.97, 1.0)
            volume = random.randint(1000000, 10000000)
            
            data.append({
                'open': open_price,
                'high': high_price,
                'low': low_price,
                'close': close_price,
                'volume': volume
            })
            
            base_price = close_price
        
        df = pd.DataFrame(data)
        df.index = pd.date_range(current_date - timedelta(days=limit-1), current_date, freq='D')
        return df
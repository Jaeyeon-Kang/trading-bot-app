import pandas as pd
import numpy as np
import talib

class TechnicalIndicators:
    @staticmethod
    def calculate_ema(df: pd.DataFrame, period: int) -> pd.Series:
        """EMA (Exponential Moving Average) 계산"""
        return talib.EMA(df['close'], timeperiod=period)
    
    @staticmethod
    def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """RSI (Relative Strength Index) 계산"""
        return talib.RSI(df['close'], timeperiod=period)
    
    @staticmethod
    def calculate_bollinger_bands(df: pd.DataFrame, period: int = 20, std_dev: float = 2) -> tuple:
        """볼린저 밴드 계산"""
        upper, middle, lower = talib.BBANDS(
            df['close'], 
            timeperiod=period, 
            nbdevup=std_dev, 
            nbdevdn=std_dev
        )
        return upper, middle, lower
    
    @staticmethod
    def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
        """MACD 계산"""
        macd, signal_line, histogram = talib.MACD(
            df['close'], 
            fastperiod=fast, 
            slowperiod=slow, 
            signalperiod=signal
        )
        return macd, signal_line, histogram
    
    @staticmethod
    def ema_crossover(df: pd.DataFrame, fast_period: int = 12, slow_period: int = 26) -> dict:
        """EMA 크로스오버 신호"""
        fast_ema = TechnicalIndicators.calculate_ema(df, fast_period)
        slow_ema = TechnicalIndicators.calculate_ema(df, slow_period)
        
        # 크로스오버 확인
        crossover_buy = (fast_ema > slow_ema) & (fast_ema.shift(1) <= slow_ema.shift(1))
        crossover_sell = (fast_ema < slow_ema) & (fast_ema.shift(1) >= slow_ema.shift(1))
        
        return {
            'fast_ema': fast_ema,
            'slow_ema': slow_ema,
            'buy_signal': crossover_buy,
            'sell_signal': crossover_sell
        }
from typing import Dict, List, Optional
import pandas as pd
from datetime import datetime
from ..data_collection.alpaca_client import AlpacaClient
from ..indicators.technical_indicators import TechnicalIndicators

class SignalGenerator:
    def __init__(self):
        self.alpaca_client = AlpacaClient()
        self.indicators = TechnicalIndicators()
    
    def check_ema_crossover(self, symbol: str, fast_period: int = 12, slow_period: int = 26) -> Optional[Dict]:
        """EMA 크로스오버 신호 확인"""
        try:
            # 데이터 가져오기
            df = self.alpaca_client.get_bars(symbol, '1D', 50)
            if df.empty:
                return None
            
            # EMA 크로스오버 계산
            result = self.indicators.ema_crossover(df, fast_period, slow_period)
            
            # 최신 신호 확인
            latest_buy = result['buy_signal'].iloc[-1] if len(result['buy_signal']) > 0 else False
            latest_sell = result['sell_signal'].iloc[-1] if len(result['sell_signal']) > 0 else False
            
            if latest_buy:
                return {
                    'symbol': symbol,
                    'type': 'BUY',
                    'strategy': 'ema_crossover',
                    'reason': f'EMA{fast_period} crossed above EMA{slow_period}',
                    'timestamp': datetime.now().isoformat(),
                    'price': df['close'].iloc[-1],
                    'fast_ema': result['fast_ema'].iloc[-1],
                    'slow_ema': result['slow_ema'].iloc[-1]
                }
            elif latest_sell:
                return {
                    'symbol': symbol,
                    'type': 'SELL',
                    'strategy': 'ema_crossover',
                    'reason': f'EMA{fast_period} crossed below EMA{slow_period}',
                    'timestamp': datetime.now().isoformat(),
                    'price': df['close'].iloc[-1],
                    'fast_ema': result['fast_ema'].iloc[-1],
                    'slow_ema': result['slow_ema'].iloc[-1]
                }
            
            return None
            
        except Exception as e:
            print(f"Error checking EMA crossover for {symbol}: {e}")
            return None
    
    def check_rsi_signals(self, symbol: str, period: int = 14, oversold: int = 30, overbought: int = 70) -> Optional[Dict]:
        """RSI 신호 확인"""
        try:
            df = self.alpaca_client.get_bars(symbol, '1D', 50)
            if df.empty:
                return None
            
            rsi = self.indicators.calculate_rsi(df, period)
            current_rsi = rsi.iloc[-1]
            previous_rsi = rsi.iloc[-2] if len(rsi) > 1 else current_rsi
            
            # RSI 신호 조건
            if current_rsi < oversold and previous_rsi >= oversold:
                return {
                    'symbol': symbol,
                    'type': 'BUY',
                    'strategy': 'rsi_oversold',
                    'reason': f'RSI oversold ({current_rsi:.2f})',
                    'timestamp': datetime.now().isoformat(),
                    'price': df['close'].iloc[-1],
                    'rsi': current_rsi
                }
            elif current_rsi > overbought and previous_rsi <= overbought:
                return {
                    'symbol': symbol,
                    'type': 'SELL',
                    'strategy': 'rsi_overbought',
                    'reason': f'RSI overbought ({current_rsi:.2f})',
                    'timestamp': datetime.now().isoformat(),
                    'price': df['close'].iloc[-1],
                    'rsi': current_rsi
                }
            
            return None
            
        except Exception as e:
            print(f"Error checking RSI signals for {symbol}: {e}")
            return None
    
    def scan_symbols(self, symbols: List[str]) -> List[Dict]:
        """여러 심볼 스캔"""
        signals = []
        
        for symbol in symbols:
            # EMA 크로스오버 체크
            ema_signal = self.check_ema_crossover(symbol)
            if ema_signal:
                signals.append(ema_signal)
            
            # RSI 신호 체크
            rsi_signal = self.check_rsi_signals(symbol)
            if rsi_signal:
                signals.append(rsi_signal)
        
        return signals
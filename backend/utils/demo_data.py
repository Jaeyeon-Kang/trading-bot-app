import random
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict

def generate_demo_signals() -> List[Dict]:
    """데모용 신호 데이터 생성"""
    symbols = ['AAPL', 'TSLA', 'SPY', 'GOOGL', 'MSFT']
    signal_types = ['BUY', 'SELL']
    strategies = ['ema_crossover', 'rsi_oversold', 'rsi_overbought']
    
    signals = []
    
    for i in range(random.randint(2, 5)):
        symbol = random.choice(symbols)
        signal_type = random.choice(signal_types)
        strategy = random.choice(strategies)
        
        # 가격 생성
        base_prices = {'AAPL': 150, 'TSLA': 250, 'SPY': 450, 'GOOGL': 140, 'MSFT': 380}
        base_price = base_prices.get(symbol, 100)
        price = base_price + random.uniform(-20, 20)
        
        # 신호 이유 생성
        if strategy == 'ema_crossover':
            reason = f"EMA12 crossed above EMA26" if signal_type == 'BUY' else f"EMA12 crossed below EMA26"
        elif strategy == 'rsi_oversold':
            reason = f"RSI oversold ({random.randint(20, 30)})"
        else:
            reason = f"RSI overbought ({random.randint(70, 80)})"
        
        signal = {
            'symbol': symbol,
            'type': signal_type,
            'strategy': strategy,
            'reason': reason,
            'timestamp': datetime.now().isoformat(),
            'price': round(price, 2)
        }
        
        signals.append(signal)
    
    return signals

def generate_demo_strategies() -> List[Dict]:
    """데모용 전략 데이터 생성"""
    strategies = [
        {
            'symbol': 'AAPL',
            'rule': 'ema_cross',
            'params': {'fast': 12, 'slow': 26},
            'stop': -5,
            'take': 8,
            'created_at': '2024-01-01T00:00:00Z',
            'active': True
        },
        {
            'symbol': 'TSLA',
            'rule': 'ema_cross',
            'params': {'fast': 12, 'slow': 26},
            'stop': -5,
            'take': 8,
            'created_at': '2024-01-01T00:00:00Z',
            'active': True
        },
        {
            'symbol': 'SPY',
            'rule': 'rsi',
            'params': {'period': 14, 'oversold': 30, 'overbought': 70},
            'stop': -3,
            'take': 5,
            'created_at': '2024-01-01T00:00:00Z',
            'active': False
        }
    ]
    
    return strategies
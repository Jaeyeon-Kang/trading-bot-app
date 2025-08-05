from typing import Dict, List, Optional
import json
from datetime import datetime

class Strategy:
    def __init__(self, symbol: str, rule: str, params: Dict, stop: float = -5, take: float = 8):
        self.symbol = symbol
        self.rule = rule
        self.params = params
        self.stop_loss = stop
        self.take_profit = take
        self.created_at = datetime.now().isoformat()
        self.active = True
    
    def to_dict(self) -> Dict:
        return {
            'symbol': self.symbol,
            'rule': self.rule,
            'params': self.params,
            'stop': self.stop_loss,
            'take': self.take_profit,
            'created_at': self.created_at,
            'active': self.active
        }

class StrategyManager:
    def __init__(self):
        self.strategies: List[Strategy] = []
        self._load_default_strategies()
    
    def _load_default_strategies(self):
        """기본 전략들 로드"""
        default_strategies = [
            {
                'symbol': 'AAPL',
                'rule': 'ema_cross',
                'params': {'fast': 12, 'slow': 26},
                'stop': -5,
                'take': 8
            },
            {
                'symbol': 'TSLA',
                'rule': 'ema_cross',
                'params': {'fast': 12, 'slow': 26},
                'stop': -5,
                'take': 8
            },
            {
                'symbol': 'SPY',
                'rule': 'rsi',
                'params': {'period': 14, 'oversold': 30, 'overbought': 70},
                'stop': -3,
                'take': 5
            }
        ]
        
        for strategy_data in default_strategies:
            strategy = Strategy(
                symbol=strategy_data['symbol'],
                rule=strategy_data['rule'],
                params=strategy_data['params'],
                stop=strategy_data['stop'],
                take=strategy_data['take']
            )
            self.strategies.append(strategy)
    
    def add_strategy(self, strategy_data: Dict) -> Strategy:
        """새 전략 추가"""
        strategy = Strategy(
            symbol=strategy_data['symbol'],
            rule=strategy_data['rule'],
            params=strategy_data['params'],
            stop=strategy_data.get('stop', -5),
            take=strategy_data.get('take', 8)
        )
        self.strategies.append(strategy)
        return strategy
    
    def remove_strategy(self, symbol: str, rule: str) -> bool:
        """전략 제거"""
        for i, strategy in enumerate(self.strategies):
            if strategy.symbol == symbol and strategy.rule == rule:
                del self.strategies[i]
                return True
        return False
    
    def get_strategies(self) -> List[Dict]:
        """모든 전략 반환"""
        return [strategy.to_dict() for strategy in self.strategies]
    
    def get_active_strategies(self) -> List[Strategy]:
        """활성 전략들 반환"""
        return [strategy for strategy in self.strategies if strategy.active]
    
    def get_symbols(self) -> List[str]:
        """모든 심볼 반환"""
        return list(set([strategy.symbol for strategy in self.strategies]))
    
    def toggle_strategy(self, symbol: str, rule: str) -> bool:
        """전략 활성화/비활성화 토글"""
        for strategy in self.strategies:
            if strategy.symbol == symbol and strategy.rule == rule:
                strategy.active = not strategy.active
                return True
        return False
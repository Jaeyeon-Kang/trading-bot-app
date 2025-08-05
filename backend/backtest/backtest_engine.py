from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dataclasses import dataclass
from ..data_collection.alpaca_client import AlpacaClient
from ..indicators.technical_indicators import TechnicalIndicators

@dataclass
class Trade:
    """거래 기록"""
    entry_date: datetime
    exit_date: Optional[datetime]
    symbol: str
    entry_price: float
    exit_price: Optional[float]
    quantity: int
    side: str  # 'BUY' or 'SELL'
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    strategy: str = ''
    reason: str = ''

@dataclass
class BacktestResult:
    """백테스트 결과"""
    total_return: float
    annualized_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    avg_win: float
    avg_loss: float
    profit_factor: float
    trades: List[Trade]
    equity_curve: pd.Series

class BacktestEngine:
    def __init__(self):
        self.alpaca_client = AlpacaClient()
        self.indicators = TechnicalIndicators()
        self.initial_capital = 100000  # 초기 자본
        self.commission = 0.001  # 수수료 0.1%
        
    def run_backtest(self, 
                    strategy_config: Dict,
                    start_date: str,
                    end_date: str,
                    initial_capital: float = 100000) -> BacktestResult:
        """
        백테스트 실행
        
        Args:
            strategy_config: 전략 설정
            start_date: 시작일 (YYYY-MM-DD)
            end_date: 종료일 (YYYY-MM-DD)
            initial_capital: 초기 자본
        """
        self.initial_capital = initial_capital
        symbol = strategy_config['symbol']
        rule = strategy_config['rule']
        params = strategy_config.get('params', {})
        stop_loss = strategy_config.get('stop', -5) / 100  # 퍼센트를 소수로
        take_profit = strategy_config.get('take', 8) / 100
        
        # 데이터 가져오기
        df = self._get_historical_data(symbol, start_date, end_date)
        if df.empty:
            raise ValueError(f"No data available for {symbol}")
        
        # 신호 생성
        signals = self._generate_signals(df, rule, params)
        
        # 거래 실행
        trades = self._execute_trades(df, signals, symbol, stop_loss, take_profit)
        
        # 성과 분석
        result = self._calculate_performance(trades, df)
        
        return result
    
    def _get_historical_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """과거 데이터 가져오기"""
        try:
            # 실제로는 Alpaca API에서 과거 데이터 가져오기
            # 현재는 데모 데이터 생성
            return self._generate_demo_historical_data(symbol, start_date, end_date)
        except Exception as e:
            print(f"Error fetching historical data: {e}")
            return pd.DataFrame()
    
    def _generate_demo_historical_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """데모용 과거 데이터 생성"""
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        # 기본 가격 설정
        base_prices = {'AAPL': 150, 'TSLA': 250, 'SPY': 450, 'GOOGL': 140, 'MSFT': 380}
        base_price = base_prices.get(symbol, 100)
        
        dates = pd.date_range(start, end, freq='D')
        data = []
        
        current_price = base_price
        for date in dates:
            # 주말 제외
            if date.weekday() >= 5:
                continue
                
            # 가격 변동 (랜덤 워크)
            change = np.random.normal(0, 0.02)  # 평균 0%, 표준편차 2%
            current_price *= (1 + change)
            
            # OHLC 생성
            daily_volatility = np.random.uniform(0.01, 0.03)
            open_price = current_price * (1 + np.random.uniform(-daily_volatility, daily_volatility))
            high_price = max(open_price, current_price) * (1 + np.random.uniform(0, daily_volatility))
            low_price = min(open_price, current_price) * (1 - np.random.uniform(0, daily_volatility))
            close_price = current_price
            
            volume = np.random.randint(1000000, 10000000)
            
            data.append({
                'date': date,
                'open': open_price,
                'high': high_price,
                'low': low_price,
                'close': close_price,
                'volume': volume
            })
        
        df = pd.DataFrame(data)
        df.set_index('date', inplace=True)
        return df
    
    def _generate_signals(self, df: pd.DataFrame, rule: str, params: Dict) -> pd.Series:
        """신호 생성"""
        signals = pd.Series(index=df.index, data=0)  # 0: 없음, 1: 매수, -1: 매도
        
        if rule == 'ema_cross':
            fast_period = params.get('fast', 12)
            slow_period = params.get('slow', 26)
            
            fast_ema = self.indicators.calculate_ema(df, fast_period)
            slow_ema = self.indicators.calculate_ema(df, slow_period)
            
            # 골든크로스 (매수)
            buy_signals = (fast_ema > slow_ema) & (fast_ema.shift(1) <= slow_ema.shift(1))
            # 데드크로스 (매도)
            sell_signals = (fast_ema < slow_ema) & (fast_ema.shift(1) >= slow_ema.shift(1))
            
            signals[buy_signals] = 1
            signals[sell_signals] = -1
            
        elif rule == 'rsi':
            period = params.get('period', 14)
            oversold = params.get('oversold', 30)
            overbought = params.get('overbought', 70)
            
            rsi = self.indicators.calculate_rsi(df, period)
            
            # RSI 과매도 (매수)
            buy_signals = (rsi < oversold) & (rsi.shift(1) >= oversold)
            # RSI 과매수 (매도)
            sell_signals = (rsi > overbought) & (rsi.shift(1) <= overbought)
            
            signals[buy_signals] = 1
            signals[sell_signals] = -1
        
        return signals
    
    def _execute_trades(self, df: pd.DataFrame, signals: pd.Series, 
                       symbol: str, stop_loss: float, take_profit: float) -> List[Trade]:
        """거래 실행"""
        trades = []
        current_position = None
        entry_price = 0
        entry_date = None
        
        for date, signal in signals.items():
            if signal == 1 and current_position is None:  # 매수 신호
                current_position = 'LONG'
                entry_price = df.loc[date, 'close']
                entry_date = date
                
            elif signal == -1 and current_position == 'LONG':  # 매도 신호
                exit_price = df.loc[date, 'close']
                pnl = exit_price - entry_price
                pnl_percent = (pnl / entry_price) * 100
                
                trade = Trade(
                    entry_date=entry_date,
                    exit_date=date,
                    symbol=symbol,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    quantity=1,
                    side='LONG',
                    pnl=pnl,
                    pnl_percent=pnl_percent,
                    strategy='ema_cross',
                    reason='Signal exit'
                )
                trades.append(trade)
                
                current_position = None
                entry_price = 0
                entry_date = None
            
            # Stop Loss / Take Profit 체크
            elif current_position == 'LONG':
                current_price = df.loc[date, 'close']
                price_change = (current_price - entry_price) / entry_price
                
                if price_change <= stop_loss or price_change >= take_profit:
                    pnl = current_price - entry_price
                    pnl_percent = price_change * 100
                    
                    trade = Trade(
                        entry_date=entry_date,
                        exit_date=date,
                        symbol=symbol,
                        entry_price=entry_price,
                        exit_price=current_price,
                        quantity=1,
                        side='LONG',
                        pnl=pnl,
                        pnl_percent=pnl_percent,
                        strategy='ema_cross',
                        reason='Stop Loss' if price_change <= stop_loss else 'Take Profit'
                    )
                    trades.append(trade)
                    
                    current_position = None
                    entry_price = 0
                    entry_date = None
        
        return trades
    
    def _calculate_performance(self, trades: List[Trade], df: pd.DataFrame) -> BacktestResult:
        """성과 계산"""
        if not trades:
            return BacktestResult(
                total_return=0, annualized_return=0, sharpe_ratio=0,
                max_drawdown=0, win_rate=0, total_trades=0,
                winning_trades=0, losing_trades=0, avg_win=0,
                avg_loss=0, profit_factor=0, trades=[], equity_curve=pd.Series()
            )
        
        # 기본 통계
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.pnl > 0])
        losing_trades = len([t for t in trades if t.pnl < 0])
        
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        # 수익률 계산
        total_pnl = sum(t.pnl for t in trades)
        total_return = (total_pnl / self.initial_capital) * 100
        
        # 연간 수익률 (대략적 계산)
        if trades:
            start_date = trades[0].entry_date
            end_date = trades[-1].exit_date
            days = (end_date - start_date).days
            annualized_return = (total_return / days) * 365 if days > 0 else 0
        else:
            annualized_return = 0
        
        # 평균 수익/손실
        wins = [t.pnl for t in trades if t.pnl > 0]
        losses = [t.pnl for t in trades if t.pnl < 0]
        
        avg_win = np.mean(wins) if wins else 0
        avg_loss = np.mean(losses) if losses else 0
        
        # Profit Factor
        total_wins = sum(wins) if wins else 0
        total_losses = abs(sum(losses)) if losses else 0
        profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
        
        # Sharpe Ratio (간단한 계산)
        returns = [t.pnl_percent for t in trades]
        sharpe_ratio = np.mean(returns) / np.std(returns) if len(returns) > 1 and np.std(returns) > 0 else 0
        
        # Maximum Drawdown
        equity_curve = self._calculate_equity_curve(trades, df)
        max_drawdown = self._calculate_max_drawdown(equity_curve)
        
        return BacktestResult(
            total_return=total_return,
            annualized_return=annualized_return,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown,
            win_rate=win_rate,
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            avg_win=avg_win,
            avg_loss=avg_loss,
            profit_factor=profit_factor,
            trades=trades,
            equity_curve=equity_curve
        )
    
    def _calculate_equity_curve(self, trades: List[Trade], df: pd.DataFrame) -> pd.Series:
        """자본 곡선 계산"""
        equity = self.initial_capital
        equity_curve = pd.Series(index=df.index, data=equity)
        
        for trade in trades:
            # 거래 후 자본 업데이트
            equity += trade.pnl
            # 거래 종료일부터 자본 곡선 업데이트
            equity_curve[trade.exit_date:] = equity
        
        return equity_curve
    
    def _calculate_max_drawdown(self, equity_curve: pd.Series) -> float:
        """최대 낙폭 계산"""
        peak = equity_curve.expanding().max()
        drawdown = (equity_curve - peak) / peak * 100
        return abs(drawdown.min())
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os

from .signals.signal_generator import SignalGenerator
from .strategies.strategy_manager import StrategyManager
from .utils.demo_data import generate_demo_signals, generate_demo_strategies
from .backtest.backtest_engine import BacktestEngine
from .notifications.notification_manager import NotificationManager

app = FastAPI(title="Trading Signals API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 인스턴스
signal_generator = SignalGenerator()
strategy_manager = StrategyManager()
backtest_engine = BacktestEngine()
notification_manager = NotificationManager()

# Pydantic 모델들
class StrategyRequest(BaseModel):
    symbol: str
    rule: str
    params: Dict
    stop: float = -5
    take: float = 8

class SignalResponse(BaseModel):
    symbol: str
    type: str
    strategy: str
    reason: str
    timestamp: str
    price: float

class BacktestRequest(BaseModel):
    strategy: Dict
    start_date: str
    end_date: str
    initial_capital: float = 100000

@app.get("/")
async def root():
    return {"message": "Trading Signals API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.get("/signals")
async def get_signals():
    """현재 활성 신호들 반환"""
    try:
        # 데모 모드에서는 가짜 신호 반환
        return generate_demo_signals()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals/{symbol}")
async def get_signals_for_symbol(symbol: str):
    """특정 심볼의 신호 확인"""
    try:
        ema_signal = signal_generator.check_ema_crossover(symbol)
        rsi_signal = signal_generator.check_rsi_signals(symbol)
        
        signals = []
        if ema_signal:
            signals.append(ema_signal)
        if rsi_signal:
            signals.append(rsi_signal)
        
        return signals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies")
async def get_strategies():
    """모든 전략 반환"""
    try:
        # 데모 모드에서는 가짜 전략 반환
        return generate_demo_strategies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies")
async def add_strategy(strategy: StrategyRequest):
    """새 전략 추가"""
    try:
        new_strategy = strategy_manager.add_strategy(strategy.dict())
        return new_strategy.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/strategies/{symbol}/{rule}")
async def remove_strategy(symbol: str, rule: str):
    """전략 제거"""
    success = strategy_manager.remove_strategy(symbol, rule)
    if not success:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {"message": "Strategy removed successfully"}

@app.put("/strategies/{symbol}/{rule}/toggle")
async def toggle_strategy(symbol: str, rule: str):
    """전략 활성화/비활성화 토글"""
    success = strategy_manager.toggle_strategy(symbol, rule)
    if not success:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {"message": "Strategy toggled successfully"}

@app.get("/symbols")
async def get_symbols():
    """모든 심볼 반환"""
    return strategy_manager.get_symbols()

@app.get("/scan")
async def scan_all():
    """전체 스캔 실행"""
    try:
        symbols = strategy_manager.get_symbols()
        if not symbols:
            symbols = ['AAPL', 'TSLA', 'SPY']
        
        signals = signal_generator.scan_symbols(symbols)
        return {
            "scanned_symbols": symbols,
            "signals_found": len(signals),
            "signals": signals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtest")
async def run_backtest(request: BacktestRequest):
    """백테스트 실행"""
    try:
        result = backtest_engine.run_backtest(
            strategy_config=request.strategy,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital
        )
        
        # 거래 기록을 딕셔너리로 변환
        trades_data = []
        for trade in result.trades:
            trades_data.append({
                'entry_date': trade.entry_date.isoformat(),
                'exit_date': trade.exit_date.isoformat() if trade.exit_date else None,
                'symbol': trade.symbol,
                'entry_price': trade.entry_price,
                'exit_price': trade.exit_price,
                'pnl': trade.pnl,
                'pnl_percent': trade.pnl_percent,
                'reason': trade.reason
            })
        
        return {
            'total_return': result.total_return,
            'annualized_return': result.annualized_return,
            'sharpe_ratio': result.sharpe_ratio,
            'max_drawdown': result.max_drawdown,
            'win_rate': result.win_rate,
            'total_trades': result.total_trades,
            'winning_trades': result.winning_trades,
            'losing_trades': result.losing_trades,
            'avg_win': result.avg_win,
            'avg_loss': result.avg_loss,
            'profit_factor': result.profit_factor,
            'trades': trades_data,
            'equity_curve': result.equity_curve.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtest/quick/{symbol}")
async def quick_backtest(symbol: str):
    """빠른 백테스트 (최근 6개월)"""
    try:
        from datetime import datetime, timedelta
        
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
        
        strategy_config = {
            'symbol': symbol,
            'rule': 'ema_cross',
            'params': {'fast': 12, 'slow': 26},
            'stop': -5,
            'take': 8
        }
        
        result = backtest_engine.run_backtest(
            strategy_config=strategy_config,
            start_date=start_date,
            end_date=end_date,
            initial_capital=100000
        )
        
        return {
            'symbol': symbol,
            'period': f"{start_date} to {end_date}",
            'total_return': result.total_return,
            'win_rate': result.win_rate,
            'total_trades': result.total_trades,
            'max_drawdown': result.max_drawdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/status")
async def get_notification_status():
    """알림 상태 조회"""
    return {
        'enabled': notification_manager.notifications_enabled,
        'slack_enabled': notification_manager.slack_enabled,
        'telegram_enabled': notification_manager.telegram_enabled,
        'stats': notification_manager.get_notification_stats()
    }

@app.post("/notifications/test")
async def test_notification(channel: str = 'all'):
    """테스트 알림 전송"""
    try:
        success = notification_manager.test_notification(channel)
        return {
            'success': success,
            'channel': channel,
            'message': 'Test notification sent successfully' if success else 'Failed to send test notification'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/history")
async def get_notification_history(limit: int = 50):
    """알림 히스토리 조회"""
    try:
        history = notification_manager.get_notification_history(limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/toggle")
async def toggle_notifications(enabled: bool):
    """알림 활성화/비활성화"""
    try:
        notification_manager.toggle_notifications(enabled)
        return {
            'success': True,
            'enabled': enabled,
            'message': f'Notifications {"enabled" if enabled else "disabled"}'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
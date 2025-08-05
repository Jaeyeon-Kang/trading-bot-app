from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os

from .signals.signal_generator import SignalGenerator
from .strategies.strategy_manager import StrategyManager
from .utils.demo_data import generate_demo_signals, generate_demo_strategies

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
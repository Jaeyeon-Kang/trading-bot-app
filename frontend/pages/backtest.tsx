import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface BacktestResult {
  total_return: number
  annualized_return: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  total_trades: number
  winning_trades: number
  losing_trades: number
  avg_win: number
  avg_loss: number
  profit_factor: number
  trades: Array<{
    entry_date: string
    exit_date: string
    symbol: string
    entry_price: number
    exit_price: number
    pnl: number
    pnl_percent: number
    reason: string
  }>
  equity_curve: Record<string, number>
}

export default function Backtest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [config, setConfig] = useState({
    symbol: 'AAPL',
    rule: 'ema_cross',
    params: { fast: 12, slow: 26 },
    stop: -5,
    take: 8,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    initial_capital: 100000
  })

  const runBacktest = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: {
            symbol: config.symbol,
            rule: config.rule,
            params: config.params,
            stop: config.stop,
            take: config.take
          },
          start_date: config.start_date,
          end_date: config.end_date,
          initial_capital: config.initial_capital
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error running backtest:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value: number, type: 'return' | 'ratio' | 'drawdown') => {
    if (type === 'drawdown') {
      return value < -10 ? 'text-red-600' : value < -5 ? 'text-yellow-600' : 'text-green-600'
    }
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Backtest - Trading Signals</title>
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📊 Strategy Backtest</h1>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 백테스트 설정 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Backtest Settings</h2>
              
              {/* 심볼 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol
                </label>
                <select
                  value={config.symbol}
                  onChange={(e) => setConfig({...config, symbol: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="AAPL">AAPL</option>
                  <option value="TSLA">TSLA</option>
                  <option value="SPY">SPY</option>
                  <option value="GOOGL">GOOGL</option>
                  <option value="MSFT">MSFT</option>
                </select>
              </div>

              {/* 전략 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy
                </label>
                <select
                  value={config.rule}
                  onChange={(e) => setConfig({...config, rule: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ema_cross">EMA Crossover</option>
                  <option value="rsi">RSI</option>
                </select>
              </div>

              {/* 파라미터 설정 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameters
                </label>
                {config.rule === 'ema_cross' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Fast EMA"
                      value={config.params.fast}
                      onChange={(e) => setConfig({
                        ...config, 
                        params: {...config.params, fast: parseInt(e.target.value)}
                      })}
                      className="p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Slow EMA"
                      value={config.params.slow}
                      onChange={(e) => setConfig({
                        ...config, 
                        params: {...config.params, slow: parseInt(e.target.value)}
                      })}
                      className="p-2 border rounded-md"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Period"
                      value={config.params.period || 14}
                      onChange={(e) => setConfig({
                        ...config, 
                        params: {...config.params, period: parseInt(e.target.value)}
                      })}
                      className="p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Oversold"
                      value={config.params.oversold || 30}
                      onChange={(e) => setConfig({
                        ...config, 
                        params: {...config.params, oversold: parseInt(e.target.value)}
                      })}
                      className="p-2 border rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* 리스크 관리 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Management
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Stop Loss %"
                    value={config.stop}
                    onChange={(e) => setConfig({...config, stop: parseFloat(e.target.value)})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Take Profit %"
                    value={config.take}
                    onChange={(e) => setConfig({...config, take: parseFloat(e.target.value)})}
                    className="p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* 기간 설정 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={config.start_date}
                    onChange={(e) => setConfig({...config, start_date: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="date"
                    value={config.end_date}
                    onChange={(e) => setConfig({...config, end_date: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* 초기 자본 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Capital
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={config.initial_capital}
                  onChange={(e) => setConfig({...config, initial_capital: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* 백테스트 실행 버튼 */}
              <button
                onClick={runBacktest}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Backtest...
                  </div>
                ) : (
                  '🚀 Run Backtest'
                )}
              </button>
            </div>
          </div>

          {/* 백테스트 결과 */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                {/* 성과 요약 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">📈 Performance Summary</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className={`text-2xl font-bold ${getPerformanceColor(result.total_return, 'return')}`}>
                        {formatPercent(result.total_return)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(result.win_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Sharpe Ratio</p>
                      <p className={`text-2xl font-bold ${getPerformanceColor(result.sharpe_ratio, 'ratio')}`}>
                        {result.sharpe_ratio.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Max Drawdown</p>
                      <p className={`text-2xl font-bold ${getPerformanceColor(result.max_drawdown, 'drawdown')}`}>
                        {formatPercent(-result.max_drawdown)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 상세 통계 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">📊 Detailed Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Trade Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Trades:</span>
                          <span className="font-medium">{result.total_trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Winning Trades:</span>
                          <span className="font-medium text-green-600">{result.winning_trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Losing Trades:</span>
                          <span className="font-medium text-red-600">{result.losing_trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit Factor:</span>
                          <span className="font-medium">{result.profit_factor.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Return Analysis</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Annualized Return:</span>
                          <span className={`font-medium ${getPerformanceColor(result.annualized_return, 'return')}`}>
                            {formatPercent(result.annualized_return)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Win:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(result.avg_win)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Loss:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(result.avg_loss)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total P&L:</span>
                          <span className={`font-medium ${getPerformanceColor(result.total_return, 'return')}`}>
                            {formatCurrency(result.total_return * config.initial_capital / 100)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 거래 기록 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">📋 Trade History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entry Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Exit Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entry Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Exit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">P&L</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {result.trades.map((trade, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              {new Date(trade.entry_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {new Date(trade.exit_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ${trade.entry_price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ${trade.exit_price.toFixed(2)}
                            </td>
                            <td className={`px-4 py-2 text-sm font-medium ${
                              trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.pnl)} ({formatPercent(trade.pnl_percent)})
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {trade.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Backtest
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Configure your strategy settings and run a backtest to see how it would have performed.
                  </p>
                  <div className="text-sm text-gray-400">
                    <p>• Test different parameters</p>
                    <p>• Analyze historical performance</p>
                    <p>• Optimize your strategy</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
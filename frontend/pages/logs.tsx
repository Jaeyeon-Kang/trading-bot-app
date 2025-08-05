import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface SignalLog {
  id: string
  timestamp: string
  symbol: string
  type: 'BUY' | 'SELL'
  strategy: string
  reason: string
  price: number
  strength: 'HIGH' | 'MEDIUM' | 'LOW'
  executed: boolean
  pnl?: number
}

interface TradeLog {
  id: string
  entry_date: string
  exit_date: string
  symbol: string
  entry_price: number
  exit_price: number
  quantity: number
  pnl: number
  pnl_percent: number
  strategy: string
  reason: string
}

export default function Logs() {
  const [activeTab, setActiveTab] = useState<'signals' | 'trades' | 'performance'>('signals')
  const [signals, setSignals] = useState<SignalLog[]>([])
  const [trades, setTrades] = useState<TradeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    symbol: '',
    strategy: '',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    // 데모 데이터 로드
    const demoSignals: SignalLog[] = [
      {
        id: '1',
        timestamp: '2024-01-15T10:30:00Z',
        symbol: 'AAPL',
        type: 'BUY',
        strategy: 'ema_crossover',
        reason: 'EMA12 crossed above EMA26',
        price: 152.34,
        strength: 'HIGH',
        executed: true,
        pnl: 5.67
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:20:00Z',
        symbol: 'TSLA',
        type: 'SELL',
        strategy: 'rsi',
        reason: 'RSI overbought (75.2)',
        price: 248.67,
        strength: 'MEDIUM',
        executed: false
      },
      {
        id: '3',
        timestamp: '2024-01-14T09:15:00Z',
        symbol: 'SPY',
        type: 'BUY',
        strategy: 'rsi',
        reason: 'RSI oversold (28.5)',
        price: 447.89,
        strength: 'MEDIUM',
        executed: true,
        pnl: -2.34
      }
    ]

    const demoTrades: TradeLog[] = [
      {
        id: '1',
        entry_date: '2024-01-10T10:30:00Z',
        exit_date: '2024-01-15T14:20:00Z',
        symbol: 'AAPL',
        entry_price: 150.00,
        exit_price: 155.67,
        quantity: 100,
        pnl: 567.00,
        pnl_percent: 3.78,
        strategy: 'ema_crossover',
        reason: 'Take Profit'
      },
      {
        id: '2',
        entry_date: '2024-01-08T11:45:00Z',
        exit_date: '2024-01-12T16:30:00Z',
        symbol: 'TSLA',
        entry_price: 245.00,
        exit_price: 240.50,
        quantity: 50,
        pnl: -225.00,
        pnl_percent: -1.84,
        strategy: 'rsi',
        reason: 'Stop Loss'
      }
    ]

    setSignals(demoSignals)
    setTrades(demoTrades)
    setLoading(false)
  }

  const filteredSignals = signals.filter(signal => {
    if (filters.symbol && signal.symbol !== filters.symbol) return false
    if (filters.strategy && signal.strategy !== filters.strategy) return false
    if (filters.type !== 'all' && signal.type !== filters.type) return false
    if (filters.dateFrom && signal.timestamp < filters.dateFrom) return false
    if (filters.dateTo && signal.timestamp > filters.dateTo) return false
    return true
  })

  const filteredTrades = trades.filter(trade => {
    if (filters.symbol && trade.symbol !== filters.symbol) return false
    if (filters.strategy && trade.strategy !== filters.strategy) return false
    if (filters.dateFrom && trade.entry_date < filters.dateFrom) return false
    if (filters.dateTo && trade.exit_date > filters.dateTo) return false
    return true
  })

  const performanceStats = {
    totalTrades: trades.length,
    winningTrades: trades.filter(t => t.pnl > 0).length,
    losingTrades: trades.filter(t => t.pnl < 0).length,
    totalPnL: trades.reduce((sum, t) => sum + t.pnl, 0),
    winRate: trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0,
    avgWin: trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(trades.filter(t => t.pnl > 0).length, 1),
    avgLoss: trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(trades.filter(t => t.pnl < 0).length, 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Logs & History - Trading Signals</title>
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📋 Logs & History</h1>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Symbol"
              value={filters.symbol}
              onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              className="p-2 border rounded-md"
            />
            <select
              value={filters.strategy}
              onChange={(e) => setFilters({...filters, strategy: e.target.value})}
              className="p-2 border rounded-md"
            >
              <option value="">All Strategies</option>
              <option value="ema_crossover">EMA Crossover</option>
              <option value="rsi">RSI</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="p-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="p-2 border rounded-md"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="p-2 border rounded-md"
            />
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('signals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'signals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Signal History ({filteredSignals.length})
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trades'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Trade History ({filteredTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Performance Analysis
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'signals' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Signal History</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Symbol</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Strategy</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Strength</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSignals.map((signal) => (
                          <tr key={signal.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              {new Date(signal.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium">{signal.symbol}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                signal.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {signal.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{signal.strategy}</td>
                            <td className="px-4 py-2 text-sm">${signal.price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                signal.strength === 'HIGH' ? 'bg-red-100 text-red-800' :
                                signal.strength === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {signal.strength}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                signal.executed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {signal.executed ? 'Executed' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {signal.pnl ? (
                                <span className={signal.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {signal.pnl >= 0 ? '+' : ''}${signal.pnl.toFixed(2)}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trades' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Trade History</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entry Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Exit Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Symbol</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entry Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Exit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">P&L</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">P&L %</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Strategy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredTrades.map((trade) => (
                          <tr key={trade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              {new Date(trade.entry_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {new Date(trade.exit_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium">{trade.symbol}</td>
                            <td className="px-4 py-2 text-sm">${trade.entry_price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">${trade.exit_price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">{trade.quantity}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={trade.pnl_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {trade.pnl_percent >= 0 ? '+' : ''}{trade.pnl_percent.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{trade.strategy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Trades</p>
                    <p className="text-2xl font-bold">{performanceStats.totalTrades}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{performanceStats.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total P&L</p>
                    <p className={`text-2xl font-bold ${performanceStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {performanceStats.totalPnL >= 0 ? '+' : ''}${performanceStats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Avg Win</p>
                    <p className="text-2xl font-bold text-green-600">${performanceStats.avgWin.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Trade Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Winning Trades:</span>
                        <span className="text-green-600 font-medium">{performanceStats.winningTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losing Trades:</span>
                        <span className="text-red-600 font-medium">{performanceStats.losingTrades}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average Loss:</span>
                        <span className="text-red-600 font-medium">${performanceStats.avgLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk/Reward:</span>
                        <span className="font-medium">
                          {Math.abs(performanceStats.avgWin / performanceStats.avgLoss).toFixed(2)}:1
                        </span>
                      </div>
                    </div>
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
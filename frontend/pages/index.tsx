import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface Signal {
  symbol: string
  type: 'BUY' | 'SELL'
  strategy: string
  reason: string
  timestamp: string
  price: number
  strength?: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface Portfolio {
  totalValue: number
  dailyPnL: number
  totalPnL: number
  activePositions: number
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 100000,
    dailyPnL: 1250,
    totalPnL: 8500,
    activePositions: 3
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(fetchSignals, 30000) // 30초마다 업데이트
    return () => clearInterval(interval)
  }, [])

  const fetchSignals = async () => {
    try {
      const response = await fetch('http://localhost:8000/signals')
      const data = await response.json()
      setSignals(data)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalStrength = (signal: Signal): 'HIGH' | 'MEDIUM' | 'LOW' => {
    // 간단한 신호 강도 계산 로직
    if (signal.strategy.includes('ema_crossover')) return 'HIGH'
    if (signal.strategy.includes('rsi')) return 'MEDIUM'
    return 'LOW'
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Trading Signals Dashboard</title>
        <meta name="description" content="Real-time trading signals dashboard" />
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📈 Trading Signals</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate || 'Never'}
              </span>
              <button 
                onClick={fetchSignals}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 포트폴리오 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-semibold">${portfolio.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Daily P&L</p>
                <p className={`text-lg font-semibold ${portfolio.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.dailyPnL >= 0 ? '+' : ''}${portfolio.dailyPnL.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total P&L</p>
                <p className={`text-lg font-semibold ${portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolio.totalPnL >= 0 ? '+' : ''}${portfolio.totalPnL.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 text-xl">🎯</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Active Positions</p>
                <p className="text-lg font-semibold">{portfolio.activePositions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 실시간 신호 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">🚨 Active Signals</h2>
                  <span className="text-sm text-gray-500">
                    {signals.length} signals found
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : signals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active signals at the moment</p>
                    <p className="text-sm mt-2">Check back later or run a scan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {signals.map((signal, index) => {
                      const strength = getSignalStrength(signal)
                      return (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-lg">{signal.symbol}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  signal.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {signal.type}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(strength)}`}>
                                  {strength}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{signal.reason}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>${signal.price?.toFixed(2) || 'N/A'}</span>
                                <span>{new Date(signal.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                                View Chart
                              </button>
                              <button className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/screener" className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition text-center font-medium">
                  🔍 Market Screener
                </Link>
                <Link href="/strategies" className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition text-center font-medium">
                  ⚙️ Manage Strategies
                </Link>
                <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition font-medium">
                  📊 Run Backtest
                </button>
                <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition font-medium">
                  🔔 Notification Settings
                </button>
              </div>
            </div>

            {/* 시스템 상태 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔧 System Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Feed</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Signal Engine</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Running</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Notifications</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-yellow-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📋 Recent Activity</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">AAPL BUY signal</span>
                  <span className="text-gray-400">2m ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TSLA strategy added</span>
                  <span className="text-gray-400">15m ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SPY SELL signal</span>
                  <span className="text-gray-400">1h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System backup</span>
                  <span className="text-gray-400">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface Strategy {
  symbol: string
  rule: string
  params: any
  stop: number
  take: number
  created_at: string
  active: boolean
}

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [newStrategy, setNewStrategy] = useState({
    symbol: '',
    rule: 'ema_cross',
    params: { fast: 12, slow: 26 },
    stop: -5,
    take: 8,
    name: ''
  })

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://localhost:8000/strategies')
      const data = await response.json()
      setStrategies(data)
    } catch (error) {
      console.error('Error fetching strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStrategy = async () => {
    try {
      const response = await fetch('http://localhost:8000/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStrategy),
      })
      
      if (response.ok) {
        setNewStrategy({
          symbol: '',
          rule: 'ema_cross',
          params: { fast: 12, slow: 26 },
          stop: -5,
          take: 8,
          name: ''
        })
        fetchStrategies()
      }
    } catch (error) {
      console.error('Error adding strategy:', error)
    }
  }

  const toggleStrategy = async (symbol: string, rule: string) => {
    try {
      const response = await fetch(`http://localhost:8000/strategies/${symbol}/${rule}/toggle`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        fetchStrategies()
      }
    } catch (error) {
      console.error('Error toggling strategy:', error)
    }
  }

  const removeStrategy = async (symbol: string, rule: string) => {
    try {
      const response = await fetch(`http://localhost:8000/strategies/${symbol}/${rule}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchStrategies()
      }
    } catch (error) {
      console.error('Error removing strategy:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Strategies - Trading Signals</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Strategies</h1>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            ← Back to Dashboard
          </Link>
        </div>

        {/* 새 전략 추가 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📝 Add New Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Strategy Name (e.g., AAPL EMA Strategy)"
              value={newStrategy.name}
              onChange={(e) => setNewStrategy({...newStrategy, name: e.target.value})}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Symbol (e.g., AAPL)"
              value={newStrategy.symbol}
              onChange={(e) => setNewStrategy({...newStrategy, symbol: e.target.value})}
              className="border rounded px-3 py-2"
            />
            <select
              value={newStrategy.rule}
              onChange={(e) => setNewStrategy({...newStrategy, rule: e.target.value})}
              className="border rounded px-3 py-2"
            >
              <option value="ema_cross">EMA Crossover</option>
              <option value="rsi">RSI</option>
              <option value="bollinger_bands">Bollinger Bands</option>
              <option value="macd">MACD</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input
              type="number"
              placeholder="Stop Loss %"
              value={newStrategy.stop}
              onChange={(e) => setNewStrategy({...newStrategy, stop: parseFloat(e.target.value)})}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Take Profit %"
              value={newStrategy.take}
              onChange={(e) => setNewStrategy({...newStrategy, take: parseFloat(e.target.value)})}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={addStrategy}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
            >
              ➕ Add Strategy
            </button>
          </div>
        </div>

        {/* 전략 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Active Strategies</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{strategy.symbol}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600 capitalize">{strategy.rule.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Stop: {strategy.stop}% | Take: {strategy.take}%
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Created: {new Date(strategy.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Last signal: 2h ago</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleStrategy(strategy.symbol, strategy.rule)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          strategy.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {strategy.active ? '✅ Active' : '⏸️ Inactive'}
                      </button>
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 font-medium">
                        📊 Backtest
                      </button>
                      <button
                        onClick={() => removeStrategy(strategy.symbol, strategy.rule)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 font-medium"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
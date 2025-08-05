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
    take: 8
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
          take: 8
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
          <h2 className="text-xl font-semibold mb-4">Add New Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </select>
            <input
              type="number"
              placeholder="Stop Loss %"
              value={newStrategy.stop}
              onChange={(e) => setNewStrategy({...newStrategy, stop: parseFloat(e.target.value)})}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={addStrategy}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Strategy
            </button>
          </div>
        </div>

        {/* 전략 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Active Strategies</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{strategy.symbol}</h3>
                      <p className="text-gray-600">Rule: {strategy.rule}</p>
                      <p className="text-sm text-gray-500">
                        Stop: {strategy.stop}% | Take: {strategy.take}%
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleStrategy(strategy.symbol, strategy.rule)}
                        className={`px-3 py-1 rounded text-sm ${
                          strategy.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {strategy.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => removeStrategy(strategy.symbol, strategy.rule)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Remove
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
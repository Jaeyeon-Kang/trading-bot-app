import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Dashboard() {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // API에서 신호 데이터 가져오기
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    try {
      const response = await fetch('http://localhost:8000/signals')
      const data = await response.json()
      setSignals(data)
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Trading Signals Dashboard</title>
        <meta name="description" content="Trading signals dashboard" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📈 Trading Signals Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 신호 카드 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Signals</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-2">
                {signals.length === 0 ? (
                  <p className="text-gray-500">No signals available</p>
                ) : (
                  signals.map((signal: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{signal.symbol}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          signal.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {signal.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{signal.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">${signal.price?.toFixed(2) || 'N/A'}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/strategies" className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition text-center">
                Manage Strategies
              </Link>
              <button 
                onClick={fetchSignals}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
              >
                Refresh Signals
              </button>
              <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition">
                Scan All
              </button>
            </div>
          </div>

          {/* 상태 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Data Feed</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Notifications</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
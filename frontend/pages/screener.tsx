import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface ScanResult {
  symbol: string
  price: number
  change: number
  volume: number
  signals: Array<{
    type: 'BUY' | 'SELL'
    strategy: string
    reason: string
    strength: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
}

interface FilterOptions {
  category: string
  minPrice: number
  maxPrice: number
  minVolume: number
  indicators: string[]
}

export default function Screener() {
  const [symbols, setSymbols] = useState<string>('')
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    minPrice: 0,
    maxPrice: 1000,
    minVolume: 1000000,
    indicators: ['ema_crossover', 'rsi']
  })

  // 데모 데이터
  const demoResults: ScanResult[] = [
    {
      symbol: 'AAPL',
      price: 152.34,
      change: 2.1,
      volume: 45000000,
      signals: [
        {
          type: 'BUY',
          strategy: 'ema_crossover',
          reason: 'EMA12 crossed above EMA26',
          strength: 'HIGH'
        }
      ]
    },
    {
      symbol: 'TSLA',
      price: 248.67,
      change: -1.5,
      volume: 35000000,
      signals: [
        {
          type: 'SELL',
          strategy: 'rsi',
          reason: 'RSI overbought (75.2)',
          strength: 'MEDIUM'
        }
      ]
    },
    {
      symbol: 'SPY',
      price: 447.89,
      change: 0.8,
      volume: 80000000,
      signals: [
        {
          type: 'BUY',
          strategy: 'rsi',
          reason: 'RSI oversold (28.5)',
          strength: 'MEDIUM'
        }
      ]
    },
    {
      symbol: 'GOOGL',
      price: 142.56,
      change: 1.2,
      volume: 25000000,
      signals: []
    },
    {
      symbol: 'MSFT',
      price: 378.92,
      change: -0.5,
      volume: 30000000,
      signals: []
    }
  ]

  const runScan = async () => {
    setLoading(true)
    // 실제로는 API 호출
    setTimeout(() => {
      setScanResults(demoResults)
      setLoading(false)
    }, 2000)
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const filteredResults = scanResults.filter(result => {
    if (filters.minPrice && result.price < filters.minPrice) return false
    if (filters.maxPrice && result.price > filters.maxPrice) return false
    if (filters.minVolume && result.volume < filters.minVolume) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Market Screener - Trading Signals</title>
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🔍 Market Screener</h1>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 필터 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔧 Filters</h2>
              
              {/* 심볼 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbols (comma separated)
                </label>
                <textarea
                  value={symbols}
                  onChange={(e) => setSymbols(e.target.value)}
                  placeholder="AAPL, TSLA, SPY, GOOGL, MSFT"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              {/* 카테고리 필터 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All</option>
                  <option value="stocks">Stocks</option>
                  <option value="etfs">ETFs</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              {/* 가격 범위 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                    className="w-1/2 p-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                    className="w-1/2 p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* 거래량 필터 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Volume
                </label>
                <input
                  type="number"
                  placeholder="1,000,000"
                  value={filters.minVolume}
                  onChange={(e) => setFilters({...filters, minVolume: Number(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* 지표 필터 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicators
                </label>
                <div className="space-y-2">
                  {['ema_crossover', 'rsi', 'bollinger_bands', 'macd'].map(indicator => (
                    <label key={indicator} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.indicators.includes(indicator)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({...filters, indicators: [...filters.indicators, indicator]})
                          } else {
                            setFilters({...filters, indicators: filters.indicators.filter(i => i !== indicator)})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{indicator.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 스캔 버튼 */}
              <button
                onClick={runScan}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scanning...
                  </div>
                ) : (
                  '🔍 Run Scan'
                )}
              </button>
            </div>
          </div>

          {/* 스캔 결과 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">📊 Scan Results</h2>
                  <span className="text-sm text-gray-500">
                    {filteredResults.length} symbols found
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.symbol}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${result.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getChangeColor(result.change)}`}>
                            {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(result.volume / 1000000).toFixed(1)}M
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {result.signals.length === 0 ? (
                              <span className="text-xs text-gray-500">No signals</span>
                            ) : (
                              result.signals.map((signal, signalIndex) => (
                                <span
                                  key={signalIndex}
                                  className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(signal.strength)}`}
                                >
                                  {signal.type}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              Chart
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              Add Strategy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredResults.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p>No results found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or run a scan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
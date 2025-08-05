import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface Settings {
  // API Keys
  alpaca_api_key: string
  alpaca_secret_key: string
  openai_api_key: string
  slack_webhook_url: string
  telegram_bot_token: string
  telegram_chat_id: string
  
  // System Settings
  data_refresh_interval: number
  notification_enabled: boolean
  auto_trading_enabled: boolean
  risk_management_enabled: boolean
  
  // User Profile
  username: string
  email: string
  timezone: string
  currency: string
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    alpaca_api_key: '',
    alpaca_secret_key: '',
    openai_api_key: '',
    slack_webhook_url: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    data_refresh_interval: 30,
    notification_enabled: true,
    auto_trading_enabled: false,
    risk_management_enabled: true,
    username: 'Trader',
    email: 'trader@example.com',
    timezone: 'America/New_York',
    currency: 'USD'
  })

  const [activeTab, setActiveTab] = useState<'api' | 'system' | 'profile'>('api')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    // 실제로는 API에서 설정 로드
    // 현재는 로컬 스토리지에서 로드
    const savedSettings = localStorage.getItem('trading_settings')
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // 실제로는 API로 설정 저장
      localStorage.setItem('trading_settings', JSON.stringify(settings))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const testApiConnection = async (api: string) => {
    try {
      // 실제로는 API 연결 테스트
      alert(`${api} connection test - This would test the actual API connection`)
    } catch (error) {
      alert(`Failed to test ${api} connection`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Settings - Trading Signals</title>
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('api')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'api'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🔑 API Keys
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'system'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ System Settings
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👤 User Profile
                </button>
              </nav>
            </div>
          </div>

          {/* 메인 설정 영역 */}
          <div className="lg:col-span-3">
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">🔑 API Keys</h2>
                  
                  {/* Alpaca API */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">📈 Alpaca Trading API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={settings.alpaca_api_key}
                          onChange={(e) => setSettings({...settings, alpaca_api_key: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="Your Alpaca API Key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          value={settings.alpaca_secret_key}
                          onChange={(e) => setSettings({...settings, alpaca_secret_key: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="Your Alpaca Secret Key"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => testApiConnection('Alpaca')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                  </div>

                  {/* OpenAI API */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">🤖 OpenAI API</h3>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.openai_api_key}
                        onChange={(e) => setSettings({...settings, openai_api_key: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="Your OpenAI API Key"
                      />
                    </div>
                    <button
                      onClick={() => testApiConnection('OpenAI')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                  </div>

                  {/* Slack Webhook */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">💬 Slack Integration</h3>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={settings.slack_webhook_url}
                        onChange={(e) => setSettings({...settings, slack_webhook_url: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                    <button
                      onClick={() => testApiConnection('Slack')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                  </div>

                  {/* Telegram Bot */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">📱 Telegram Bot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bot Token
                        </label>
                        <input
                          type="password"
                          value={settings.telegram_bot_token}
                          onChange={(e) => setSettings({...settings, telegram_bot_token: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chat ID
                        </label>
                        <input
                          type="text"
                          value={settings.telegram_chat_id}
                          onChange={(e) => setSettings({...settings, telegram_chat_id: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="123456789"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => testApiConnection('Telegram')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">⚙️ System Settings</h2>
                  
                  <div className="space-y-6">
                    {/* 데이터 새로고침 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.data_refresh_interval}
                        onChange={(e) => setSettings({...settings, data_refresh_interval: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                        min="10"
                        max="300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How often to refresh market data (10-300 seconds)
                      </p>
                    </div>

                    {/* 알림 설정 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-gray-500">Enable real-time notifications</p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, notification_enabled: !settings.notification_enabled})}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          settings.notification_enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {settings.notification_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* 자동 거래 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Auto Trading</h3>
                        <p className="text-sm text-gray-500">Automatically execute trades based on signals</p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, auto_trading_enabled: !settings.auto_trading_enabled})}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          settings.auto_trading_enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {settings.auto_trading_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* 리스크 관리 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Risk Management</h3>
                        <p className="text-sm text-gray-500">Enable stop-loss and take-profit orders</p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, risk_management_enabled: !settings.risk_management_enabled})}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          settings.risk_management_enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {settings.risk_management_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">👤 User Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings({...settings, username: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="KRW">KRW (₩)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Save Settings</h3>
                  <p className="text-sm text-gray-500">Save all changes to your configuration</p>
                </div>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium"
                >
                  {saving ? 'Saving...' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
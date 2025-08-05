import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface NotificationStatus {
  enabled: boolean
  slack_enabled: boolean
  telegram_enabled: boolean
  stats: {
    total_sent: number
    successful: number
    failed: number
    success_rate: number
  }
}

interface NotificationHistory {
  timestamp: string
  symbol: string
  type: string
  reason: string
  success: boolean
  channels: string[]
}

export default function Notifications() {
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [settings, setSettings] = useState({
    slack_webhook: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    notifications_enabled: true
  })

  useEffect(() => {
    fetchNotificationStatus()
    fetchNotificationHistory()
  }, [])

  const fetchNotificationStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/notifications/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching notification status:', error)
    }
  }

  const fetchNotificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/notifications/history?limit=20')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching notification history:', error)
    } finally {
      setLoading(false)
    }
  }

  const testNotification = async (channel: string = 'all') => {
    setTestLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/notifications/test?channel=${channel}`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Test notification sent successfully!')
      } else {
        alert('Failed to send test notification. Check your API keys.')
      }
      
      // 상태 새로고침
      fetchNotificationStatus()
      fetchNotificationHistory()
    } catch (error) {
      console.error('Error testing notification:', error)
      alert('Error testing notification')
    } finally {
      setTestLoading(false)
    }
  }

  const toggleNotifications = async (enabled: boolean) => {
    try {
      const response = await fetch('http://localhost:8000/notifications/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled })
      })
      const data = await response.json()
      
      if (data.success) {
        setSettings({ ...settings, notifications_enabled: enabled })
        fetchNotificationStatus()
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Notifications - Trading Signals</title>
      </Head>

      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🔔 Notification Settings</h1>
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 알림 설정 */}
          <div className="space-y-6">
            {/* 전역 설정 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Global Settings</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-500">Enable/disable all notifications</p>
                </div>
                <button
                  onClick={() => toggleNotifications(!settings.notifications_enabled)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    settings.notifications_enabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {settings.notifications_enabled ? '✅ Enabled' : '❌ Disabled'}
                </button>
              </div>

              {status && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-gray-500">Total Sent</p>
                    <p className="text-xl font-semibold">{status.stats.total_sent}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-gray-500">Success Rate</p>
                    <p className="text-xl font-semibold">{status.stats.success_rate.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Slack 설정 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">💬 Slack Integration</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slack_webhook}
                  onChange={(e) => setSettings({...settings, slack_webhook: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create a webhook in your Slack workspace settings
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Status: {status?.slack_enabled ? '✅ Connected' : '❌ Not Connected'}
                  </p>
                </div>
                <button
                  onClick={() => testNotification('slack')}
                  disabled={testLoading || !status?.slack_enabled}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {testLoading ? 'Sending...' : 'Test'}
                </button>
              </div>
            </div>

            {/* Telegram 설정 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📱 Telegram Integration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Token
                  </label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={settings.telegram_bot_token}
                    onChange={(e) => setSettings({...settings, telegram_bot_token: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get from @BotFather on Telegram
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={settings.telegram_chat_id}
                    onChange={(e) => setSettings({...settings, telegram_chat_id: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your user ID or group ID
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Status: {status?.telegram_enabled ? '✅ Connected' : '❌ Not Connected'}
                    </p>
                  </div>
                  <button
                    onClick={() => testNotification('telegram')}
                    disabled={testLoading || !status?.telegram_enabled}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {testLoading ? 'Sending...' : 'Test'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 히스토리 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Notification History</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No notifications sent yet</p>
                <p className="text-sm mt-2">Test your setup to see notifications here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((notification, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{notification.symbol}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {notification.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {notification.success ? '✅ Sent' : '❌ Failed'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notification.reason}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          <span>{notification.channels.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 설정 가이드 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📖 Setup Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Slack Setup</h3>
              <ol className="space-y-1 text-blue-700">
                <li>1. Go to your Slack workspace settings</li>
                <li>2. Navigate to Apps → Incoming Webhooks</li>
                <li>3. Create a new webhook for your channel</li>
                <li>4. Copy the webhook URL and paste it above</li>
                <li>5. Test the connection</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Telegram Setup</h3>
              <ol className="space-y-1 text-blue-700">
                <li>1. Message @BotFather on Telegram</li>
                <li>2. Create a new bot with /newbot</li>
                <li>3. Copy the bot token</li>
                <li>4. Get your chat ID from @userinfobot</li>
                <li>5. Test the connection</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import os
import requests
import json
from typing import Dict, List, Optional
from datetime import datetime

class NotificationManager:
    def __init__(self):
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        
        # 알림 설정
        self.notifications_enabled = True
        self.slack_enabled = bool(self.slack_webhook_url)
        self.telegram_enabled = bool(self.telegram_bot_token and self.telegram_chat_id)
        
        # 알림 히스토리 (실제로는 DB에 저장)
        self.notification_history = []
    
    def send_signal_notification(self, signal: Dict) -> bool:
        """신호 알림 전송"""
        if not self.notifications_enabled:
            return False
        
        message = self._format_signal_message(signal)
        success = False
        
        # Slack 알림
        if self.slack_enabled:
            slack_success = self._send_slack_notification(message, signal)
            success = success or slack_success
        
        # Telegram 알림
        if self.telegram_enabled:
            telegram_success = self._send_telegram_notification(message, signal)
            success = success or telegram_success
        
        # 알림 히스토리에 기록
        self._log_notification(signal, success)
        
        return success
    
    def _format_signal_message(self, signal: Dict) -> str:
        """신호 메시지 포맷팅"""
        emoji = "🟢" if signal['type'] == 'BUY' else "🔴"
        symbol = signal['symbol']
        signal_type = signal['type']
        reason = signal['reason']
        price = signal.get('price', 'N/A')
        timestamp = signal.get('timestamp', '')
        
        # 시간 포맷팅
        if timestamp:
            try:
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                time_str = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                time_str = timestamp
        else:
            time_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        message = f"""
{emoji} **{symbol} {signal_type} Signal**

**Reason:** {reason}
**Price:** ${price}
**Time:** {time_str}

---
*Trading Signals Bot*
        """.strip()
        
        return message
    
    def _send_slack_notification(self, message: str, signal: Dict) -> bool:
        """Slack 알림 전송"""
        try:
            # Slack 메시지 포맷
            slack_message = {
                "text": message,
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": message
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "View Chart"
                                },
                                "url": f"https://finance.yahoo.com/quote/{signal['symbol']}",
                                "style": "primary"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Dashboard"
                                },
                                "url": "http://localhost:3000",
                                "style": "secondary"
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(
                self.slack_webhook_url,
                json=slack_message,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Slack notification error: {e}")
            return False
    
    def _send_telegram_notification(self, message: str, signal: Dict) -> bool:
        """Telegram 알림 전송"""
        try:
            # Telegram 메시지 포맷
            telegram_message = {
                "chat_id": self.telegram_chat_id,
                "text": message,
                "parse_mode": "Markdown",
                "reply_markup": {
                    "inline_keyboard": [
                        [
                            {
                                "text": "📈 View Chart",
                                "url": f"https://finance.yahoo.com/quote/{signal['symbol']}"
                            },
                            {
                                "text": "🏠 Dashboard",
                                "url": "http://localhost:3000"
                            }
                        ]
                    ]
                }
            }
            
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            response = requests.post(url, json=telegram_message, timeout=10)
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Telegram notification error: {e}")
            return False
    
    def _log_notification(self, signal: Dict, success: bool):
        """알림 로그 기록"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'symbol': signal['symbol'],
            'type': signal['type'],
            'reason': signal['reason'],
            'success': success,
            'channels': []
        }
        
        if self.slack_enabled:
            log_entry['channels'].append('slack')
        if self.telegram_enabled:
            log_entry['channels'].append('telegram')
        
        self.notification_history.append(log_entry)
        
        # 최근 100개만 유지
        if len(self.notification_history) > 100:
            self.notification_history = self.notification_history[-100:]
    
    def get_notification_history(self, limit: int = 50) -> List[Dict]:
        """알림 히스토리 조회"""
        return self.notification_history[-limit:]
    
    def get_notification_stats(self) -> Dict:
        """알림 통계"""
        if not self.notification_history:
            return {
                'total_sent': 0,
                'successful': 0,
                'failed': 0,
                'success_rate': 0
            }
        
        total = len(self.notification_history)
        successful = len([n for n in self.notification_history if n['success']])
        failed = total - successful
        
        return {
            'total_sent': total,
            'successful': successful,
            'failed': failed,
            'success_rate': (successful / total) * 100 if total > 0 else 0
        }
    
    def toggle_notifications(self, enabled: bool):
        """알림 활성화/비활성화"""
        self.notifications_enabled = enabled
    
    def test_notification(self, channel: str = 'all') -> bool:
        """테스트 알림 전송"""
        test_signal = {
            'symbol': 'TEST',
            'type': 'BUY',
            'reason': 'Test notification',
            'price': 100.00,
            'timestamp': datetime.now().isoformat()
        }
        
        if channel == 'slack' or channel == 'all':
            if self.slack_enabled:
                return self._send_slack_notification(
                    self._format_signal_message(test_signal), 
                    test_signal
                )
        
        if channel == 'telegram' or channel == 'all':
            if self.telegram_enabled:
                return self._send_telegram_notification(
                    self._format_signal_message(test_signal), 
                    test_signal
                )
        
        return False
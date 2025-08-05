# 📈 Trading Signals Dashboard

단타/스윙 트레이더용 매수·매도 신호 알림 웹앱 MVP

## 🚀 빠른 시작

### 1. 데모 보기 (즉시 실행 가능)
```bash
# 브라우저에서 demo.html 파일 열기
open demo.html
# 또는
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080/demo.html 접속
```

### 2. 환경 설정 (실제 API 사용시)
```bash
# 환경변수 파일 복사
cp .env.example .env

# .env 파일에서 API 키들 설정
# - ALPACA_API_KEY
# - ALPACA_SECRET_KEY  
# - OPENAI_API_KEY
# - SLACK_WEBHOOK_URL (선택)
# - TELEGRAM_BOT_TOKEN (선택)
```

### 3. Docker로 실행
```bash
# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 로컬 개발
```bash
# 백엔드
cd backend
pip install -r requirements.txt
python main.py

# 프론트엔드 (새 터미널)
cd frontend
npm install
npm run dev
```

## 📁 프로젝트 구조

```
├── backend/                 # FastAPI 백엔드
│   ├── data_collection/    # Alpaca API, RSS 스크래핑
│   ├── indicators/         # TA-Lib 기술적 지표
│   ├── signals/           # 신호 발생 로직
│   ├── notifications/     # Slack/Telegram 알림
│   └── gpt_module/        # GPT-4 뉴스 요약
├── frontend/              # Next.js + Tailwind
│   ├── pages/            # 페이지 컴포넌트
│   └── components/       # 재사용 컴포넌트
└── docker/               # Docker 설정
```

## 🔧 주요 기능

- **데이터 수집**: Alpaca API (지연 데이터) + 데모 모드
- **기술적 지표**: EMA, RSI, 볼린저 밴드, MACD
- **신호 발생**: EMA 크로스오버, RSI 과매수/과매도
- **전략 관리**: 추가/제거/활성화/비활성화
- **알림**: Slack/Telegram Webhook (구현 예정)
- **뉴스 요약**: GPT-4 기반 (구현 예정)
- **대시보드**: 실시간 신호 모니터링

## 📊 API 엔드포인트

- `GET /` - API 상태 확인
- `GET /health` - 헬스체크
- `GET /signals` - 활성 신호 목록
- `POST /strategies` - 전략 추가

## 🛠 기술 스택

- **Backend**: FastAPI, Python, TA-Lib
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

## ⚠️ 주의사항

- 투자 판단 책임은 사용자에게 귀속됩니다
- 이 도구는 참고용이며 실제 거래는 신중히 결정하세요
- API 키는 안전하게 관리하세요
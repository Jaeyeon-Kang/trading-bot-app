#!/bin/bash

# Python 가상환경 생성 (없으면)
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv || {
        echo "Failed to create virtual environment. Trying with pip..."
        python3 -m pip install --user virtualenv
        python3 -m virtualenv venv
    }
fi

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
echo "Installing dependencies..."
pip install fastapi uvicorn pandas numpy

# 백엔드 실행
echo "Starting backend server..."
cd backend
python main.py
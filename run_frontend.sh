#!/bin/bash

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Starting frontend development server..."
npm run dev
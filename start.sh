#!/bin/bash
echo "Starting DiabetesRx Tracker..."
echo "Open http://localhost:${PORT:-3001} in your browser"
echo "Press Ctrl+C to stop"
echo ""
NODE_ENV=production node dist/index.cjs

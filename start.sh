#!/bin/bash
echo "Starting DiabetesRx Tracker..."
echo "Open http://localhost:5000 in your browser"
echo "Press Ctrl+C to stop"
echo ""
NODE_ENV=production node dist/index.cjs

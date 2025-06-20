#!/bin/bash
cd /home/kavia/workspace/code-generation/cityfix-civicconnect-60122-869782e5-64350/civicconnect_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


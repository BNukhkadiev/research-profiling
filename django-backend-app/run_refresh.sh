#!/bin/bash
cd "$(dirname "$0")" || exit 1
echo "Starting refresh_publications command..."
python3 manage.py refresh_publications >> ./logs/cron_refresh.log 2>&1
echo "Finished running refresh_publications command."
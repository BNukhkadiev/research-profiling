# CRON_SETUP.md

This document explains how to set up the cron job that periodically refreshes researcher publication data using the provided `run_refresh.sh` script.

## Overview

The project includes a shell script `run_refresh.sh` located at the project root (next to `manage.py`). This script calls the Django management command `refresh_publications` to update publication data from DBLP. The cron job is scheduled to run every 2 minutes by default.

## Prerequisites

- A Unix-like environment (Linux, macOS, etc.)
- The project is cloned to your local machine.
- All dependencies are installed.
- The project root contains:
  - `manage.py`
  - `run_refresh.sh`
  - A `logs/` directory (if it doesn’t exist, you can create it using `mkdir -p logs`)

## Setting Up the Cron Job

### 1. Determine Your Project Directory Path

Find the absolute path to your project directory (where `manage.py` and `run_refresh.sh` are located).  
For example, if your project is located at: 

/home/username/my-project 

that is your project directory.

### 2. Open Your Crontab for Editing

Open your terminal and run:
```bash
crontab -e 
```



### 3. Add the Cron Job Entry

-# Set your base directory
BASE_DIR=/absolute/path/to/your/project
#Example:BASE_DIR=/Users/najib/Desktop/Research-Profiling/research-profiling

-# Set the environment variable for the project directory
PROJECT_DIR=$BASE_DIR/django-backend-app
-# Cron job: every week (every Monday at 3:00 AM), change to the project directory and run the refresh script
0 3 * * 1 cd $PROJECT_DIR && ./run_refresh.sh
-# New cron job: download the DBLP dataset every Monday at 4:00 AM
0 4 * * 1 cd $BASE_DIR/datasets && ./download_dblp.sh >> $BASE_DIR/datasets/dblp_download.log 2>&1

#Example of the whole cron jobs command 
BASE_DIR=/Users/najib/Desktop/Research-Profiling/research-profiling
-# Existing refresh job (runs every Monday at 3 AM)
PROJECT_DIR=$BASE_DIR/django-backend-app
0 3 * * 1 cd $PROJECT_DIR && ./run_refresh.sh
-# New DBLP download job and connect to BaseX database(runs every Monday at 4 AM)
0 4 * * 1 cd $BASE_DIR/datasets && ./download_dblp.sh >> $BASE_DIR/datasets/dblp_download.log 2>&1


### 4. Save and Exit

If you’re using nano, press Control + O to save, then Control + X to exit.
If you’re using vim, press Esc, type :wq, and then press Enter.


### 5. Verfiy the Cron Job
crontab -l


### 6. Troubleshooting
Ensure your scripts are executable, For example: 
chmod +x $BASE_DIR/datasets/download_dblp.sh
chmod +x $PROJECT_DIR/run_refresh.sh

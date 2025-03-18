#!/bin/bash
# Install wget if it's not already available
# Change to the directory where this script is located
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$(dirname "$0")" || exit 1

# Log start time
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting DBLP download..."

# Download the DBLP dataset.
# The -N option downloads the file only if the remote version is newer.
wget_output=$(wget -N -O dblp.xml.gz https://dblp.org/xml/dblp.xml.gz 2>&1)
exit_code=$?

# Output wget's messages to the log
echo "$wget_output"

# Check if the download was successful
if [ $exit_code -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Download completed successfully."

    # Log start of database creation
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Creating BaseX database 'dblp'..."

    # Run BaseX command to create the database from the downloaded file
    basex -c "CREATE DB dblp dblp.xml.gz"

    # Check if BaseX ran successfully
    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] BaseX database 'dblp' created successfully."
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] BaseX database creation failed."
    fi

else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Download failed with exit code $exit_code."
fi
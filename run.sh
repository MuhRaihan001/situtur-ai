#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
RESET='\033[0m'

ENV_FILE=".env"

loading() {
    local msg="$1"
    local chars='|/-\\'
    echo -n "$msg"
    for i in {1..8}; do
        idx=$((i % 4))
        echo -ne "\r${YELLOW}[${chars:$idx:1}]${RESET} $msg"
        sleep 0.1
    done
    echo -ne "\r${GREEN}[✓]${RESET} $msg\n"
    sleep 0.5
}

check_or_create_file() {
    local file="$1"
    local content="$2"
    if [ ! -f "$file" ]; then
        loading "Creating $file..."
        echo -e "$content" > "$file"
    else
        echo -e "${GREEN}[✓]${RESET} $file exists."
        sleep 0.3
    fi
}

if [ ! -f "$ENV_FILE" ]; then
    loading "Creating $ENV_FILE..."
    echo "# Ai Key" > "$ENV_FILE"
    echo "KEY=" > "$ENV_FILE"
    echo "MODEL_NAME=" > "$ENV_FILE"
    echo                > "$ENV_FILE"
    echo "# COMMAHD" > "$ENV_FILE"
    echo "PREFIX=!" > "$ENV_FILE"
    echo                > "$ENV_FILE"
    echo "# Database" > "$ENV_FILE"
    echo "DATABASE_HOST=" > "$ENV_FILE"
    echo "DATABASE_USER=" > "$ENV_FILE"
    echo "DATABASE_PASSWORD=" > "$ENV_FILE"
    echo "DATABASE_NAME=" > "$ENV_FILE"
else
    echo -e "${GREEN}[✓]${RESET} $ENV_FILE exists."
    sleep 0.3
fi
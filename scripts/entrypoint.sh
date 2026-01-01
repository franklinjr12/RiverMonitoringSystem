#!/bin/bash
set -e

echo "folders"
ls

cd /workspace/frontend/reactapp

# mv -f /workspace/frontend/reactapp/package-lock.json /workspace/frontend/reactapp/package-lock.json.ignore

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "Installing npm dependencies..."
    rm -rf node_modules
    npm install
fi

cd /workspace
ruby scripts/build_frontend.rb


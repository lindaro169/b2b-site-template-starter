#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Creating .assetsignore in assets directory..."
cat > .open-next/assets/.assetsignore << 'IGNORE'
_worker.js
_redirects
.wrangler
*.log
.assetsignore
*.txt
IGNORE

echo "Deploying..."
wrangler deploy --env production

echo "Deploy complete!"

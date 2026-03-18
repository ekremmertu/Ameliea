#!/bin/bash

# Deployment Script for Wedding Invitation Platform
# This script handles the complete deployment process

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if logged in to Vercel
echo -e "${BLUE}Step 1: Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}Not logged in to Vercel. Please run:${NC}"
    echo "  vercel login"
    echo ""
    echo "After logging in, run this script again."
    exit 1
fi
echo -e "${GREEN}✓ Vercel authentication OK${NC}"
echo ""

# Step 2: Run tests (optional, comment out if needed)
# echo -e "${BLUE}Step 2: Running tests...${NC}"
# npm test
# echo -e "${GREEN}✓ Tests passed${NC}"
# echo ""

# Step 3: Build the project
echo -e "${BLUE}Step 2: Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 4: Deploy to Vercel
echo -e "${BLUE}Step 3: Deploying to Vercel...${NC}"
echo ""
echo "Choose deployment type:"
echo "  1) Preview (development)"
echo "  2) Production"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "2" ]; then
    echo ""
    echo -e "${BLUE}Deploying to PRODUCTION...${NC}"
    vercel --prod
else
    echo ""
    echo -e "${BLUE}Deploying to PREVIEW...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Add environment variables in Vercel Dashboard"
echo "  2. Run Supabase migrations"
echo "  3. Test the deployed application"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"

#!/bin/bash

# Setup Admin Script
# This script sets up an admin user using the Firebase Admin API

echo "🔧 Firebase Admin Setup Script"
echo "=============================="
echo ""

# Prompt for user ID
read -p "Enter your Firebase User UID: " USER_UID

# Prompt for email
read -p "Enter your email: " USER_EMAIL

# Prompt for secret key
read -p "Enter ADMIN_SETUP_SECRET from .env.local: " SECRET_KEY

echo ""
echo "📡 Setting admin role for user..."

# Make API request
curl -X POST http://localhost:3000/api/admin/setup-admin \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$USER_UID\",\"email\":\"$USER_EMAIL\",\"secretKey\":\"$SECRET_KEY\"}"

echo ""
echo ""
echo "✅ Done! Please refresh your browser and try uploading again."

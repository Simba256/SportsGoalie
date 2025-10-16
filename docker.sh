#!/bin/bash

# SportsCoach V3 - Docker Management Script
# Usage: ./docker.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored messages
print_msg() {
    echo -e "${2}${1}${NC}"
}

# Show usage
show_usage() {
    print_msg "SportsCoach V3 - Docker Management Script" "$BLUE"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev             Start development environment"
    echo "  dev-build       Build and start development environment"
    echo "  prod            Start production environment"
    echo "  prod-build      Build and start production environment"
    echo "  emulators       Start with Firebase emulators"
    echo "  stop            Stop all containers"
    echo "  clean           Stop and remove all containers, volumes"
    echo "  logs            Show container logs"
    echo "  shell           Open shell in app container"
    echo "  rebuild         Complete rebuild (clean + build)"
    echo ""
}

# Start development environment
dev() {
    print_msg "Starting development environment..." "$GREEN"
    docker compose up
}

# Build and start development environment
dev_build() {
    print_msg "Building and starting development environment..." "$GREEN"
    docker compose up --build
}

# Start production environment
prod() {
    print_msg "Starting production environment..." "$GREEN"
    docker compose -f docker-compose.prod.yml up
}

# Build and start production environment
prod_build() {
    print_msg "Building and starting production environment..." "$GREEN"
    docker compose -f docker-compose.prod.yml up --build
}

# Start with Firebase emulators
emulators() {
    print_msg "Starting with Firebase emulators..." "$GREEN"
    docker compose --profile with-emulators up
}

# Stop all containers
stop() {
    print_msg "Stopping all containers..." "$YELLOW"
    docker compose down
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
}

# Clean everything
clean() {
    print_msg "Cleaning all containers and volumes..." "$RED"
    docker compose down -v
    docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    print_msg "Cleaning complete!" "$GREEN"
}

# Show logs
logs() {
    docker compose logs -f
}

# Open shell in container
shell() {
    print_msg "Opening shell in app container..." "$BLUE"
    docker compose exec app sh
}

# Complete rebuild
rebuild() {
    print_msg "Complete rebuild starting..." "$YELLOW"
    clean
    print_msg "Building fresh containers..." "$GREEN"
    dev_build
}

# Check if .env.local exists
check_env() {
    if [ ! -f .env.local ]; then
        print_msg "WARNING: .env.local file not found!" "$RED"
        print_msg "Please create .env.local with your Firebase credentials" "$YELLOW"
        echo ""
        echo "Example .env.local:"
        echo "NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key"
        echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain"
        echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id"
        echo "..."
        echo ""
        exit 1
    fi
}

# Main script
case "$1" in
    dev)
        check_env
        dev
        ;;
    dev-build)
        check_env
        dev_build
        ;;
    prod)
        check_env
        prod
        ;;
    prod-build)
        check_env
        prod_build
        ;;
    emulators)
        emulators
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    rebuild)
        check_env
        rebuild
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

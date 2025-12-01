#!/bin/bash

# Script de déploiement complet pour Arbre à Palabres
# Usage: ./scripts/deploy.sh [frontend|backend|all]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    else
        log_info "Firebase CLI found: $(firebase --version)"
    fi
}

# Deploy frontend
deploy_frontend() {
    log_info "Starting frontend deployment..."
    
    cd frontend
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build
    log_info "Building frontend..."
    npm run build
    
    # Deploy to Firebase
    log_info "Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    log_info "Frontend deployed successfully!"
    log_info "URL: https://arbre-a-palabre-9e83a.web.app"
    
    cd ..
}

# Deploy backend (Render auto-deploys from GitHub)
deploy_backend() {
    log_info "Backend deployment..."
    log_warn "Backend is configured for auto-deployment on Render"
    log_info "Push to main branch to trigger deployment"
    log_info "Or manually deploy from: https://dashboard.render.com"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend tests..."
    cd backend
    npm test -- --runInBand
    cd ..
    
    # Frontend build test
    log_info "Testing frontend build..."
    cd frontend
    npm run build
    cd ..
    
    log_info "All tests passed!"
}

# Main script
main() {
    local deploy_target="${1:-all}"
    
    log_info "Arbre à Palabres Deployment Script"
    log_info "Target: $deploy_target"
    
    # Check prerequisites
    check_firebase_cli
    
    case $deploy_target in
        frontend)
            deploy_frontend
            ;;
        backend)
            deploy_backend
            ;;
        all)
            run_tests
            deploy_frontend
            deploy_backend
            ;;
        test)
            run_tests
            ;;
        *)
            log_error "Unknown target: $deploy_target"
            log_info "Usage: ./scripts/deploy.sh [frontend|backend|all|test]"
            exit 1
            ;;
    esac
    
    log_info "Deployment complete! 🎉"
}

# Run main function
main "$@"

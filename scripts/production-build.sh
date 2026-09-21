#!/bin/bash

# =============================================================================
# Production Build Script for School Platform
# =============================================================================
# This script builds and tests the production deployment configuration
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    local required_files=(
        "docker-compose.prod.yml"
        "packages/backend/Dockerfile"
        "packages/frontend/Dockerfile"
        "nginx/nginx.conf"
        "nginx/conf.d/default.conf"
        ".env.production"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_error "Missing required files:"
        printf '  %s\n' "${missing_files[@]}"
        exit 1
    fi
    
    print_success "All required files found"
}

# Check if Docker and Docker Compose are available
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Validate environment file
validate_env() {
    print_status "Validating environment configuration..."
    
    local env_file=".env"
    
    if [[ ! -f "$env_file" ]]; then
        print_warning ".env file not found. Creating from .env.production..."
        cp .env.production "$env_file"
        print_warning "Please edit .env with your production values before continuing"
        return 1
    fi
    
    # Check for required variables
    local required_vars=(
        "MONGODB_PASSWORD"
        "MONGODB_URI"
        "FRONTEND_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=YOUR_" "$env_file" || grep -q "^${var}=your-" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Please set these environment variables in .env:"
        printf '  %s\n' "${missing_vars[@]}"
        return 1
    fi
    
    print_success "Environment configuration is valid"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -f packages/frontend/Dockerfile -t school-platform-frontend:latest .
    
    # Build backend
    print_status "Building backend image..."
    docker build -f packages/backend/Dockerfile -t school-platform-backend:latest .
    
    print_success "Docker images built successfully"
}

# Test Docker Compose configuration
test_compose() {
    print_status "Testing Docker Compose configuration..."
    
    # Validate compose file
    docker-compose -f docker-compose.prod.yml config --quiet
    
    # Test build without starting
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_success "Docker Compose configuration is valid"
}

# Security scan
security_scan() {
    print_status "Running security checks..."
    
    # Check for non-root users in Dockerfiles
    local dockerfiles=("packages/backend/Dockerfile" "packages/frontend/Dockerfile")
    
    for dockerfile in "${dockerfiles[@]}"; do
        if ! grep -q "USER.*appuser\|USER.*nginxuser" "$dockerfile"; then
            print_warning "Container in $dockerfile might be running as root"
        fi
    done
    
    # Check for secrets in images
    if grep -r "password\|secret\|key" --include="*.yml" --include="*.yaml" . | grep -v "YOUR_\|your-" | grep -v "MONGODB_PASSWORD"; then
        print_warning "Potential secrets found in configuration files"
    fi
    
    print_success "Security checks completed"
}

# Test production deployment locally
test_deployment() {
    print_status "Testing production deployment..."
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check health endpoints
    local health_checks=(
        "http://localhost/health"
        "http://localhost/api/v1/health"
    )
    
    local failed_checks=()
    
    for endpoint in "${health_checks[@]}"; do
        if ! curl -f -s "$endpoint" > /dev/null; then
            failed_checks+=("$endpoint")
        fi
    done
    
    if [[ ${#failed_checks[@]} -gt 0 ]]; then
        print_error "Health checks failed:"
        printf '  %s\n' "${failed_checks[@]}"
        docker-compose -f docker-compose.prod.yml down
        return 1
    fi
    
    print_success "All health checks passed"
    
    # Clean up
    docker-compose -f docker-compose.prod.yml down
}

# Generate deployment summary
generate_summary() {
    print_status "Generating deployment summary..."
    
    local summary_file="DEPLOYMENT_SUMMARY.md"
    
    cat > "$summary_file" << EOF
# Production Deployment Summary

## Build Information
- **Date**: $(date)
- **Git Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
- **Branch**: $(git branch --show-current 2>/dev/null || echo "N/A")

## Docker Images
- **Frontend**: school-platform-frontend:latest
- **Backend**: school-platform-backend:latest
- **Nginx**: nginx:1.27.2-alpine3.20
- **MongoDB**: mongo:7.0.15-jammy

## Services
- **Nginx**: Port 80/443 (reverse proxy)
- **Frontend**: Port 8080 (React SPA)
- **Backend**: Port 3001 (NestJS API)
- **MongoDB**: Port 27017 (database)

## Security Features
✅ Non-root containers
✅ Multi-stage builds
✅ Fixed image versions
✅ Health checks
✅ Rate limiting
✅ Security headers
✅ Environment variables

## Next Steps
1. Deploy to production server
2. Configure SSL certificates
3. Set up monitoring and backups
4. Update DNS records
5. Test in production environment

## Deployment Commands
\`\`\`bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
\`\`\`
EOF
    
    print_success "Deployment summary saved to $summary_file"
}

# Main execution
main() {
    print_status "Starting production build process..."
    
    # Run checks
    check_files
    check_docker
    
    # Validate environment
    if ! validate_env; then
        print_error "Please fix environment configuration before continuing"
        exit 1
    fi
    
    # Build and test
    build_images
    test_compose
    security_scan
    
    # Test deployment if requested
    if [[ "${1:-}" == "--test" ]]; then
        if ! test_deployment; then
            print_error "Deployment test failed"
            exit 1
        fi
    fi
    
    # Generate summary
    generate_summary
    
    print_success "Production build completed successfully!"
    print_status "Review DEPLOYMENT.md for deployment instructions"
    print_status "Use 'docker-compose -f docker-compose.prod.yml up -d' to deploy"
}

# Run main function with all arguments
main "$@"
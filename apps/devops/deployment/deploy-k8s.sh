#!/bin/bash
# =============================================================================
# GAMILIT Platform - Kubernetes Deployment Script
# =============================================================================
# Purpose: Automated deployment to Kubernetes cluster
# Usage: ./deploy-k8s.sh [staging|production]
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
K8S_DIR="$PROJECT_ROOT/k8s"

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

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster."
        exit 1
    fi

    log_info "Prerequisites check passed"
}

create_namespace() {
    local namespace=$1

    log_info "Creating namespace: $namespace"

    kubectl create namespace $namespace --dry-run=client -o yaml | kubectl apply -f -

    # Label namespace
    kubectl label namespace $namespace \
        app=gamilit \
        environment=$ENVIRONMENT \
        --overwrite
}

deploy_secrets() {
    local namespace=$1

    log_warn "Secrets must be created manually for security!"
    log_info "Use the following commands to create secrets:"

    echo ""
    echo "kubectl create secret generic gamilit-db-secret \\"
    echo "  --from-literal=username='gamilit_user' \\"
    echo "  --from-literal=password='YOUR_STRONG_PASSWORD' \\"
    echo "  --namespace=$namespace"
    echo ""
    echo "kubectl create secret generic gamilit-jwt-secret \\"
    echo "  --from-literal=jwt_secret='YOUR_JWT_SECRET' \\"
    echo "  --namespace=$namespace"
    echo ""

    # Check if secrets exist
    if ! kubectl get secret gamilit-db-secret -n $namespace &> /dev/null; then
        log_error "Secret gamilit-db-secret does not exist in namespace $namespace"
        log_error "Please create it before proceeding"
        exit 1
    fi

    if ! kubectl get secret gamilit-jwt-secret -n $namespace &> /dev/null; then
        log_error "Secret gamilit-jwt-secret does not exist in namespace $namespace"
        log_error "Please create it before proceeding"
        exit 1
    fi

    log_info "Secrets check passed"
}

deploy_database() {
    local namespace=$1

    log_info "Deploying PostgreSQL database..."

    kubectl apply -f $K8S_DIR/database/statefulset.yaml -n $namespace

    log_info "Waiting for database to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=gamilit,component=database \
        -n $namespace \
        --timeout=300s

    log_info "Database deployed successfully"
}

deploy_backend() {
    local namespace=$1

    log_info "Deploying backend..."

    # Apply manifests
    kubectl apply -f $K8S_DIR/backend/deployment.yaml -n $namespace
    kubectl apply -f $K8S_DIR/backend/service.yaml -n $namespace
    kubectl apply -f $K8S_DIR/backend/hpa.yaml -n $namespace
    kubectl apply -f $K8S_DIR/backend/ingress.yaml -n $namespace

    log_info "Waiting for backend deployment..."
    kubectl rollout status deployment/gamilit-backend -n $namespace --timeout=300s

    log_info "Backend deployed successfully"
}

deploy_frontend() {
    local namespace=$1

    log_info "Deploying frontend..."

    kubectl apply -f $K8S_DIR/frontend/deployment.yaml -n $namespace
    kubectl apply -f $K8S_DIR/frontend/service.yaml -n $namespace
    kubectl apply -f $K8S_DIR/frontend/ingress.yaml -n $namespace

    log_info "Waiting for frontend deployment..."
    kubectl rollout status deployment/gamilit-frontend -n $namespace --timeout=300s

    log_info "Frontend deployed successfully"
}

run_migrations() {
    local namespace=$1

    log_info "Running database migrations..."

    # Get first backend pod
    BACKEND_POD=$(kubectl get pods -n $namespace -l app=gamilit,component=backend -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$BACKEND_POD" ]; then
        log_error "No backend pods found"
        exit 1
    fi

    log_info "Running migrations on pod: $BACKEND_POD"

    kubectl exec -it $BACKEND_POD -n $namespace -- npm run migrate

    log_info "Migrations completed"
}

health_check() {
    local namespace=$1

    log_info "Running health checks..."

    # Backend health check
    BACKEND_SERVICE=$(kubectl get svc gamilit-backend -n $namespace -o jsonpath='{.spec.clusterIP}')

    kubectl run health-check --rm -i --restart=Never --image=curlimages/curl -- \
        curl -f http://$BACKEND_SERVICE:3006/api/health || {
        log_error "Backend health check failed"
        exit 1
    }

    log_info "All health checks passed"
}

show_status() {
    local namespace=$1

    log_info "Deployment status:"
    echo ""

    kubectl get all -n $namespace -l app=gamilit

    echo ""
    log_info "Ingress:"
    kubectl get ingress -n $namespace

    echo ""
    log_info "HPA status:"
    kubectl get hpa -n $namespace
}

# Main execution
main() {
    # Check arguments
    if [ $# -lt 1 ]; then
        log_error "Usage: $0 [staging|production]"
        exit 1
    fi

    ENVIRONMENT=$1
    NAMESPACE="gamilit-$ENVIRONMENT"

    log_info "==================================================================="
    log_info "GAMILIT Platform - Kubernetes Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Namespace: $NAMESPACE"
    log_info "==================================================================="
    echo ""

    # Confirmation
    read -p "Deploy to $ENVIRONMENT? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warn "Deployment cancelled"
        exit 0
    fi

    # Execute deployment steps
    check_prerequisites
    create_namespace $NAMESPACE
    deploy_secrets $NAMESPACE
    deploy_database $NAMESPACE
    deploy_backend $NAMESPACE
    deploy_frontend $NAMESPACE
    run_migrations $NAMESPACE
    health_check $NAMESPACE
    show_status $NAMESPACE

    echo ""
    log_info "==================================================================="
    log_info "Deployment completed successfully!"
    log_info "==================================================================="
    log_info "Next steps:"
    log_info "1. Verify application: kubectl get all -n $NAMESPACE"
    log_info "2. Check logs: kubectl logs -f deployment/gamilit-backend -n $NAMESPACE"
    log_info "3. Monitor: kubectl top pods -n $NAMESPACE"
}

# Run main function
main "$@"

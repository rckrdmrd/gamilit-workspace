# GAMILIT Deployment Scripts

## Overview

This directory contains automated deployment scripts for the GAMILIT Platform.

## Scripts

### 1. deploy-k8s.sh

Automated deployment to Kubernetes cluster.

**Usage:**
```bash
./deploy-k8s.sh [staging|production]
```

**Prerequisites:**
- kubectl installed and configured
- Access to Kubernetes cluster
- Secrets already created in target namespace

**What it does:**
1. Checks prerequisites (kubectl, cluster connection)
2. Creates/verifies namespace
3. Verifies secrets exist
4. Deploys PostgreSQL StatefulSet
5. Deploys backend Deployment, Service, HPA, Ingress
6. Deploys frontend Deployment, Service, Ingress
7. Runs database migrations
8. Performs health checks
9. Shows deployment status

**Example:**
```bash
# Deploy to staging
./deploy-k8s.sh staging

# Deploy to production
./deploy-k8s.sh production
```

## Creating Secrets

Before running deployments, create the required secrets:

```bash
# Database secret
kubectl create secret generic gamilit-db-secret \
  --from-literal=username='gamilit_user' \
  --from-literal=password='STRONG_PASSWORD' \
  --namespace=gamilit-production

# JWT secret
kubectl create secret generic gamilit-jwt-secret \
  --from-literal=jwt_secret='$(openssl rand -base64 32)' \
  --namespace=gamilit-production

# Redis secret (optional)
kubectl create secret generic gamilit-redis-secret \
  --from-literal=redis_url='redis://:password@gamilit-redis:6379' \
  --namespace=gamilit-production
```

## Manual Deployment

If you prefer manual deployment:

```bash
# Create namespace
kubectl create namespace gamilit-production

# Deploy in order
kubectl apply -f ../k8s/backend/deployment.yaml -n gamilit-production
kubectl apply -f ../k8s/backend/service.yaml -n gamilit-production
kubectl apply -f ../k8s/backend/hpa.yaml -n gamilit-production
kubectl apply -f ../k8s/backend/ingress.yaml -n gamilit-production

# Check status
kubectl get all -n gamilit-production
kubectl rollout status deployment/gamilit-backend -n gamilit-production
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n gamilit-production

# Check pod logs
kubectl logs -f deployment/gamilit-backend -n gamilit-production

# Describe pod for events
kubectl describe pod <pod-name> -n gamilit-production
```

### Health checks failing

```bash
# Port forward to backend
kubectl port-forward deployment/gamilit-backend 3006:3006 -n gamilit-production

# Test health endpoint
curl http://localhost:3006/api/health
```

### Database connection errors

```bash
# Check database pod
kubectl get pods -l component=database -n gamilit-production

# Check database logs
kubectl logs statefulset/gamilit-postgres -n gamilit-production

# Test connection from backend pod
kubectl exec -it deployment/gamilit-backend -n gamilit-production -- \
  psql -h gamilit-postgres -U gamilit_user -d gamilit_platform
```

## Rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/gamilit-backend -n gamilit-production

# Rollback to specific revision
kubectl rollout undo deployment/gamilit-backend --to-revision=2 -n gamilit-production

# Check rollout history
kubectl rollout history deployment/gamilit-backend -n gamilit-production
```

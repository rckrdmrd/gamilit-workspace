# GAMILIT Platform - Kubernetes Manifests

## Overview

This directory contains Kubernetes manifests for deploying the GAMILIT Platform to a Kubernetes cluster.

## Directory Structure

```
k8s/
├── backend/
│   ├── deployment.yaml       # Backend Deployment with 3-10 replicas (HPA)
│   ├── service.yaml          # Backend Service (ClusterIP)
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   ├── ingress.yaml          # Ingress for api.gamilit.com
│   └── secrets.yaml          # Secrets template (DO NOT COMMIT ACTUAL SECRETS!)
├── frontend/
│   ├── deployment.yaml       # Frontend Deployment with 2-5 replicas
│   ├── service.yaml          # Frontend Service (ClusterIP)
│   └── ingress.yaml          # Ingress for gamilit.com
├── database/
│   └── statefulset.yaml      # PostgreSQL StatefulSet with PVC
└── README.md                 # This file
```

## Prerequisites

1. **Kubernetes cluster** (v1.28+)
   - Minikube (local development)
   - GKE, EKS, AKS (cloud providers)
   - Self-hosted cluster

2. **kubectl** CLI installed and configured

3. **Ingress controller** (nginx recommended)
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

4. **Cert-manager** (for SSL certificates)
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

5. **Metrics server** (for HPA)
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   ```

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace gamilit-production
```

### 2. Create Secrets

**IMPORTANT**: Replace placeholders with actual values!

```bash
# Database credentials
kubectl create secret generic gamilit-db-secret \
  --from-literal=username='gamilit_user' \
  --from-literal=password='YOUR_STRONG_PASSWORD' \
  --namespace=gamilit-production

# JWT secret (generate with: openssl rand -base64 32)
kubectl create secret generic gamilit-jwt-secret \
  --from-literal=jwt_secret='YOUR_JWT_SECRET_MIN_32_CHARS' \
  --namespace=gamilit-production

# Redis connection (optional)
kubectl create secret generic gamilit-redis-secret \
  --from-literal=redis_url='redis://:password@gamilit-redis:6379' \
  --namespace=gamilit-production
```

### 3. Deploy Database

```bash
kubectl apply -f database/statefulset.yaml -n gamilit-production

# Wait for database to be ready
kubectl wait --for=condition=ready pod \
  -l app=gamilit,component=database \
  -n gamilit-production \
  --timeout=300s
```

### 4. Deploy Backend

```bash
# Apply all backend manifests
kubectl apply -f backend/ -n gamilit-production

# Watch deployment
kubectl rollout status deployment/gamilit-backend -n gamilit-production
```

### 5. Deploy Frontend

```bash
kubectl apply -f frontend/ -n gamilit-production

kubectl rollout status deployment/gamilit-frontend -n gamilit-production
```

### 6. Verify Deployment

```bash
# Check all resources
kubectl get all -n gamilit-production

# Check ingress
kubectl get ingress -n gamilit-production

# Check HPA
kubectl get hpa -n gamilit-production

# Check logs
kubectl logs -f deployment/gamilit-backend -n gamilit-production
```

## Environments

### Development

```bash
kubectl create namespace gamilit-development
# Use smaller resource limits and 1 replica for dev
```

### Staging

```bash
kubectl create namespace gamilit-staging
# Mirror production setup but with staging domain
```

### Production

```bash
kubectl create namespace gamilit-production
# Full production setup with HA, auto-scaling, monitoring
```

## Configuration

### Backend Deployment

- **Image**: `ghcr.io/gamilit/backend:latest`
- **Replicas**: 3 (min) - 10 (max with HPA)
- **Resources**:
  - Requests: CPU 250m, Memory 512Mi
  - Limits: CPU 500m, Memory 1Gi
- **Health Checks**:
  - Liveness: `/api/health` (30s interval)
  - Readiness: `/api/health` (5s interval)
  - Startup: `/api/health` (150s max startup time)
- **Auto-scaling**:
  - CPU: 70%
  - Memory: 80%

### Frontend Deployment

- **Image**: `ghcr.io/gamilit/frontend:latest`
- **Replicas**: 2 (min) - 5 (max)
- **Resources**:
  - Requests: CPU 100m, Memory 128Mi
  - Limits: CPU 200m, Memory 256Mi

### Database StatefulSet

- **Image**: `postgres:16-alpine`
- **Replicas**: 1
- **Storage**: 100Gi PVC
- **Resources**:
  - Requests: CPU 500m, Memory 1Gi
  - Limits: CPU 1000m, Memory 2Gi

## Ingress

### Backend Ingress

- **Domain**: `api.gamilit.com`
- **TLS**: Let's Encrypt certificate
- **Paths**:
  - `/api` → Backend Service
  - `/health` → Backend Service
  - `/metrics` → Backend Service (restricted)

### Frontend Ingress

- **Domains**: `gamilit.com`, `www.gamilit.com`
- **TLS**: Let's Encrypt certificate
- **Path**: `/` → Frontend Service

## Secrets Management

### Option 1: Manual Secrets (Basic)

```bash
kubectl create secret generic <name> --from-literal=key=value
```

**Pros**: Simple
**Cons**: Not stored in Git, manual rotation

### Option 2: Sealed Secrets (Recommended)

```bash
# Install Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Create and seal secret
kubectl create secret generic gamilit-db-secret \
  --from-literal=password='SECRET' \
  --dry-run=client -o yaml | \
  kubeseal --format=yaml > backend/sealed-secret.yaml

# Commit to Git (safe!)
git add backend/sealed-secret.yaml
```

**Pros**: GitOps-friendly, encrypted at rest
**Cons**: Requires controller

### Option 3: External Secrets Operator

```bash
# Install External Secrets
helm install external-secrets external-secrets/external-secrets

# Integrate with AWS Secrets Manager, HashiCorp Vault, etc.
```

**Pros**: Centralized secrets management, automatic rotation
**Cons**: Requires external secrets provider

## Monitoring

### Logs

```bash
# Backend logs
kubectl logs -f -l component=backend -n gamilit-production

# Frontend logs
kubectl logs -f -l component=frontend -n gamilit-production

# Database logs
kubectl logs -f statefulset/gamilit-postgres -n gamilit-production
```

### Metrics

```bash
# Pod resources
kubectl top pods -n gamilit-production

# Node resources
kubectl top nodes

# HPA status
kubectl get hpa -n gamilit-production
```

### Events

```bash
# Recent events
kubectl get events -n gamilit-production --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n gamilit-production --watch
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n gamilit-production

# Describe pod
kubectl describe pod <pod-name> -n gamilit-production

# Check logs
kubectl logs <pod-name> -n gamilit-production

# Previous logs (if pod restarted)
kubectl logs --previous <pod-name> -n gamilit-production
```

### Database Connection Errors

```bash
# Check database pod
kubectl get pods -l component=database -n gamilit-production

# Test connection from backend pod
kubectl exec -it deployment/gamilit-backend -n gamilit-production -- \
  psql -h gamilit-postgres -U gamilit_user -d gamilit_platform
```

### Ingress Not Working

```bash
# Check ingress
kubectl get ingress -n gamilit-production
kubectl describe ingress gamilit-backend-ingress -n gamilit-production

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment gamilit-backend --replicas=5 -n gamilit-production

# Scale frontend
kubectl scale deployment gamilit-frontend --replicas=3 -n gamilit-production
```

### Auto-scaling (HPA)

HPA automatically scales based on CPU/Memory:

```bash
# Check HPA
kubectl get hpa -n gamilit-production

# Describe HPA
kubectl describe hpa gamilit-backend-hpa -n gamilit-production
```

## Updates & Rollbacks

### Rolling Update

```bash
# Update image
kubectl set image deployment/gamilit-backend \
  backend=ghcr.io/gamilit/backend:v1.1.0 \
  -n gamilit-production

# Watch rollout
kubectl rollout status deployment/gamilit-backend -n gamilit-production
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/gamilit-backend -n gamilit-production

# Rollback to specific revision
kubectl rollout undo deployment/gamilit-backend --to-revision=2 -n gamilit-production

# Check history
kubectl rollout history deployment/gamilit-backend -n gamilit-production
```

## Backup

### Database Backup

```bash
# Create backup
kubectl exec -it statefulset/gamilit-postgres -n gamilit-production -- \
  pg_dump -U gamilit_user gamilit_platform | \
  gzip > backup-$(date +%Y%m%d).sql.gz
```

### Configuration Backup

```bash
# Export all manifests
kubectl get all -n gamilit-production -o yaml > backup-manifests.yaml
```

## Cleanup

```bash
# Delete specific resources
kubectl delete deployment gamilit-backend -n gamilit-production

# Delete all resources with label
kubectl delete all -l app=gamilit -n gamilit-production

# Delete namespace (WARNING: deletes everything)
kubectl delete namespace gamilit-production
```

## CI/CD Integration

The GitHub Actions workflows in `.github/workflows/` automate:
- Building Docker images
- Pushing to registry
- Deploying to Kubernetes
- Running health checks
- Rollback on failure

See `.github/workflows/backend-cicd.yml` and `.github/workflows/frontend-cicd.yml`

## Best Practices

1. **Always use namespaces** to isolate environments
2. **Never commit secrets** to Git (use Sealed Secrets or External Secrets)
3. **Set resource limits** to prevent resource exhaustion
4. **Use health checks** for self-healing
5. **Enable HPA** for auto-scaling
6. **Monitor metrics** and logs
7. **Test rollbacks** before production incidents
8. **Backup database** before major updates
9. **Use rolling updates** for zero-downtime deployments
10. **Document changes** in deployment history

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [cert-manager](https://cert-manager.io/)
- [nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/gamilit-backend -n gamilit-production`
- Describe resources: `kubectl describe <resource> <name> -n gamilit-production`
- Check events: `kubectl get events -n gamilit-production --sort-by='.lastTimestamp'`
- Review deployment guide: `/docs/04-planificacion/DEPLOYMENT-GUIDE.md`

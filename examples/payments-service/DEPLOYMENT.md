# Payments Service Deployment Guide

Complete guide for deploying the payments-service to Kubernetes using Crossplane.

## Prerequisites

Before deploying, ensure you have:

1. **Crossplane Setup**
   - Crossplane installed in your cluster
   - AWS provider configured
   - See [CROSSPLANE_SETUP.md](../../CROSSPLANE_SETUP.md) for details

2. **Kubernetes Access**
   - `kubectl` configured with cluster access
   - Appropriate permissions to create resources

3. **Container Registry**
   - Docker image pushed to a registry
   - Registry credentials configured in Kubernetes

4. **AWS Resources**
   - AWS account with appropriate permissions
   - AWS credentials configured in Crossplane

## Deployment Steps

### Step 1: Build and Push Docker Image

```bash
# Navigate to service directory
cd examples/payments-service

# Build Docker image
docker build -t your-registry/payments-service:v1.0.0 .

# Push to registry
docker push your-registry/payments-service:v1.0.0

# Or use GitHub Container Registry (GHCR)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker build -t ghcr.io/your-org/payments-service:v1.0.0 .
docker push ghcr.io/your-org/payments-service:v1.0.0
```

### Step 2: Deploy Infrastructure with Crossplane

#### Install the Composition

```bash
# Apply the Crossplane composition (XRD + Composition)
kubectl apply -f crossplane/composition.yaml

# Verify composition is installed
kubectl get xrd
kubectl get composition
```

Expected output:
```
NAME                              ESTABLISHED   OFFERED   AGE
xmicroservices.example.com        True          True      30s

NAME                   AGE
microservice-aws       30s
```

#### Deploy Development Environment

```bash
# Create the development claim
kubectl apply -f crossplane/claim-dev.yaml

# Watch the claim provisioning
kubectl get microservice payments-service-dev -w
```

This will provision:
- VPC with public/private subnets
- Internet Gateway and routing
- Security groups
- ECS cluster
- Application Load Balancer
- Target groups
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- CloudWatch log group

**Provisioning time**: ~10-15 minutes

#### Verify Infrastructure

```bash
# Check the claim status
kubectl get microservice payments-service-dev

# View all provisioned resources
kubectl get vpc,subnet,securitygroup,ecscluster,lb,targetgroup,rdsinstance,elasticachecluster

# Get detailed information
kubectl describe microservice payments-service-dev

# Check for any errors
kubectl get events --sort-by='.lastTimestamp' | grep -i error
```

### Step 3: Create Kubernetes Secrets

Before deploying the application, create secrets with database and Redis credentials:

```bash
# Get RDS endpoint
DB_HOST=$(kubectl get rdsinstance -o jsonpath='{.items[0].status.atProvider.endpoint}' | sed 's/:5432//')

# Get ElastiCache endpoint
REDIS_HOST=$(kubectl get elasticachecluster -o jsonpath='{.items[0].status.atProvider.cacheNodes[0].address}')

# Create secrets
kubectl create secret generic payments-service-secrets \
  --from-literal=db-host=$DB_HOST \
  --from-literal=db-user=admin \
  --from-literal=db-password=YOUR_DB_PASSWORD \
  --from-literal=redis-host=$REDIS_HOST

# Verify secret
kubectl get secret payments-service-secrets
```

**Note**: In production, use AWS Secrets Manager or HashiCorp Vault for secret management.

### Step 4: Deploy Application

#### Update Image Tag

```bash
# Update deployment with your image
sed -i "s|image:.*|image: your-registry/payments-service:v1.0.0|" k8s/deployment.yaml
```

#### Apply Kubernetes Manifests

```bash
# Deploy all manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get deployment,service,ingress

# Watch pods coming up
kubectl get pods -l app=payments-service -w
```

#### Check Deployment Status

```bash
# Check rollout status
kubectl rollout status deployment/payments-service

# Check pod logs
kubectl logs -l app=payments-service --tail=50

# Check pod events
kubectl get events --field-selector involvedObject.name=payments-service
```

### Step 5: Verify Deployment

#### Test Health Endpoints

```bash
# Port forward to the service
kubectl port-forward svc/payments-service 8080:80

# In another terminal, test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready
curl http://localhost:8080/metrics
```

Expected responses:
```json
// /health
{"status":"healthy","service":"payments-service"}

// /ready
{"status":"ready","checks":{"database":"healthy","cache":"healthy"}}
```

#### Test API Endpoints

```bash
# Create a payment
curl -X POST http://localhost:8080/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "source": "tok_visa",
    "description": "Test payment"
  }'

# Get payment details
curl http://localhost:8080/api/v1/payments/pay_123456789
```

### Step 6: Configure Ingress (Optional)

If using ingress for external access:

```bash
# Update ingress hostname
sed -i "s|payments.example.com|payments.your-domain.com|" k8s/ingress.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Check ingress
kubectl get ingress payments-service

# Wait for external IP/hostname
kubectl get ingress payments-service -w
```

#### Configure DNS

Add a DNS record pointing to the load balancer:
```
payments.your-domain.com -> ALB-HOSTNAME
```

#### Test External Access

```bash
curl https://payments.your-domain.com/health
```

## Production Deployment

### Deploy Production Environment

```bash
# Apply production claim with higher resources
kubectl apply -f crossplane/claim-prod.yaml

# Wait for provisioning (15-20 minutes)
kubectl wait --for=condition=Ready microservice/payments-service-prod --timeout=20m

# Update namespace in manifests if needed
# Then deploy to production namespace
kubectl apply -f k8s/ -n production
```

### Production Checklist

- [ ] Resource limits properly configured
- [ ] Multiple replicas for high availability
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] Secrets stored in secrets manager
- [ ] TLS certificates configured
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] Disaster recovery plan in place
- [ ] Runbook documentation reviewed

## Monitoring

### CloudWatch Logs

```bash
# View logs in CloudWatch
aws logs tail /ecs/payments-service --follow --region us-west-2
```

### Prometheus Metrics

```bash
# Port forward to metrics endpoint
kubectl port-forward svc/payments-service 8080:80

# Scrape metrics
curl http://localhost:8080/metrics
```

### Grafana Dashboard

Import the Grafana dashboard:
```
Dashboard ID: TBD
```

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment/payments-service --replicas=5

# Verify scaling
kubectl get pods -l app=payments-service
```

### Auto-scaling

```bash
# Create HPA
kubectl autoscale deployment payments-service \
  --cpu-percent=70 \
  --min=2 \
  --max=10

# Check HPA status
kubectl get hpa payments-service
```

## Rollback

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/payments-service

# Rollback to previous version
kubectl rollout undo deployment/payments-service

# Rollback to specific revision
kubectl rollout undo deployment/payments-service --to-revision=2

# Check rollout status
kubectl rollout status deployment/payments-service
```

### Delete Infrastructure

```bash
# Delete application
kubectl delete -f k8s/

# Delete infrastructure (WARNING: This deletes all AWS resources)
kubectl delete -f crossplane/claim-dev.yaml

# Verify deletion
kubectl get microservice
kubectl get vpc,subnet,rdsinstance,elasticachecluster
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -l app=payments-service

# Describe pod
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h $DB_HOST -U admin -d payments

# Check security groups
aws ec2 describe-security-groups --group-ids <sg-id>

# Check RDS status
kubectl get rdsinstance -o yaml
```

### Infrastructure Not Provisioning

```bash
# Check Crossplane logs
kubectl logs -n crossplane-system -l app=crossplane

# Check provider logs
kubectl logs -n crossplane-system -l pkg.crossplane.io/provider=provider-aws-ec2

# Describe the claim
kubectl describe microservice payments-service-dev

# Check provider health
kubectl get provider
```

### High Memory/CPU Usage

```bash
# Check resource usage
kubectl top pod -l app=payments-service

# Scale horizontally
kubectl scale deployment/payments-service --replicas=5

# Update resource limits
kubectl edit deployment payments-service
```

## CI/CD Integration

### GitHub Actions

The repository includes GitHub Actions workflows:

- `.github/workflows/ci.yml` - Build, test, scan
- `.github/workflows/deploy.yml` - Deploy infrastructure and application

Required secrets:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
EKS_CLUSTER_NAME
GITHUB_TOKEN (automatically provided)
```

### Manual Trigger

```bash
# Trigger deployment via GitHub CLI
gh workflow run deploy.yml -f environment=dev

# Check workflow status
gh run list --workflow=deploy.yml
```

## Best Practices

1. **GitOps**: Store all manifests in Git
2. **Immutable Tags**: Use specific image tags, not `latest`
3. **Resource Limits**: Always set resource requests and limits
4. **Health Checks**: Configure liveness and readiness probes
5. **Secrets**: Never commit secrets to Git
6. **Monitoring**: Set up alerts for critical metrics
7. **Backups**: Enable automated backups for databases
8. **Documentation**: Keep runbooks up to date
9. **Testing**: Test in dev/staging before production
10. **Security**: Regular security scans and updates

## Additional Resources

- [Crossplane Setup Guide](../../CROSSPLANE_SETUP.md)
- [Service Documentation](docs/index.md)
- [Operational Runbook](docs/runbook.md)
- [API Documentation](https://api-docs.example.com/payments-service)

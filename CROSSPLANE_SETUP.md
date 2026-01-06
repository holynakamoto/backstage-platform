# Crossplane Setup Guide for Backstage Platform

This guide walks you through setting up Crossplane with the AWS provider to enable infrastructure provisioning for your Backstage platform.

## Prerequisites

- Kubernetes cluster (local or cloud)
- `kubectl` configured with cluster access
- `helm` 3.x installed
- AWS account with appropriate permissions
- AWS CLI configured

## Step 1: Install Crossplane

### Using Helm

```bash
# Add the Crossplane Helm repository
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update

# Create namespace
kubectl create namespace crossplane-system

# Install Crossplane
helm install crossplane \
  crossplane-stable/crossplane \
  --namespace crossplane-system \
  --create-namespace \
  --wait

# Verify installation
kubectl get pods -n crossplane-system
```

Expected output:
```
NAME                                       READY   STATUS    RESTARTS   AGE
crossplane-7fdfbd6c6b-j4x2k               1/1     Running   0          60s
crossplane-rbac-manager-84c9c579d7-x9k5m  1/1     Running   0          60s
```

### Using kubectl

```bash
# Install Crossplane CRDs and controller
kubectl apply -f https://raw.githubusercontent.com/crossplane/crossplane/master/cluster/crds/core/core.yaml
kubectl apply -f https://raw.githubusercontent.com/crossplane/crossplane/master/cluster/crds/packages/packages.yaml
kubectl apply -f https://raw.githubusercontent.com/crossplane/crossplane/master/cluster/deploy/crossplane.yaml

# Verify installation
kubectl get deployment -n crossplane-system crossplane
```

## Step 2: Install AWS Provider

Crossplane uses providers to interact with cloud APIs. We'll install the AWS provider.

### Option A: Using upjet-provider-aws (Recommended)

This is the newer, automatically generated provider with more resources.

```bash
# Create provider configuration
cat <<EOF | kubectl apply -f -
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-ec2
spec:
  package: xpkg.upbound.io/upbound/provider-aws-ec2:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-rds
spec:
  package: xpkg.upbound.io/upbound/provider-aws-rds:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-elasticache
spec:
  package: xpkg.upbound.io/upbound/provider-aws-elasticache:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-ecs
spec:
  package: xpkg.upbound.io/upbound/provider-aws-ecs:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-elbv2
spec:
  package: xpkg.upbound.io/upbound/provider-aws-elbv2:v1.1.0
---
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-cloudwatchlogs
spec:
  package: xpkg.upbound.io/upbound/provider-aws-cloudwatchlogs:v1.1.0
EOF

# Wait for providers to be healthy
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-ec2 --timeout=300s
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-rds --timeout=300s
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-elasticache --timeout=300s
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-ecs --timeout=300s
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-elbv2 --timeout=300s
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws-cloudwatchlogs --timeout=300s

# Verify installation
kubectl get provider
```

### Option B: Using provider-aws (Community)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws
spec:
  package: crossplane/provider-aws:v0.46.0
EOF

# Wait for provider to be healthy
kubectl wait --for=condition=Healthy provider.pkg.crossplane.io/provider-aws --timeout=300s
```

## Step 3: Configure AWS Credentials

### Create AWS IAM User

1. Create an IAM user with programmatic access
2. Attach the following managed policies:
   - `AmazonEC2FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonElastiCacheFullAccess`
   - `AmazonECS_FullAccess`
   - `ElasticLoadBalancingFullAccess`
   - `CloudWatchLogsFullAccess`

3. Save the Access Key ID and Secret Access Key

### Create Kubernetes Secret

```bash
# Create AWS credentials file
cat > aws-credentials.txt <<EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF

# Create secret in Kubernetes
kubectl create secret generic aws-creds \
  -n crossplane-system \
  --from-file=creds=./aws-credentials.txt

# Verify secret
kubectl get secret aws-creds -n crossplane-system

# Clean up credentials file
rm aws-credentials.txt
```

### Configure ProviderConfig

For upjet providers:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: aws.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: Secret
    secretRef:
      namespace: crossplane-system
      name: aws-creds
      key: creds
EOF
```

For community provider:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: aws.crossplane.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: Secret
    secretRef:
      namespace: crossplane-system
      name: aws-creds
      key: creds
EOF
```

## Step 4: Verify Setup

### Test with a Simple Resource

```bash
# Create a test S3 bucket
cat <<EOF | kubectl apply -f -
apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: test-crossplane-bucket-$(date +%s)
spec:
  forProvider:
    region: us-west-2
  providerConfigRef:
    name: default
EOF

# Check bucket status
kubectl get bucket
```

Expected output (after ~30 seconds):
```
NAME                          READY   SYNCED   EXTERNAL-NAME               AGE
test-crossplane-bucket-1234   True    True     test-crossplane-bucket-1234 60s
```

### Clean up test resource

```bash
kubectl delete bucket test-crossplane-bucket-1234
```

## Step 5: Install the Microservice Composition

Now you can install the microservice composition for the payments-service:

```bash
# Apply the composition
kubectl apply -f examples/payments-service/crossplane/composition.yaml

# Verify composition
kubectl get composition
```

## Using Crossplane with Backstage

### Deploy a Service from Backstage

1. Go to Backstage: http://localhost:3000
2. Click "Create" in the sidebar
3. Select "Production-Ready Microservice with Crossplane"
4. Fill in the form:
   - Service name: `my-service`
   - Runtime: `nodejs`
   - Environment: `dev`
   - Enable database: Yes
   - Enable cache: Yes
5. Click "Create"

### Monitor Provisioning

```bash
# Watch the claim
kubectl get microservice -w

# Check individual resources
kubectl get vpc
kubectl get subnet
kubectl get securitygroup
kubectl get ecscluster
kubectl get rdsinstance
kubectl get elasticachecluster

# View events
kubectl describe microservice my-service-dev
```

### Access Provisioned Resources

```bash
# Get VPC ID
kubectl get vpc -o jsonpath='{.items[0].status.atProvider.id}'

# Get RDS endpoint
kubectl get rdsinstance -o jsonpath='{.items[0].status.atProvider.endpoint}'

# Get ElastiCache endpoint
kubectl get elasticachecluster -o jsonpath='{.items[0].status.atProvider.cacheNodes[0].address}'
```

## Troubleshooting

### Provider Not Healthy

```bash
# Check provider status
kubectl get provider

# Check provider logs
kubectl logs -n crossplane-system -l pkg.crossplane.io/provider=provider-aws-ec2

# Describe provider
kubectl describe provider provider-aws-ec2
```

### Authentication Issues

```bash
# Verify secret exists
kubectl get secret aws-creds -n crossplane-system

# Check ProviderConfig
kubectl get providerconfig
kubectl describe providerconfig default

# Test AWS credentials manually
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy aws sts get-caller-identity
```

### Resource Not Provisioning

```bash
# Check resource status
kubectl describe <resource-kind> <resource-name>

# Check Crossplane logs
kubectl logs -n crossplane-system -l app=crossplane

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Permission Denied Errors

Ensure your IAM user has the necessary permissions:

```bash
# Test specific permission
aws ec2 describe-vpcs --region us-west-2
aws rds describe-db-instances --region us-west-2
aws elasticache describe-cache-clusters --region us-west-2
```

## Advanced Configuration

### Multiple AWS Accounts

```bash
# Create separate ProviderConfigs for different accounts
cat <<EOF | kubectl apply -f -
apiVersion: aws.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: dev-account
spec:
  credentials:
    source: Secret
    secretRef:
      namespace: crossplane-system
      name: aws-creds-dev
      key: creds
---
apiVersion: aws.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: prod-account
spec:
  credentials:
    source: Secret
    secretRef:
      namespace: crossplane-system
      name: aws-creds-prod
      key: creds
EOF
```

### Using IAM Roles for Service Accounts (IRSA)

For EKS clusters, you can use IRSA instead of access keys:

```bash
# Create IAM role with trust policy for your EKS cluster
# Attach necessary policies to the role

# Create ServiceAccount
kubectl create sa crossplane-aws -n crossplane-system

# Annotate ServiceAccount with IAM role
kubectl annotate sa crossplane-aws -n crossplane-system \
  eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT_ID:role/crossplane-role

# Update ProviderConfig
cat <<EOF | kubectl apply -f -
apiVersion: aws.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: InjectedIdentity
EOF
```

## Best Practices

1. **Use Compositions**: Create reusable compositions for common infrastructure patterns
2. **Version Control**: Store all Crossplane manifests in Git
3. **Naming Conventions**: Use consistent naming for resources
4. **Resource Tags**: Add tags to all resources for cost tracking
5. **Secrets Management**: Use external secrets operators for sensitive data
6. **Monitoring**: Monitor Crossplane controller logs and resource status
7. **Testing**: Test compositions in dev/staging before production
8. **Documentation**: Document custom compositions and their parameters

## Resources

- [Crossplane Documentation](https://crossplane.io/docs/)
- [AWS Provider Docs](https://marketplace.upbound.io/providers/upbound/provider-aws/)
- [Backstage Crossplane Plugin](https://github.com/RoadieHQ/roadie-backstage-plugins/tree/main/plugins/frontend/backstage-plugin-crossplane)
- [Crossplane Slack](https://slack.crossplane.io/)

## Next Steps

1. Review the [payments-service example](examples/payments-service/README.md)
2. Create custom compositions for your organization
3. Integrate with GitOps tools (ArgoCD, Flux)
4. Set up monitoring with Prometheus/Grafana
5. Configure backup and disaster recovery


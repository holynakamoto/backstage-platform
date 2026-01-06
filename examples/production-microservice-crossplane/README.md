# Production-Ready Microservice Template with Crossplane

This template creates a production-ready microservice with:

- **Crossplane Infrastructure**: Declarative AWS resource provisioning
- **CI/CD Pipelines**: GitHub Actions for build, test, and deployment
- **Kubernetes Manifests**: Production-ready deployment configurations
- **Multi-Runtime Support**: Node.js, Go, or Python
- **Observability**: CloudWatch, Prometheus, distributed tracing
- **Database & Cache**: Optional RDS PostgreSQL and ElastiCache Redis

## Template Structure

```
production-microservice-crossplane/
├── template.yaml              # Template definition
└── skeleton/                  # Template files
    ├── catalog-info.yaml.njk  # Backstage catalog metadata
    ├── .github/
    │   └── workflows/
    │       ├── ci.yml.njk     # CI pipeline
    │       └── deploy.yml.njk  # Deployment pipeline
    ├── crossplane/
    │   ├── composition.yaml.njk  # XRD + Composition
    │   ├── claim-dev.yaml.njk    # Dev environment claim
    │   └── claim-prod.yaml.njk   # Prod environment claim
    ├── k8s/
    │   ├── deployment.yaml.njk
    │   ├── service.yaml.njk
    │   └── ingress.yaml.njk
    ├── Dockerfile.njk
    ├── server.js.njk          # Node.js (if runtime=nodejs)
    ├── package.json.njk       # Node.js dependencies
    ├── src/
    │   ├── golang/
    │   │   ├── main.go.njk
    │   │   └── go.mod.njk
    │   └── python/
    │       ├── app.py.njk
    │       └── requirements.txt.njk
    ├── docs/
    │   ├── index.md.njk
    │   └── runbook.md
    ├── README.md.njk
    └── mkdocs.yml.njk
```

## Features

### Infrastructure as Code

- **Crossplane XRD**: Defines `Microservice` composite resource
- **Composition**: Maps to AWS resources (ECS, VPC, ALB, RDS, ElastiCache)
- **Claims**: Environment-specific infrastructure declarations
- **GitOps Ready**: All infrastructure in Git, managed via Kubernetes API

### CI/CD Pipeline

- **Build**: Multi-stage Docker builds
- **Test**: Unit tests, linting, security scanning
- **Security**: Trivy vulnerability scanning
- **Deploy**: Automated infrastructure and application deployment
- **Smoke Tests**: Post-deployment validation

### Kubernetes Deployment

- **Deployment**: Configurable replicas, resource limits, health checks
- **Service**: ClusterIP service for internal access
- **Ingress**: External access with TLS termination
- **ConfigMaps & Secrets**: Environment configuration

### Runtime Support

- **Node.js**: Express.js server with npm dependencies
- **Go**: Standard HTTP server with Go modules
- **Python**: Flask application with gunicorn

## Usage

1. Navigate to **Create** in Backstage
2. Select **"Production-Ready Microservice with Crossplane"**
3. Fill in the form:
   - Service name, description, owner
   - Runtime (Node.js, Go, or Python)
   - Environment (dev, staging, prod)
   - AWS region
   - Enable database/cache/observability
4. Provide GitHub repository URL
5. Click **Create**

## Prerequisites

- Kubernetes cluster with Crossplane installed
- AWS provider configured in Crossplane
- GitHub repository for CI/CD
- kubectl access to cluster

## Crossplane Setup

```bash
# Install Crossplane
helm install crossplane crossplane-stable/crossplane \
  --namespace crossplane-system \
  --create-namespace

# Install AWS provider
kubectl apply -f - <<EOF
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws
spec:
  package: xpkg.upbound.io/upbound/provider-aws-ec2:v0.45.0
EOF
```

## Customization

Edit the template files to match your organization's standards:

- Add custom CI/CD steps
- Modify resource sizes
- Add additional AWS resources
- Customize Kubernetes manifests
- Add organization-specific documentation

## Documentation

Generated components include:

- **README.md**: Service overview and getting started
- **docs/index.md**: Architecture and configuration
- **docs/runbook.md**: Operational procedures
- **TechDocs**: Auto-generated from Markdown files

## Next Steps

After creating a service:

1. Review generated code and manifests
2. Customize for your specific needs
3. Deploy infrastructure: `kubectl apply -f crossplane/claim-dev.yaml`
4. Deploy application: `kubectl apply -f k8s/`
5. Monitor via Backstage Kubernetes plugin


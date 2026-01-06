# Payments Service

Payment processing microservice with Stripe integration, built with Node.js and managed by Crossplane.

## Quick Start

### Prerequisites

- Node.js 18+
- Docker
- kubectl with cluster access
- Crossplane installed with AWS provider

### Local Development

```bash
# Install dependencies
npm install

# Start dependencies
docker-compose up -d

# Set environment variables
export DB_HOST=localhost
export DB_PASSWORD=password
export REDIS_HOST=localhost

# Run the service
npm run dev
```

The service will be available at `http://localhost:3000`.

### Testing

```bash
# Health check
curl http://localhost:3000/health

# Create a payment
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "source": "tok_visa",
    "description": "Test payment"
  }'
```

## Deployment

### Deploy to Kubernetes

```bash
# Deploy infrastructure via Crossplane
kubectl apply -f crossplane/composition.yaml
kubectl apply -f crossplane/claim-dev.yaml

# Wait for infrastructure
kubectl wait --for=condition=Ready microservice/payments-service-dev --timeout=10m

# Deploy application
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -l app=payments-service
```

### CI/CD

This project uses GitHub Actions for CI/CD:

- **CI**: Runs on every push/PR (test, lint, build, security scan)
- **Deploy**: Deploys to environments on push to `main`

Required secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EKS_CLUSTER_NAME`

## Architecture

```
┌─────────────────┐
│      ALB        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│   ECS Tasks     │────▶│  PostgreSQL  │
│  (Containers)   │     │   (RDS)      │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐
│  ElastiCache    │
│    (Redis)      │
└─────────────────┘
```

### Key Features

- **Declarative Infrastructure**: Crossplane manages all AWS resources
- **Production-Ready**: Health checks, graceful shutdown, structured logging
- **Observability**: Prometheus metrics, CloudWatch logs
- **Security**: Non-root containers, secret management, TLS termination
- **Scalability**: Auto-scaling based on load

## API Documentation

See [API Documentation](docs/api.md) for detailed endpoint documentation.

## Monitoring

- **Metrics**: Available at `/metrics` (Prometheus format)
- **Logs**: Structured JSON logs to CloudWatch
- **Dashboard**: [Grafana](https://your-org.grafana.net/d/payments-service)

## Support

- **Documentation**: [Full Documentation](docs/index.md)
- **Runbook**: [Operational Runbook](docs/runbook.md)
- **Slack**: #payments-service
- **Oncall**: PagerDuty

## License

Proprietary - Internal use only

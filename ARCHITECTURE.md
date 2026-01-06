# Backstage Platform Architecture

This document describes the architecture of the Backstage platform with Crossplane integration.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Developer Experience"
        Dev[Developer] -->|Uses| BS[Backstage UI]
        BS -->|Creates Service| Template[Software Template]
    end
    
    subgraph "Backstage Platform"
        BS -->|Scaffolds| Git[Git Repository]
        BS -->|Registers| Catalog[Service Catalog]
        BS -->|Generates| Docs[TechDocs]
    end
    
    subgraph "CI/CD"
        Git -->|Triggers| GHA[GitHub Actions]
        GHA -->|Build| Docker[Docker Image]
        GHA -->|Scan| Trivy[Security Scan]
        GHA -->|Deploy| K8s[Kubernetes]
    end
    
    subgraph "Infrastructure as Code"
        Template -->|Generates| XRD[Crossplane XRD]
        XRD -->|Provisions| AWS[AWS Resources]
        AWS -->|Creates| VPC[VPC]
        AWS -->|Creates| RDS[RDS]
        AWS -->|Creates| ECS[ECS/EKS]
        AWS -->|Creates| ALB[Load Balancer]
        AWS -->|Creates| Cache[ElastiCache]
    end
    
    subgraph "Running Application"
        K8s -->|Deploys| Pod[Application Pods]
        Pod -->|Connects| RDS
        Pod -->|Connects| Cache
        ALB -->|Routes| Pod
    end
    
    subgraph "Observability"
        Pod -->|Logs| CW[CloudWatch]
        Pod -->|Metrics| Prom[Prometheus]
        CW --> Grafana[Grafana]
        Prom --> Grafana
    end
```

## Crossplane Resource Flow

```mermaid
graph LR
    subgraph "Developer Action"
        User[Developer] -->|Creates via Backstage| Claim[Microservice Claim]
    end
    
    subgraph "Crossplane Control Plane"
        Claim -->|Triggers| XR[Composite Resource]
        XR -->|Uses| Comp[Composition]
        Comp -->|Creates| MR[Managed Resources]
    end
    
    subgraph "AWS Provider"
        MR -->|Provisions| VPC[VPC]
        MR -->|Provisions| SG[Security Groups]
        MR -->|Provisions| SUB[Subnets]
        MR -->|Provisions| RDS[RDS Instance]
        MR -->|Provisions| EC[ElastiCache]
        MR -->|Provisions| ECS[ECS Cluster]
        MR -->|Provisions| ALB[Load Balancer]
    end
    
    subgraph "AWS Cloud"
        VPC
        SG
        SUB
        RDS
        EC
        ECS
        ALB
    end
```

## Service Creation Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant BS as Backstage
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant CP as Crossplane
    participant AWS as AWS
    participant K8s as Kubernetes
    
    Dev->>BS: Create new service
    BS->>BS: Scaffold from template
    BS->>GH: Create repository
    BS->>BS: Register in catalog
    
    GH->>GHA: Push triggers CI
    GHA->>GHA: Run tests
    GHA->>GHA: Build Docker image
    GHA->>GHA: Security scan
    GHA->>GH: Push image to registry
    
    GHA->>CP: Apply Crossplane claim
    CP->>AWS: Provision VPC
    CP->>AWS: Provision RDS
    CP->>AWS: Provision ElastiCache
    CP->>AWS: Provision ECS/ALB
    AWS-->>CP: Resources ready
    
    GHA->>K8s: Deploy application
    K8s->>K8s: Create pods
    K8s->>AWS: Connect to RDS
    K8s->>AWS: Connect to ElastiCache
    AWS-->>Dev: Service live!
```

## Payment Service Architecture

```mermaid
graph TB
    subgraph "External"
        User[End User]
        Stripe[Stripe API]
    end
    
    subgraph "AWS - us-west-2"
        subgraph "VPC"
            subgraph "Public Subnets"
                ALB[Application Load Balancer]
            end
            
            subgraph "Private Subnets"
                subgraph "ECS/EKS"
                    Pod1[Payment Service Pod 1]
                    Pod2[Payment Service Pod 2]
                    Pod3[Payment Service Pod 3]
                end
                
                RDS[(PostgreSQL RDS)]
                EC[(Redis ElastiCache)]
            end
        end
        
        CW[CloudWatch Logs]
    end
    
    User -->|HTTPS| ALB
    ALB -->|Health Check| Pod1
    ALB -->|Load Balance| Pod1
    ALB -->|Load Balance| Pod2
    ALB -->|Load Balance| Pod3
    
    Pod1 -->|Query| RDS
    Pod2 -->|Query| RDS
    Pod3 -->|Query| RDS
    
    Pod1 -->|Cache| EC
    Pod2 -->|Cache| EC
    Pod3 -->|Cache| EC
    
    Pod1 -->|Process Payment| Stripe
    Pod2 -->|Process Payment| Stripe
    Pod3 -->|Process Payment| Stripe
    
    Pod1 -->|Logs| CW
    Pod2 -->|Logs| CW
    Pod3 -->|Logs| CW
```

## Component Relationships

```mermaid
graph LR
    subgraph "Backstage Components"
        Catalog[Service Catalog]
        Templates[Software Templates]
        TechDocs[TechDocs]
        Search[Search]
    end
    
    subgraph "Services"
        Demo[Demo Service]
        Payments[Payments Service]
        Future[Future Services...]
    end
    
    subgraph "Infrastructure"
        CP[Crossplane]
        AWS[AWS Resources]
    end
    
    Templates -->|Creates| Demo
    Templates -->|Creates| Payments
    Templates -->|Creates| Future
    
    Demo -->|Registered in| Catalog
    Payments -->|Registered in| Catalog
    Future -->|Registered in| Catalog
    
    Demo -->|Documented in| TechDocs
    Payments -->|Documented in| TechDocs
    Future -->|Documented in| TechDocs
    
    Catalog -->|Searchable via| Search
    
    Payments -->|Provisions via| CP
    Future -->|Provisions via| CP
    CP -->|Manages| AWS
```

## Technology Stack

```mermaid
mindmap
  root((Backstage Platform))
    Frontend
      React
      Material UI
      TypeScript
    Backend
      Node.js
      Express
      TypeScript
    Database
      PostgreSQL
    Templates
      Nunjucks
      YAML
    Infrastructure
      Crossplane
        AWS Provider
        Compositions
        XRDs
      Kubernetes
        EKS
        Deployments
        Services
      AWS
        VPC
        ECS
        RDS
        ElastiCache
        ALB
        CloudWatch
    Applications
      Node.js
        Express
        Winston
        Prometheus Client
      Python
        Flask
        Gunicorn
      Go
        net/http
        logrus
    CI/CD
      GitHub Actions
      Docker
      Trivy
      kubectl
    Monitoring
      Prometheus
      Grafana
      CloudWatch
      Logs
```

## Architecture Components

### 1. Developer Experience Layer

**Backstage UI**
- Single entry point for developers
- Service catalog browsing
- Template-based service creation
- Documentation access
- Search functionality

**Software Templates**
- Pre-configured project templates
- Parameterized scaffolding
- Automatic catalog registration
- Documentation generation

### 2. Backstage Platform Layer

**Service Catalog**
- Centralized service registry
- Metadata management
- Relationship tracking
- Ownership information

**TechDocs**
- Co-located documentation
- Markdown-based
- Version-controlled
- Auto-generated sites

**Search**
- Full-text search
- Catalog search
- Documentation search
- Filtering and faceting

### 3. CI/CD Layer

**GitHub Actions**
- Automated testing
- Docker image building
- Security scanning
- Deployment automation

**Docker**
- Containerization
- Multi-stage builds
- Image optimization
- Registry management

**Security Scanning**
- Trivy vulnerability scanning
- Dependency checking
- Image scanning
- Compliance reporting

### 4. Infrastructure as Code Layer

**Crossplane**
- Kubernetes-native IaC
- Multi-cloud abstraction
- Resource composition
- Drift detection

**AWS Provider**
- EC2 (VPC, Subnets, Security Groups)
- RDS (PostgreSQL)
- ElastiCache (Redis)
- ECS/EKS (Container orchestration)
- ELB (Load balancers)
- CloudWatch (Logging)

### 5. Application Runtime Layer

**Kubernetes**
- Pod orchestration
- Service discovery
- Load balancing
- Auto-scaling
- Health checks

**Application Services**
- Express.js (Node.js)
- Flask (Python)
- net/http (Go)
- Database connections
- Cache connections

### 6. Observability Layer

**Metrics**
- Prometheus collection
- Custom application metrics
- Infrastructure metrics
- Grafana dashboards

**Logging**
- Structured JSON logs
- CloudWatch integration
- Centralized log aggregation
- Log retention policies

**Tracing**
- Distributed tracing (future)
- Request correlation
- Performance analysis

## Data Flow

### Service Creation Flow

1. **Developer initiates** service creation via Backstage UI
2. **Template execution** scaffolds project files
3. **Git repository** created with initial code
4. **Catalog registration** adds service to Backstage catalog
5. **CI pipeline** triggered on repository push
6. **Infrastructure provisioning** via Crossplane claim
7. **Application deployment** to Kubernetes
8. **Service available** and monitored

### Request Flow

1. **User request** arrives at Application Load Balancer
2. **Load balancer** routes to healthy pod
3. **Application pod** processes request
4. **Database queries** executed if needed
5. **Cache lookups** performed for performance
6. **External APIs** called (e.g., Stripe)
7. **Response returned** to user
8. **Metrics logged** for observability

## Security Architecture

### Network Security
- VPC isolation
- Private subnets for workloads
- Security groups for access control
- TLS termination at load balancer

### Application Security
- Non-root containers
- Read-only filesystems
- Secret management
- Security scanning in CI

### Infrastructure Security
- IAM roles and policies
- Least privilege access
- Audit logging
- Encryption at rest and in transit

## Scalability

### Horizontal Scaling
- Kubernetes HPA (Horizontal Pod Autoscaler)
- Auto-scaling based on CPU/memory
- Load balancer distribution
- Multi-AZ deployment

### Vertical Scaling
- Resource limits per environment
- Database instance sizing
- Cache cluster sizing
- Load balancer capacity

## High Availability

### Multi-AZ Deployment
- Pods across availability zones
- Database multi-AZ configuration
- Load balancer across AZs
- Automatic failover

### Health Checks
- Liveness probes
- Readiness probes
- Database connectivity checks
- Cache connectivity checks

## Disaster Recovery

### Backup Strategy
- Database automated backups
- Configuration backups
- State management
- Recovery procedures

### Failover Procedures
- Cross-region replication (future)
- Backup restoration
- Service restoration
- Data consistency checks

## Cost Optimization

### Resource Right-Sizing
- Environment-specific sizing
- Auto-scaling policies
- Reserved instances (future)
- Spot instances (future)

### Monitoring
- Cost tracking
- Resource utilization
- Optimization recommendations
- Budget alerts

## Future Enhancements

### Planned Features
- Multi-cloud support (GCP, Azure)
- Service mesh integration
- Advanced monitoring
- Cost optimization tools
- Policy enforcement
- GitOps integration

### Integration Opportunities
- ArgoCD for GitOps
- Istio/Linkerd for service mesh
- OPA for policy enforcement
- Cost management tools
- Advanced analytics

---

For detailed deployment instructions, see [DEPLOYMENT.md](examples/payments-service/DEPLOYMENT.md)

For Crossplane setup, see [CROSSPLANE_SETUP.md](CROSSPLANE_SETUP.md)


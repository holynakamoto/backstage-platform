# Quick Start Guide: Backstage Platform Engineering Demo

This guide walks you through using the Backstage instance we've set up to create and document a Node.js service using the golden path approach.

## Prerequisites ✅

All prerequisites are already met in this setup:
- ✅ Node.js 20+ (verified)
- ✅ Yarn (installed and configured)
- ✅ Python 3 + mkdocs (for TechDocs local generation)
- ✅ Git

## Current Setup Status

This Backstage instance includes:
- ✅ **Software Catalog** - Centralized service discovery
- ✅ **Software Templates (Scaffolder)** - Self-service project creation
- ✅ **TechDocs** - Co-located documentation
- ✅ **Sample Component** - Pre-scaffolded `demo-service` example

## Step 1: Start Backstage

```bash
cd /Users/nickmoore/backstage/backstage
yarn start
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:7007

The app will automatically open in your browser.

## Step 2: Explore the Sample Component

1. Navigate to **Software Catalog** (left sidebar or http://localhost:3000/catalog)
2. Search for `demo-service`
3. Click on `demo-service` to view:
   - **Overview**: Component metadata and details
   - **Docs**: TechDocs documentation (already generated!)
   - **Relations**: Component relationships

**Location**: `examples/demo-service/`

This demonstrates a complete Node.js Express service with:
- Express.js server (`server.js`)
- Health check endpoint (`/health`)
- TechDocs documentation (`docs/index.md`)
- Catalog registration (`catalog-info.yaml`)

## Step 3: Create a New Component via Scaffolder

### Using the Node.js Website Template

1. Navigate to **Create** (left sidebar or http://localhost:3000/create)
2. Select **"Node.js Website Template"**
3. Fill in the form:

   **Component Details:**
   - **Component Name**: `my-new-service` (lowercase, hyphens allowed)
   - **Description**: "A new Node.js service created via Backstage"
   - **Owner**: `user:guest` (or your username if auth is configured)

   **Repository (Optional):**
   - **Repository Location**: Leave empty for local-only, or provide GitHub URL
   - If using GitHub, set `GITHUB_TOKEN` environment variable:
     ```bash
     export GITHUB_TOKEN=your_github_token_here
     ```

4. Click **Create**

### What Happens Behind the Scenes

The scaffolder will:
- ✅ Generate Express.js boilerplate code
- ✅ Create `package.json` with dependencies
- ✅ Set up `catalog-info.yaml` for catalog registration
- ✅ Create TechDocs-ready documentation structure
- ✅ (Optional) Create GitHub repository and push code
- ✅ Automatically register component in Software Catalog

### Template Output Structure

```
my-new-service/
├── server.js              # Express server with health check
├── package.json           # Dependencies and scripts
├── catalog-info.yaml      # Catalog metadata with TechDocs annotation
├── README.md              # Project documentation
├── docs/
│   └── index.md          # TechDocs documentation
├── mkdocs.yml            # MkDocs configuration
└── .gitignore            # Git ignore rules
```

## Step 4: View Your New Component

1. Go to **Software Catalog**
2. Search for your component name
3. Click on it to view:
   - Component details
   - **Docs** tab (TechDocs will generate automatically)
   - Relations and metadata

## Step 5: Add/Edit Documentation

### Adding Documentation

1. Navigate to your component directory:
   ```bash
   cd examples/my-new-service  # or wherever it was created
   ```

2. Edit `docs/index.md` to add your documentation:
   ```markdown
   # My New Service

   ## Overview
   This service was created using Backstage Software Templates.

   ## API Endpoints
   - `GET /` - Service information
   - `GET /health` - Health check
   ```

3. TechDocs will automatically regenerate when you refresh the Docs tab in Backstage

### Documentation Structure

- **Location**: `docs/` directory in your component
- **Format**: Markdown files
- **Configuration**: `mkdocs.yml` (already included)
- **TechDocs Plugin**: `techdocs-core` (already configured)

## Step 6: Run Your Component Locally

```bash
cd examples/my-new-service  # or your component location
npm install
npm start
```

The service will run on port 3000 (or PORT env var).

Test endpoints:
- http://localhost:3000/ - Service info
- http://localhost:3000/health - Health check

## Quick Validation Checklist

- [x] Backstage runs at http://localhost:3000
- [x] `demo-service` appears in Catalog
- [x] TechDocs renders for `demo-service`
- [ ] Create new component via `/create`
- [ ] New component appears in Catalog
- [ ] TechDocs generates for new component

## Troubleshooting

### Component Not Appearing in Catalog

- Check backend logs for registration errors
- Verify `catalog-info.yaml` is valid YAML
- Ensure component location is in `app-config.yaml` catalog locations
- Restart Backstage

### TechDocs Not Generating

- Verify `runIn: 'local'` in `app-config.yaml`
- Check mkdocs is installed: `mkdocs --version`
- Verify `catalog-info.yaml` has TechDocs annotation:
  ```yaml
  metadata:
    annotations:
      backstage.io/techdocs-ref: dir:.
  ```
- Check `mkdocs.yml` includes techdocs-core plugin

### Template Execution Fails

- If using GitHub: Ensure `GITHUB_TOKEN` is set
- Check template YAML syntax
- Review backend logs for detailed errors

## Next Steps: Extending the Demo

### 1. Customize Templates

Edit `examples/template/template.yaml` to add:
- Custom CI/CD pipelines
- Infrastructure-as-code (Terraform)
- Security scanning setup
- Organization-specific standards

### 2. Add More Components

Create multiple services and show:
- Service relationships in the catalog
- Dependency graphs
- Cross-service documentation

### 3. Production Enhancements

- **Authentication**: Configure OAuth (GitHub, Okta, OIDC)
- **External Storage**: Use S3/GCS for TechDocs
- **Database**: Switch from SQLite to PostgreSQL
- **Deployment**: Deploy to Kubernetes
- **Plugins**: Add Kubernetes, ArgoCD, Prometheus, etc.

### 4. Custom Template Example

Would you like a template that includes:
- GitHub Actions CI/CD pipeline
- Terraform infrastructure code
- Dockerfile and docker-compose.yml
- Pre-configured linting and testing

## Template Location

The Node.js Website Template is located at:
- **Template Definition**: `examples/template/template.yaml`
- **Template Content**: `examples/template/content/`

You can customize these files to match your organization's standards.

## Resources

- [Backstage Documentation](https://backstage.io/docs)
- [Software Catalog Guide](https://backstage.io/docs/features/software-catalog/)
- [Software Templates](https://backstage.io/docs/features/software-templates/)
- [TechDocs](https://backstage.io/docs/features/techdocs/)

---

**Current Status**: ✅ Fully functional demo ready for use!

All core features (Catalog, Scaffolder, TechDocs) are working and ready to demonstrate platform engineering capabilities.


# Backstage Proficiency Demonstration Project

This project demonstrates core Backstage capabilities for building an Internal Developer Portal (IDP), showcasing golden paths for software creation, catalog management, and documentation.

## Overview

This Backstage instance includes:

- ✅ **Software Catalog** - Centralized metadata and service discovery
- ✅ **Software Templates (Scaffolder)** - Self-service project creation
- ✅ **TechDocs** - Co-located, versioned documentation
- ✅ **Sample Component** - Pre-scaffolded `demo-service` Node.js Express website

## Prerequisites

- **Node.js** 20+ (or 22/24 as specified in package.json)
- **Yarn** (installed automatically if using npm)
- **Docker** (optional, for TechDocs generation - can use local mode instead)
- **Git** (for version control)

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

This will install all required dependencies for the Backstage app, frontend, and backend.

### 2. Start Backstage

```bash
yarn start
```

This command starts both the frontend and backend:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:7007

The app will automatically open in your browser.

### 3. Explore the Catalog

Once Backstage is running:

1. Navigate to the **Software Catalog** (left sidebar)
2. Search for `demo-service` - you should see the pre-scaffolded component
3. Click on `demo-service` to view its details
4. Navigate to the **Docs** tab to see TechDocs documentation

## Project Structure

```
backstage/
├── packages/
│   ├── app/              # Frontend React application
│   └── backend/          # Backend Node.js application
├── examples/
│   ├── demo-service/     # Sample scaffolded component
│   │   ├── server.js     # Express server
│   │   ├── package.json  # Dependencies
│   │   ├── docs/         # TechDocs documentation
│   │   └── catalog-info.yaml  # Catalog metadata
│   └── template/         # Software template for scaffolding
│       ├── template.yaml # Template definition
│       └── content/      # Template files
├── app-config.yaml       # Backstage configuration
└── README.md            # This file
```

## Using Software Templates

### Scaffold a New Component

1. Navigate to **Create** in the left sidebar (or go to `/create`)
2. Select **"Node.js Website Template"**
3. Fill in the form:
   - **Component Name**: e.g., `my-new-service`
   - **Description**: Brief description of your component
   - **Owner**: e.g., `user:guest` or `team:platform`
   - **Repository Location**: (Optional) GitHub repository URL
4. Click **Create** to scaffold the component

The template will:
- Generate boilerplate Express.js code
- Create `catalog-info.yaml` for catalog registration
- Set up TechDocs documentation structure
- (Optional) Create a GitHub repository and push code

### Template Features

The Node.js Website Template includes:

- Express.js server with health check endpoint
- Standardized project structure
- TechDocs-ready documentation (`docs/index.md`)
- Catalog metadata with TechDocs annotation
- `.gitignore` and `README.md`

## TechDocs

### Viewing Documentation

1. Navigate to any component in the Catalog
2. Click on the **Docs** tab
3. Documentation is automatically generated from Markdown files in the `docs/` directory

### Adding Documentation

To add documentation to a component:

1. Create a `docs/` directory in your component
2. Add `index.md` (and other Markdown files as needed)
3. Create `mkdocs.yml` configuration file
4. Ensure `catalog-info.yaml` includes the TechDocs annotation:

```yaml
metadata:
  annotations:
    backstage.io/techdocs-ref: dir:.
```

### TechDocs Configuration

TechDocs is configured in `app-config.yaml`:

```yaml
techdocs:
  builder: 'local'
  generator:
    runIn: 'docker'  # Requires Docker, or use 'local'
  publisher:
    type: 'local'
```

For local generation without Docker, change `runIn` to `'local'` (requires Python and mkdocs).

## Sample Component: demo-service

A pre-scaffolded example component is available at `examples/demo-service/`. This demonstrates:

- Express.js server with REST endpoints
- Catalog registration
- TechDocs documentation
- Standard project structure

### Running demo-service

```bash
cd examples/demo-service
npm install
npm start
```

The service will run on `http://localhost:3000` (or the port specified by `PORT` env var).

## Configuration

### Catalog Locations

Components are registered in `app-config.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: ../../examples/demo-service/catalog-info.yaml
    - type: file
      target: ../../examples/template/template.yaml
```

### Adding Components Manually

To add a component to the catalog:

1. Create a `catalog-info.yaml` file in your component directory
2. Add the location to `app-config.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: ../../path/to/your/component/catalog-info.yaml
```

3. Restart Backstage or trigger a catalog refresh

## Development

### Building

```bash
# Build all packages
yarn build:all

# Build backend only
yarn build:backend
```

### Testing

```bash
# Run all tests
yarn test

# Run e2e tests
yarn test:e2e
```

### Linting

```bash
yarn lint
```

## Production Roadmap

To scale this demo to production:

1. **Authentication**: Configure OAuth providers (GitHub, GitLab, etc.)
2. **Custom Templates**: Create organization-specific templates with:
   - Terraform infrastructure code
   - CI/CD pipeline configurations
   - Security scanning setup
3. **Additional Plugins**: Enable plugins for:
   - Kubernetes deployment
   - PagerDuty integration
   - CircleCI/GitHub Actions
4. **Deployment**: Deploy to:
   - Kubernetes cluster
   - Docker Compose setup
   - Cloud provider (AWS, GCP, Azure)
5. **Observability**: Add plugins for:
   - Service monitoring
   - Cost tracking
   - Performance metrics

## Troubleshooting

### Port Already in Use

If port 3000 or 7007 is already in use:

1. Stop the conflicting process
2. Or modify ports in `app-config.yaml`:
   ```yaml
   app:
     baseUrl: http://localhost:3001
   backend:
     baseUrl: http://localhost:7008
     listen:
       port: 7008
   ```

### TechDocs Not Generating

- Ensure Docker is running (if using `runIn: 'docker'`)
- Or switch to local generation: `runIn: 'local'` (requires Python/mkdocs)
- Check that `catalog-info.yaml` has the TechDocs annotation

### Catalog Not Showing Components

- Verify `catalog-info.yaml` files are valid YAML
- Check that locations are correctly configured in `app-config.yaml`
- Restart Backstage to refresh the catalog

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture diagrams and component relationships.

## Resources

- [Backstage Documentation](https://backstage.io/docs)
- [Software Catalog Guide](https://backstage.io/docs/features/software-catalog/)
- [Software Templates](https://backstage.io/docs/features/software-templates/)
- [TechDocs](https://backstage.io/docs/features/techdocs/)
- [Crossplane Documentation](https://crossplane.io/docs)

## Success Metrics

This demonstration achieves:

- ✅ Local Backstage deployment with Catalog, Scaffolder, and TechDocs
- ✅ Sample scaffolded Node.js component visible in Catalog
- ✅ Functional TechDocs site generated and accessible
- ✅ Clear documentation for replication
- ✅ Demonstrates platform capabilities: scaffolder automation and catalog discoverability

## License

This is a demonstration project for showcasing Backstage capabilities.

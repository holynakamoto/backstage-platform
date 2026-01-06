# Publishing Guide

This guide covers how to publish and share your Backstage platform project.

## Publishing Options

### Option 1: GitHub Repository (Recommended)

#### Step 1: Create a New Repository

1. **On GitHub:**
   - Go to https://github.com/new
   - Repository name: `backstage-platform` (or your preferred name)
   - Description: "Backstage Internal Developer Platform with Crossplane integration"
   - Choose Public or Private
   - **Don't** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

#### Step 2: Initialize Git and Push

```bash
cd /Users/nickmoore/backstage/backstage

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Backstage platform with Crossplane integration"

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/backstage-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Update Repository Settings

1. **Add topics/tags** on GitHub:
   - `backstage`
   - `platform-engineering`
   - `crossplane`
   - `kubernetes`
   - `internal-developer-platform`
   - `devops`

2. **Enable GitHub Pages** (optional, for documentation):
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `docs`

### Option 2: GitLab Repository

```bash
# Create repository on GitLab first, then:
git remote add origin https://gitlab.com/YOUR_USERNAME/backstage-platform.git
git push -u origin main
```

### Option 3: Internal Git Server

```bash
# For internal Git servers (GitHub Enterprise, GitLab Enterprise, etc.)
git remote add origin YOUR_INTERNAL_GIT_URL
git push -u origin main
```

## What to Include/Exclude

### ✅ Include These Files

- All source code (`packages/`, `examples/`)
- Configuration files (`app-config.yaml`, `tsconfig.json`)
- Documentation (all `.md` files)
- Templates (`examples/template/`, `examples/production-microservice-crossplane/`)
- Example services (`examples/demo-service/`, `examples/payments-service/`)
- GitHub Actions workflows (`.github/workflows/`)
- Dockerfiles
- Kubernetes manifests
- Crossplane configurations

### ❌ Exclude These (Already in .gitignore)

- `node_modules/` - Dependencies (install with `yarn install`)
- `.env` files - Environment variables (use `.env.example`)
- `dist/`, `build/` - Build artifacts
- `*.log` - Log files
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

## Pre-Publishing Checklist

### 1. Review Sensitive Information

```bash
# Check for any hardcoded secrets or credentials
grep -r "password\|secret\|token\|key" --include="*.yaml" --include="*.yml" --include="*.js" --include="*.ts" . | grep -v node_modules | grep -v ".git"

# Check for personal information
grep -r "your-org\|your-username\|YOUR_" --include="*.yaml" --include="*.md" .
```

**Common places to update:**
- `app-config.yaml` - GitHub tokens, AWS credentials (use environment variables)
- `examples/payments-service/catalog-info.yaml` - Update GitHub URLs
- `examples/payments-service/k8s/deployment.yaml` - Update image registry
- All `README.md` files - Update organization names

### 2. Update Placeholder Values

Search and replace these placeholders:

```bash
# Replace these in your files:
# - your-org → your-actual-org
# - YOUR_USERNAME → your-github-username
# - your-domain.com → your-actual-domain
# - YOUR_ACCESS_KEY → (remove, use env vars)
```

### 3. Create/Update .gitignore

Ensure `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# Build artifacts
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Secrets
*.pem
*.key
kubeconfig.yaml
```

### 4. Add License File (Optional)

```bash
# Create LICENSE file
cat > LICENSE <<EOF
MIT License

Copyright (c) $(date +%Y) Your Organization

Permission is hereby granted...
EOF
```

## Documentation for Sharing

### Update README.md

Ensure your `README.md` includes:
- Clear description
- Prerequisites
- Installation instructions
- Quick start guide
- Links to detailed documentation

### Create CONTRIBUTING.md (Optional)

```markdown
# Contributing

## Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `yarn install`
4. Make changes
5. Submit a pull request

## Code Style
- Follow existing code patterns
- Run `yarn lint` before committing
- Add tests for new features
```

## Deployment Options

### Option 1: Deploy to Production Kubernetes

See deployment guides:
- [CROSSPLANE_SETUP.md](CROSSPLANE_SETUP.md)
- [examples/payments-service/DEPLOYMENT.md](examples/payments-service/DEPLOYMENT.md)

### Option 2: Docker Compose (Local/Staging)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backstage:
    build: .
    ports:
      - "3000:3000"
      - "7007:7007"
    environment:
      - NODE_ENV=production
```

### Option 3: Cloud Platforms

- **AWS**: ECS, EKS, App Runner
- **GCP**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **Heroku**: Container registry deployment

## Sharing with Your Team

### Internal Sharing

1. **Create Internal Repository**
   ```bash
   # Push to internal Git server
   git remote add internal YOUR_INTERNAL_GIT_URL
   git push internal main
   ```

2. **Share Documentation**
   - Send link to repository
   - Point to `README.md` for getting started
   - Share `QUICK_START_GUIDE.md` for quick setup

3. **Demo the Platform**
   - Start Backstage locally
   - Show service creation workflow
   - Demonstrate payments-service example

### External Sharing (Open Source)

If making this open source:

1. **Choose License**
   - MIT (permissive)
   - Apache 2.0 (permissive, patent protection)
   - GPL (copyleft)

2. **Add License File**
   ```bash
   # Add LICENSE file to repository
   ```

3. **Update Documentation**
   - Remove internal references
   - Add contribution guidelines
   - Add code of conduct (optional)

4. **Create Release**
   ```bash
   # Tag a version
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   
   # Create release on GitHub with release notes
   ```

## Quick Publish Script

Create a script to automate publishing:

```bash
#!/bin/bash
# publish.sh

set -e

echo "🔍 Checking for sensitive information..."
if grep -r "YOUR_SECRET\|YOUR_TOKEN" --include="*.yaml" --include="*.md" . | grep -v node_modules; then
    echo "❌ Found placeholder values. Please update them before publishing."
    exit 1
fi

echo "📦 Building..."
yarn build:all

echo "🧪 Running tests..."
yarn test

echo "✅ Ready to publish!"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Commit: git add . && git commit -m 'Your message'"
echo "3. Push: git push origin main"
```

## Post-Publishing

### 1. Update Documentation Links

After publishing, update any local file paths to GitHub URLs:
- Update links in README.md
- Update image paths if using relative URLs
- Update example repository URLs

### 2. Set Up CI/CD

GitHub Actions workflows are already included:
- `.github/workflows/ci.yml` - Will run on push
- `.github/workflows/deploy.yml` - Configure secrets for deployment

### 3. Configure Secrets

For CI/CD to work, add secrets in GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EKS_CLUSTER_NAME`
- `GITHUB_TOKEN` (automatically provided)

### 4. Enable Features

- **GitHub Pages**: For documentation hosting
- **Dependabot**: For dependency updates
- **Code Scanning**: For security analysis
- **Discussions**: For community Q&A

## Example: Publishing to GitHub

```bash
# 1. Create repository on GitHub (via web UI)

# 2. Initialize and push
cd /Users/nickmoore/backstage/backstage
git init
git add .
git commit -m "Initial commit: Backstage platform with Crossplane"

# 3. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/backstage-platform.git

# 4. Push
git branch -M main
git push -u origin main

# 5. Verify
git remote -v
```

## Security Considerations

### Before Publishing

1. **Remove Secrets**
   - Check for hardcoded API keys
   - Remove AWS credentials
   - Remove database passwords
   - Use environment variables instead

2. **Review Files**
   ```bash
   # Check what will be committed
   git status
   git diff --cached
   ```

3. **Use .gitignore**
   - Ensure sensitive files are ignored
   - Double-check `.env` files aren't committed

### After Publishing

1. **Rotate Credentials**
   - If any secrets were accidentally committed, rotate them immediately
   - Use GitHub's secret scanning alerts

2. **Set Repository Visibility**
   - Private: Only you/your organization
   - Public: Anyone can see (for open source)

3. **Enable Security Features**
   - Dependabot alerts
   - Secret scanning
   - Code scanning (CodeQL)

## Next Steps After Publishing

1. **Share with Team**
   - Send repository link
   - Schedule demo session
   - Create onboarding documentation

2. **Gather Feedback**
   - Create issues for improvements
   - Collect usage metrics
   - Iterate based on feedback

3. **Maintain**
   - Regular dependency updates
   - Security patches
   - Feature additions
   - Documentation updates

## Resources

- [GitHub Documentation](https://docs.github.com)
- [GitLab Documentation](https://docs.gitlab.com)
- [Backstage Deployment Guide](https://backstage.io/docs/deployment)


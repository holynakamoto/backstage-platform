# Quick Publish Guide

## 🚀 Fast Track: Publish to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `backstage-platform` (or your choice)
3. Description: "Backstage Internal Developer Platform with Crossplane"
4. Choose Public or Private
5. **Don't** initialize with README/gitignore
6. Click "Create repository"

### Step 2: Push to GitHub

```bash
cd /Users/nickmoore/backstage/backstage

# Check current status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Backstage platform with Crossplane integration"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/backstage-platform.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Verify

Visit: `https://github.com/YOUR_USERNAME/backstage-platform`

## ⚠️ Before Publishing Checklist

### 1. Remove Sensitive Information

```bash
# Check for placeholder values that need updating
grep -r "YOUR_USERNAME\|your-org\|your-domain\|YOUR_TOKEN" \
  --include="*.yaml" --include="*.md" --include="*.js" \
  examples/ | grep -v node_modules
```

**Files to review:**
- `examples/payments-service/catalog-info.yaml` - Update GitHub URLs
- `examples/payments-service/k8s/deployment.yaml` - Update image registry
- `app-config.yaml` - Ensure no hardcoded tokens

### 2. Update Placeholders

Search and replace:
- `your-org` → Your actual organization
- `YOUR_USERNAME` → Your GitHub username  
- `your-domain.com` → Your actual domain
- `ghcr.io/your-org` → Your container registry

### 3. Verify .gitignore

Your `.gitignore` already excludes:
- ✅ `node_modules/`
- ✅ `.env` files
- ✅ Build artifacts
- ✅ Logs

## 📋 What Gets Published

### ✅ Included
- All source code
- Templates and examples
- Documentation (15+ files)
- Configuration files
- CI/CD workflows
- Crossplane definitions
- Kubernetes manifests

### ❌ Excluded (via .gitignore)
- Dependencies (`node_modules/`)
- Environment variables (`.env`)
- Build artifacts
- Logs
- IDE files

## 🔐 Security Notes

1. **No Secrets**: The `.gitignore` already excludes `.env` files
2. **Use Environment Variables**: All sensitive values use env vars
3. **Review Before Push**: Check `git status` before committing

## 📝 After Publishing

1. **Update Repository Settings**
   - Add topics: `backstage`, `platform-engineering`, `crossplane`
   - Enable GitHub Pages (optional)
   - Configure branch protection (optional)

2. **Configure Secrets** (for CI/CD)
   - Go to Settings → Secrets and variables → Actions
   - Add: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `EKS_CLUSTER_NAME`

3. **Share with Team**
   - Send repository link
   - Point to `README.md` for setup
   - Share `QUICK_START_GUIDE.md`

## 🎯 Quick Commands

```bash
# Check what will be committed
git status

# See changes
git diff

# Add all files
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Create a tag for release
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

## 📚 Full Guide

See [PUBLISHING.md](PUBLISHING.md) for comprehensive publishing options and detailed instructions.


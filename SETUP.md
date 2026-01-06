# Setup Verification Guide

This guide helps you verify that your Backstage instance is properly configured and working.

## Pre-Start Checklist

- [x] Node.js 20+ installed
- [x] Yarn installed (or npm with yarn auto-install)
- [x] Dependencies installed (`yarn install` completed successfully)
- [x] Docker installed (optional, for TechDocs generation)

## Starting Backstage

1. **Start the application:**
   ```bash
   yarn start
   ```

2. **Verify services are running:**
   - Frontend should be accessible at: http://localhost:3000
   - Backend API should be accessible at: http://localhost:7007

3. **Check console output:**
   - Look for "Listening on :3000" (frontend)
   - Look for "Listening on :7007" (backend)
   - No critical errors should appear

## Verification Steps

### 1. Software Catalog

1. Navigate to **Software Catalog** (left sidebar or http://localhost:3000/catalog)
2. You should see:
   - `demo-service` component
   - Example entities (if configured)
   - Template: `nodejs-website-template`

**Expected Result:** Components are visible and searchable

### 2. Component Details

1. Click on `demo-service` in the catalog
2. Verify the following tabs are available:
   - **Overview** - Component metadata
   - **Docs** - TechDocs documentation
   - **Relations** - Component relationships

**Expected Result:** Component page loads with all tabs visible

### 3. TechDocs

1. Navigate to `demo-service` component
2. Click on the **Docs** tab
3. Documentation should load (may take a moment on first load)

**Expected Result:** TechDocs documentation renders correctly

**Note:** If TechDocs doesn't generate:
- **Docker mode**: Ensure Docker is running (if using `runIn: 'docker'`)
- **Local mode** (current): Requires Python 3 and mkdocs installed
  - Install with: `pip3 install --break-system-packages mkdocs mkdocs-techdocs-core`
  - Verify with: `mkdocs --version`
  - Configuration in `app-config.yaml`:
    ```yaml
    techdocs:
      generator:
        runIn: 'local'  # Requires Python and mkdocs
    ```

### 4. Software Templates (Scaffolder)

1. Navigate to **Create** (left sidebar or http://localhost:3000/create)
2. You should see: **"Node.js Website Template"**
3. Click on the template to view its details

**Expected Result:** Template is visible and can be selected

**Note:** To use the template:
- GitHub integration requires `GITHUB_TOKEN` environment variable
- Set it in your shell: `export GITHUB_TOKEN=your_token_here`
- Or add to `.env` file (not committed to git)

### 5. Search

1. Navigate to **Search** (left sidebar or http://localhost:3000/search)
2. Search for "demo-service"
3. Results should include the component

**Expected Result:** Search returns relevant results

## Troubleshooting

### Port Conflicts

**Problem:** Port 3000 or 7007 already in use

**Solution:**
1. Find the process: `lsof -i :3000` or `lsof -i :7007`
2. Kill the process or change ports in `app-config.yaml`

### Catalog Not Loading

**Problem:** Components don't appear in catalog

**Solution:**
1. Check `app-config.yaml` catalog locations
2. Verify `catalog-info.yaml` files are valid YAML
3. Check backend logs for errors
4. Restart Backstage

### TechDocs Not Generating

**Problem:** Docs tab shows error or doesn't load

**Solution:**
1. **If using Docker mode**: Check Docker is running
2. **If using local mode** (current): 
   - Verify Python 3 is installed: `python3 --version`
   - Verify mkdocs is installed: `mkdocs --version`
   - If not installed: `pip3 install --break-system-packages mkdocs mkdocs-techdocs-core`
3. Verify `catalog-info.yaml` has TechDocs annotation:
   ```yaml
   metadata:
     annotations:
       backstage.io/techdocs-ref: dir:.
   ```
4. Check that `mkdocs.yml` includes the techdocs-core plugin:
   ```yaml
   plugins:
     - techdocs-core
   ```
5. Check backend logs for TechDocs errors
6. Restart Backstage after changing TechDocs configuration

### Template Execution Fails

**Problem:** Scaffolder template fails to execute

**Solution:**
1. Ensure `GITHUB_TOKEN` is set (if using GitHub integration)
2. Check template YAML syntax is valid
3. Verify template content files exist
4. Check backend logs for detailed error messages

## Quick Test Commands

```bash
# Check if ports are available
lsof -i :3000
lsof -i :7007

# Check Node.js version
node --version  # Should be 20+

# Check Yarn version
yarn --version

# Verify Docker (for TechDocs)
docker --version

# Check environment variables
echo $GITHUB_TOKEN  # Should be set if using GitHub integration
```

## Success Criteria

Your setup is successful if:

- ✅ Backstage starts without errors
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend accessible at http://localhost:7007
- ✅ `demo-service` appears in Software Catalog
- ✅ TechDocs documentation renders for `demo-service`
- ✅ Software Templates page shows `nodejs-website-template`
- ✅ Search functionality works

## Next Steps

Once verified:

1. **Explore the demo-service:**
   - View its documentation
   - Check its catalog metadata
   - Review the code structure

2. **Try scaffolding a new component:**
   - Use the Node.js Website Template
   - (Requires GitHub token for full functionality)

3. **Customize for your organization:**
   - Add custom templates
   - Configure authentication
   - Add integrations

## Getting Help

- Check Backstage logs in the terminal
- Review [Backstage Documentation](https://backstage.io/docs)
- Check component `catalog-info.yaml` files for errors
- Verify `app-config.yaml` configuration


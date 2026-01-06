# Restart Instructions for TechDocs Local Mode

If you're seeing "failed to fetch started docker" errors, follow these steps:

## Step 1: Stop Backstage Completely

1. Find the terminal where Backstage is running
2. Press `Ctrl+C` to stop it
3. Wait for all processes to terminate

## Step 2: Verify Configuration

The configuration should be set to local mode in `app-config.yaml`:

```yaml
techdocs:
  builder: 'local'
  generator:
    runIn: 'local'  # NOT 'docker'
  publisher:
    type: 'local'
```

## Step 3: Verify mkdocs Installation

```bash
mkdocs --version
```

Should output: `mkdocs, version 1.6.1` (or similar)

If not installed:
```bash
pip3 install --break-system-packages mkdocs mkdocs-techdocs-core
```

## Step 4: Rebuild Backend (if needed)

```bash
cd /Users/nickmoore/backstage/backstage
yarn build:backend
```

## Step 5: Start Backstage Fresh

```bash
yarn start
```

## Step 6: Test TechDocs

1. Navigate to http://localhost:3000
2. Go to Software Catalog
3. Click on `demo-service`
4. Click the **Docs** tab
5. Documentation should generate using local mkdocs (no Docker needed)

## If Still Having Issues

Check backend logs for specific errors. The backend terminal will show detailed TechDocs generation logs.

If you see Docker-related errors, ensure:
- Backstage was fully stopped before restarting
- No cached processes are running
- Configuration file changes were saved


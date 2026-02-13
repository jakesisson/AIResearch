# Docker Installation for macOS

## Install Docker Desktop

### Option 1: Homebrew (Recommended)
```bash
brew install --cask docker
```

Then open Docker Desktop from Applications.

### Option 2: Direct Download
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac (Apple Silicon or Intel)
3. Open the `.dmg` file and drag Docker to Applications
4. Open Docker Desktop from Applications
5. Wait for Docker to start (whale icon in menu bar)

## Verify Installation

After Docker Desktop is running:

```bash
docker --version
docker compose version
```

You should see version numbers.

## Start Langfuse

Once Docker is installed and running:

```bash
cd /Users/jsisson/Research
docker compose -f docker-compose.langfuse.yml up -d
```

**Note**: Modern Docker uses `docker compose` (space), not `docker-compose` (hyphen).

## Check Status

```bash
# Check if containers are running
docker ps

# Check Langfuse logs
docker logs langfuse_server

# Stop Langfuse
docker compose -f docker-compose.langfuse.yml down
```

## Troubleshooting

**Docker not starting?**
- Make sure Docker Desktop is running (check menu bar for whale icon)
- Restart Docker Desktop
- Check System Settings → Privacy & Security for Docker permissions

**Port 3000 already in use?**
- Change port in `docker-compose.langfuse.yml` (line with `"3000:3000"`)
- Update `LANGFUSE_HOST` in `master.env`

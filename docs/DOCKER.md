# Docker Setup Guide - SportsCoach V3

Complete guide for running SportsCoach V3 with Docker for local development and production testing.

## 📋 Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **.env.local** file with Firebase credentials

## 🚀 Quick Start

### Option 1: Using the Helper Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x docker.sh

# Start development environment
./docker.sh dev

# Or build and start (first time or after changes)
./docker.sh dev-build
```

### Option 2: Using Docker Compose Directly

```bash
# Development mode
docker-compose up

# Development mode with rebuild
docker-compose up --build

# Production mode
docker-compose -f docker-compose.prod.yml up --build
```

## 📂 Docker Files Overview

### Files Created

1. **Dockerfile** - Production-optimized multi-stage build
2. **Dockerfile.dev** - Development with hot reload
3. **docker-compose.yml** - Development orchestration
4. **docker-compose.prod.yml** - Production orchestration
5. **.dockerignore** - Files to exclude from Docker build
6. **docker.sh** - Helper script for common commands

## 🛠️ Available Commands

### Development

```bash
# Start development server
./docker.sh dev

# Build and start (use after dependency changes)
./docker.sh dev-build

# View logs
./docker.sh logs

# Open shell in container
./docker.sh shell
```

### Production Testing

```bash
# Start production build locally
./docker.sh prod

# Build and start production
./docker.sh prod-build
```

### Firebase Emulators (Optional)

```bash
# Start with Firebase emulators
./docker.sh emulators
```

This starts:
- Emulator UI: http://localhost:4000
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Storage Emulator: http://localhost:9199

### Maintenance

```bash
# Stop all containers
./docker.sh stop

# Clean containers and volumes
./docker.sh clean

# Complete rebuild
./docker.sh rebuild
```

## 🌐 Accessing the Application

Once running, access the application at:

- **Development**: http://localhost:3000
- **Production**: http://localhost:3000

## 📝 Environment Variables

Ensure `.env.local` exists with your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 🔧 Development Features

### Hot Reload

The development container is configured with:
- Volume mounting for live code changes
- Webpack watch mode with polling (works in Docker)
- Automatic restart on file changes

### Debugging

To debug the application:

```bash
# Open shell in container
./docker.sh shell

# View logs
./docker.sh logs

# Inspect specific service
docker-compose logs app
```

## 🏗️ Architecture

### Development Mode (Dockerfile.dev)

- Based on `node:20-alpine`
- Installs all dependencies (including dev)
- Mounts source code for hot reload
- Runs `npm run dev`

### Production Mode (Dockerfile)

Multi-stage build:

1. **deps** - Install dependencies only
2. **builder** - Build the Next.js app
3. **runner** - Minimal runtime with built files

Benefits:
- Smaller image size (~200MB vs ~800MB)
- Faster deployments
- Security (non-root user)
- Optimized for production

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Or stop all Docker containers
./docker.sh stop
```

### Cannot Connect to Docker Daemon

```bash
# Start Docker Desktop
# On Linux: sudo systemctl start docker
```

### Hot Reload Not Working

The configuration uses polling to detect file changes in Docker:

```typescript
// next.config.ts
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
  }
  return config;
}
```

### Permission Errors

```bash
# Fix file ownership
sudo chown -R $USER:$USER .

# Or rebuild with clean
./docker.sh rebuild
```

### Out of Memory

Increase Docker memory in Docker Desktop settings:
- Minimum: 4GB
- Recommended: 8GB

## 📊 Container Management

### View Running Containers

```bash
docker ps
```

### View Container Resources

```bash
docker stats
```

### Remove Unused Images

```bash
docker image prune -a
```

### Complete Docker Cleanup

```bash
# Remove all stopped containers, networks, images, and cache
docker system prune -a --volumes
```

## 🚀 Deployment

The production Dockerfile is optimized for:

- **Vercel** (already configured)
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **Self-hosted servers**

### Building for Production

```bash
# Build production image
docker build -t sportscoach:latest .

# Tag for registry
docker tag sportscoach:latest your-registry/sportscoach:latest

# Push to registry
docker push your-registry/sportscoach:latest
```

## 🔒 Security Notes

1. **Never commit** `.env.local` or any environment files
2. Production container runs as **non-root user** (nextjs:1001)
3. Only necessary files are copied (via `.dockerignore`)
4. Multi-stage build minimizes attack surface

## 📈 Performance

### Development Container

- Startup time: ~20-30 seconds
- Hot reload: 1-3 seconds
- Memory usage: ~500MB

### Production Container

- Image size: ~200MB (vs 800MB without multi-stage)
- Startup time: ~5-10 seconds
- Memory usage: ~300MB

## 🎯 Best Practices

1. **Use dev mode for development**
   ```bash
   ./docker.sh dev
   ```

2. **Test production builds locally before deploying**
   ```bash
   ./docker.sh prod-build
   ```

3. **Clean up regularly**
   ```bash
   ./docker.sh clean
   docker system prune
   ```

4. **Update dependencies in container**
   ```bash
   # After updating package.json
   ./docker.sh dev-build
   ```

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `./docker.sh logs`
2. Try rebuild: `./docker.sh rebuild`
3. Check Docker Desktop is running
4. Verify `.env.local` exists and is valid
5. Check port 3000 is not in use

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

**Happy Coding! 🚀**

# 🚀 Scaffold Your Shape - Docker Deployment Summary

## Overview
Complete Docker Compose setup for the Scaffold Your Shape application with integrated Pili AI chatbot, using Nginx as a reverse proxy.

## 🏗️ Architecture

```
Internet → Nginx (Port 80) → {
    /api/chat/* → Pili Chatbot (Port 8991)
    /*          → Next.js App (Port 3006)
}
```

## 📦 Services

### 1. **Nginx** (Reverse Proxy)
- **Image**: `nginx:alpine`
- **Ports**: 80, 443
- **Purpose**: Routes requests and provides load balancing
- **Features**:
  - Rate limiting (10 req/min for chat, 100 req/min general)
  - Security headers
  - CORS handling for chat API
  - Static file optimization
  - Health check endpoint at `/nginx-health`

### 2. **Web Application** (Next.js)
- **Build**: From current directory
- **Port**: 3006 (internal)
- **Purpose**: Main Scaffold Your Shape application
- **Features**:
  - Health monitoring
  - Environment-based configuration
  - Hot reload in development

### 3. **Pili API** (AI Chatbot)
- **Build**: From Dockerfile
- **Port**: 8991 (internal)
- **Purpose**: AI-powered exercise chatbot
- **Features**:
  - LangChain integration
  - Multiple LLM provider support (OpenAI, Ollama, vLLM)
  - Health monitoring
  - Persistent data storage

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy and configure environment files
cp .env.example .env.prod
# Edit .env.prod with your production values
```

### 2. Start Services
```bash
# Start all services in detached mode
docker compose up -d

# Check service status
docker compose ps
```

### 3. Verify Deployment
```bash
# Test endpoints
curl http://localhost/nginx-health
curl http://localhost/
curl -X POST http://localhost/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello"}'
```

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Main App | `http://localhost/` | Scaffold Your Shape web interface |
| Chat API | `http://localhost/api/chat` | Pili chatbot endpoint |
| Nginx Health | `http://localhost/nginx-health` | Load balancer status |

## 📊 Monitoring & Logs

### Service Status
```bash
# Check all services
docker compose ps

# View resource usage
docker stats
```

### Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f web
docker compose logs -f pili-api
```

## 🔒 Security Features

### Nginx Security
- Rate limiting per IP address
- Security headers (XSS, CSRF, Content-Type)
- CORS configuration for chat API
- Request size limits (50MB max)

### Network Security
- Internal Docker network (`pili-network`)
- Services communicate via internal hostnames
- Only Nginx exposed to external traffic

## 🛠️ Development vs Production

### Development Mode
```bash
# Start with development configuration
docker compose up -d
```

### Production Mode
```bash
# Use production environment
docker compose --env-file .env.prod up -d
```

## 🔧 Maintenance

### Updates
```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build

# Clean unused resources
docker system prune -f
```

### Backup
```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Backup environment files
cp .env .env.backup
cp .env.prod .env.prod.backup
```

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker compose logs [service_name]
   docker compose ps
   ```

2. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :80
   ```

3. **Nginx configuration errors**
   ```bash
   docker compose exec nginx nginx -t
   ```

### Debug Commands
```bash
# Enter service container
docker compose exec nginx sh
docker compose exec web bash
docker compose exec pili-api bash
```

## 📈 Performance Optimization

### Nginx Tuning
- Worker processes: Auto-detected
- Worker connections: 1024
- Keepalive connections: Enabled
- Gzip compression: Enabled

### Application Tuning
- Health check intervals: 30s
- Connection timeouts: 75s
- Read timeouts: 300s

## 🎯 Next Steps

1. **SSL/TLS Setup**: Configure HTTPS certificates
2. **Monitoring**: Add Prometheus/Grafana for metrics
3. **CI/CD**: Integrate with deployment pipeline
4. **Backup Strategy**: Automated backup scheduling
5. **Load Testing**: Validate performance under load

---

**Status**: ✅ Ready for deployment 
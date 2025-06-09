# Docker Setup for Scaffold Your Shape

This document explains how to run the Scaffold Your Shape application with nginx reverse proxy and Pili AI chatbot using Docker Compose.

## Architecture

```
Internet → nginx (Port 80) → {
  /api/chat/* → Pili Chatbot (Port 8991)
  /*          → Next.js App (Port 3006)
}
```

## Services

### 1. **nginx** (Reverse Proxy)
- **Container**: `nginx-proxy`
- **Ports**: 80:80, 443:443
- **Purpose**: Routes requests and provides load balancing
- **Routes**:
  - `/api/chat/*` → Pili Chatbot service
  - `/*` → Main web application

### 2. **web** (Next.js Application)
- **Container**: `scaffold-web`
- **Internal Port**: 3006
- **Purpose**: Main Scaffold Your Shape application
- **Environment**: Production mode

### 3. **pili-api** (AI Chatbot)
- **Container**: `pili-chatbot`
- **Internal Port**: 8991
- **Purpose**: AI fitness assistant powered by Pili
- **LLM Provider**: vLLM with Qwen/Qwen3-32B-AWQ model

## Quick Start

### 1. Environment Setup

Copy the environment files and configure them:

```bash
# Copy main application environment
cp .env.example .env.prod

# Copy Pili chatbot environment
cp .env.pili.example .env

# Edit the environment files with your actual values
nano .env.prod
nano .env
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nginx
docker-compose logs -f web
docker-compose logs -f pili-api
```

### 3. Health Checks

Check if all services are running:

```bash
# Check service status
docker-compose ps

# Test nginx health
curl http://localhost/nginx-health

# Test main app (through nginx)
curl http://localhost/

# Test chat API (through nginx)
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Pili!"}'
```

## Configuration

### Nginx Configuration

The nginx configuration (`nginx.conf`) includes:

- **Rate Limiting**: 
  - Chat endpoints: 10 requests/minute
  - General endpoints: 100 requests/minute
- **Security Headers**: XSS protection, content type sniffing prevention
- **CORS Support**: For chat API endpoints
- **Streaming Support**: Server-Sent Events for real-time chat
- **Static File Caching**: Optimized for performance

### Pili Chatbot Configuration

Key environment variables for the chatbot:

```bash
# LLM Provider (vllm, openai, ollama, local)
LLM_PROVIDER=vllm

# vLLM Configuration
LOCAL_LLM_BASE_URL=http://192.168.1.10:8888/v1
LOCAL_LLM_MODEL=Qwen/Qwen3-32B-AWQ

# LangChain Integration
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_PROJECT=pili-exercise-chatbot

# External Services
EXERCISE_SERVICE_URL=http://192.168.1.10:8888/v1
```

## Development vs Production

### Development Mode
```bash
# Run in development with hot reload
npm run dev -- --port 3006
```

### Production Mode
```bash
# Build and run with Docker
docker-compose up -d
```

## Monitoring and Logs

### Log Locations
- **Nginx logs**: `./logs/nginx/`
- **Application logs**: `./logs/`
- **Pili chatbot logs**: `./logs/`

### Health Monitoring
All services include health checks:
- **nginx**: `/nginx-health`
- **web**: `/api/health`
- **pili-api**: `/api/health`

### Monitoring Commands
```bash
# Watch all logs
docker-compose logs -f

# Monitor resource usage
docker stats

# Check health status
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 80
   sudo lsof -i :80
   
   # Stop conflicting services
   sudo systemctl stop apache2  # or nginx
   ```

2. **Permission Issues**
   ```bash
   # Fix log directory permissions
   sudo chown -R $USER:$USER logs/
   chmod -R 755 logs/
   ```

3. **Service Not Starting**
   ```bash
   # Check service logs
   docker-compose logs pili-api
   
   # Restart specific service
   docker-compose restart pili-api
   ```

4. **Chat API Not Working**
   ```bash
   # Test direct connection to chatbot
   curl http://localhost:8991/api/health
   
   # Check nginx routing
   docker-compose exec nginx nginx -t
   ```

### Debugging

```bash
# Enter container shell
docker-compose exec web sh
docker-compose exec pili-api sh
docker-compose exec nginx sh

# View nginx configuration
docker-compose exec nginx cat /etc/nginx/nginx.conf

# Reload nginx configuration
docker-compose exec nginx nginx -s reload
```

## Scaling

To scale services:

```bash
# Scale web application
docker-compose up -d --scale web=3

# Scale chatbot service
docker-compose up -d --scale pili-api=2
```

Note: Update nginx upstream configuration for load balancing when scaling.

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Network Isolation**: Services communicate through internal Docker network
3. **Rate Limiting**: Configured in nginx to prevent abuse
4. **Security Headers**: Added to all responses
5. **Health Checks**: Monitor service availability

## Backup and Maintenance

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Update services
docker-compose pull
docker-compose up -d

# Clean up old images
docker system prune -a
``` 
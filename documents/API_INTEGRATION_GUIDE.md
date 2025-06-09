# Scaffold Your Shape - API Integration Guide

## Overview

The Scaffold Your Shape API provides a comprehensive set of endpoints for managing fitness activities, clubs, challenges, and user interactions. This guide will help you integrate with our API effectively.

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

### Content Type
All API requests should use `Content-Type: application/json`

## Authentication

### Session-Based Authentication
Our API uses NextAuth.js for session management. Users must be authenticated to access most endpoints.

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current Session
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "profile": {
      "id": "profile_id",
      "name": "User Name",
      "bio": "User bio",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

## API Endpoints

### Activities

#### Get All Activities
```http
GET /api/activities
Authorization: Session required
```

**Response:**
```json
{
  "data": [
    {
      "id": "activity_id",
      "user_id": "user_id",
      "type": "running",
      "distance": 5.2,
      "duration": 1800,
      "date": "2024-01-15T10:00:00.000Z",
      "location": "Central Park",
      "notes": "Great morning run",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Activities with Details
```http
GET /api/activities/with-details
Authorization: Session required
```

**Response:**
```json
{
  "data": [
    {
      "id": "activity_id",
      "user_id": "user_id",
      "type": "running",
      "distance": 5.2,
      "duration": 1800,
      "date": "2024-01-15T10:00:00.000Z",
      "maps": [
        {
          "id": "map_id",
          "image_url": "https://example.com/map.jpg",
          "polyline": "encoded_polyline_data"
        }
      ],
      "segmentations": [
        {
          "id": "segment_id",
          "start_time": 0,
          "end_time": 600,
          "distance": 1.5,
          "pace": "6:00"
        }
      ]
    }
  ]
}
```

#### Create Activity
```http
POST /api/activities
Authorization: Session required
Content-Type: application/json

{
  "type": "running",
  "distance": 5.2,
  "duration": 1800,
  "date": "2024-01-15T10:00:00.000Z",
  "location": "Central Park",
  "notes": "Great morning run"
}
```

**Response:**
```json
{
  "data": {
    "id": "new_activity_id",
    "user_id": "user_id",
    "type": "running",
    "distance": 5.2,
    "duration": 1800,
    "date": "2024-01-15T10:00:00.000Z",
    "location": "Central Park",
    "notes": "Great morning run",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Clubs

#### Get All Clubs
```http
GET /api/clubs
Authorization: Session required
```

**Response:**
```json
{
  "data": [
    {
      "id": "club_id",
      "name": "Morning Runners",
      "description": "A club for early morning running enthusiasts",
      "is_private": false,
      "background_image_url": "https://example.com/club-bg.jpg",
      "creator_id": "user_id",
      "created_at": "2024-01-01T00:00:00.000Z",
      "member_count": 25
    }
  ]
}
```

#### Create Club
```http
POST /api/clubs
Authorization: Session required
Content-Type: application/json

{
  "name": "Evening Cyclists",
  "description": "Join us for evening cycling sessions",
  "is_private": false,
  "background_image_url": "https://example.com/cycling-bg.jpg"
}
```

#### Get Club by ID
```http
GET /api/clubs/{club_id}
Authorization: Session required
```

#### Update Club
```http
PUT /api/clubs/{club_id}
Authorization: Session required
Content-Type: application/json

{
  "name": "Updated Club Name",
  "description": "Updated description",
  "is_private": true
}
```

#### Delete Club
```http
DELETE /api/clubs/{club_id}
Authorization: Session required
```

### Challenges

#### Get All Challenges
```http
GET /api/challenges
Authorization: Session required
```

**Response:**
```json
{
  "data": [
    {
      "id": "challenge_id",
      "title": "30-Day Running Challenge",
      "description": "Run 5km every day for 30 days",
      "creator_id": "user_id",
      "target_value": 150,
      "unit": "km",
      "start_date": "2024-02-01T00:00:00.000Z",
      "end_date": "2024-03-01T23:59:59.000Z",
      "is_public": true,
      "participant_count": 50,
      "created_at": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

#### Create Challenge
```http
POST /api/challenges
Authorization: Session required
Content-Type: application/json

{
  "title": "Weekly Cycling Challenge",
  "description": "Cycle 100km in one week",
  "target_value": 100,
  "unit": "km",
  "start_date": "2024-02-01T00:00:00.000Z",
  "end_date": "2024-02-08T23:59:59.000Z",
  "is_public": true
}
```

### Chat (AI Assistant - Pili)

#### Send Message to Pili AI Assistant
```http
POST /api/assistant/pili
Authorization: Session recommended (but not required)
Content-Type: application/json

{
  "message": "Hi there, help me create a workout schedule for the next 3 days"
}
```

**Response (JSON - Fallback):**
```json
{
  "reply": "I'd be happy to help you create a 3-day workout schedule! To design the best plan for you, I'd like to know a few things: What's your current fitness level? Do you have any specific goals (strength, cardio, weight loss)? What equipment do you have access to? And how much time can you dedicate per workout?",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "success"
}
```

**Response (Streaming - Default):**
```
Content-Type: text/event-stream

data: {"type":"chunk","content":"I'd be happy to","timestamp":"2024-01-15T10:30:00.000Z"}

data: {"type":"chunk","content":" help you create","timestamp":"2024-01-15T10:30:01.000Z"}

data: {"type":"chunk","content":" a 3-day workout schedule!","timestamp":"2024-01-15T10:30:02.000Z"}

data: {"type":"done","timestamp":"2024-01-15T10:30:05.000Z"}
```

**Streaming Response Format:**
- **Content-Type**: `text/event-stream` (Server-Sent Events)
- **Chunk Data**: Each chunk contains `type: "chunk"`, `content: "partial text"`, and `timestamp`
- **End Signal**: Final message has `type: "done"` to indicate streaming completion
- **Real-time Updates**: Text accumulates as chunks arrive for live typing effect

**JavaScript Example (Streaming):**
```javascript
const response = await fetch('/api/chat/pili', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Create a workout plan' }),
  credentials: 'include'
});

if (response.headers.get('content-type')?.includes('text/event-stream')) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        
        if (data.type === 'chunk' && data.content) {
          accumulatedText += data.content;
          updateMessage(accumulatedText); // Update UI in real-time
        } else if (data.type === 'done') {
          console.log('Streaming completed');
          break;
        }
      }
    }
  }
}
```

**Note:** This endpoint proxies requests to the Pili AI chatbot running at `0.0.0.0:8991`. The user session is automatically passed to provide personalized responses. If no session is available, requests are made as 'anonymous' user. Streaming is enabled by default for real-time response generation.

**Content Filtering:** The API automatically filters streaming responses to remove common artifacts, formatting tokens, and metadata, ensuring only clean, readable message content is displayed to users. This includes removing:
- Data prefixes (`data:`, `event:`)
- Instruction tokens (`[INST]`, `[/INST]`, `<|...|>`)
- System prefixes (`Assistant:`, `AI:`, `Response:`)
- JSON artifacts and control characters
- Empty or whitespace-only chunks

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "User not authenticated",
  "code": "UNAUTHORIZED"
}
```

#### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "name",
    "message": "Name is required"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

- **General endpoints**: 100 requests per minute per user
- **Chat endpoint**: 20 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user

## Data Types and Validation

### Activity Types
- `running`
- `cycling`
- `swimming`
- `walking`
- `yoga`
- `strength_training`
- `other`

### Required Fields by Endpoint

#### Create Activity
- `type` (string, required)
- `date` (ISO 8601 string, required)
- `duration` (number in seconds, optional)
- `distance` (number in km, optional)
- `location` (string, optional)
- `notes` (string, optional, max 500 chars)

#### Create Club
- `name` (string, required, max 100 chars)
- `description` (string, required, max 500 chars)
- `is_private` (boolean, optional, default: false)
- `background_image_url` (string, optional)

#### Create Challenge
- `title` (string, required, max 100 chars)
- `description` (string, required, max 500 chars)
- `target_value` (number, required)
- `unit` (string, required)
- `start_date` (ISO 8601 string, required)
- `end_date` (ISO 8601 string, required)
- `is_public` (boolean, optional, default: true)

## Integration Examples

### JavaScript/TypeScript Example
```typescript
// API Client Setup
class ScaffoldYourShapeAPI {
  private baseURL = 'http://localhost:3001/api';
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Session cookies are automatically included
      },
      credentials: 'include', // Important for session auth
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage Examples
const api = new ScaffoldYourShapeAPI();

// Create an activity
const newActivity = await api.post('/activities', {
  type: 'running',
  distance: 5.2,
  duration: 1800,
  date: new Date().toISOString(),
  location: 'Central Park'
});

// Get all activities
const activities = await api.get('/activities');

// Chat with AI
const chatResponse = await api.post('/chat/send-message', {
  message: 'How do I join a club?'
});
```

### Python Example
```python
import requests
import json

class ScaffoldYourShapeAPI:
    def __init__(self, base_url="http://localhost:3001/api"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def post(self, endpoint, data):
        response = self.session.post(
            f"{self.base_url}{endpoint}",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    
    def get(self, endpoint):
        response = self.session.get(f"{self.base_url}{endpoint}")
        response.raise_for_status()
        return response.json()

# Usage
api = ScaffoldYourShapeAPI()

# Create activity
activity_data = {
    "type": "running",
    "distance": 5.2,
    "duration": 1800,
    "date": "2024-01-15T10:00:00.000Z",
    "location": "Central Park"
}
new_activity = api.post("/activities", activity_data)
```

## Webhooks (Future Feature)

We're planning to add webhook support for real-time notifications:
- Activity completion
- Club membership changes
- Challenge progress updates

## Support

For API support and questions:
- **Email**: support@scaffoldyourshape.com
- **Documentation**: Check the `/documents` folder for additional guides
- **Issues**: Report API issues through the chat assistant or support email

---

*Last updated: January 2024*
*API Version: 1.0.0* 
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

### Chat (AI Assistant)

#### Send Message to AI Assistant
```http
POST /api/chat/send-message
Authorization: Session recommended (but not required)
Content-Type: application/json

{
  "message": "How do I create a workout plan?",
  "userId": "user_id" // Optional
}
```

**Response:**
```json
{
  "reply": "I can help you create a workout plan! You can use our workout features to create personalized plans, track activities, and monitor progress. Would you like to know more about any specific feature?",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "success"
}
```

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
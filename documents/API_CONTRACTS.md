# API Contracts: Scaffold Your Shape

## Authentication
- **POST /api/auth/signin** — Sign in user
- **POST /api/auth/signup** — Register new user
- **POST /api/auth/signout** — Sign out user
- **GET /api/auth/session** — Get current session

## Activities
- **GET /api/activities?userId=** — Get all activities for a user
- **POST /api/activities** — Add new activity
  - Body: `{ type, distance, duration, date, location?, notes? }`
- **PUT /api/activities/:id** — Update activity
  - Body: `{ type?, distance?, duration?, date?, location?, notes? }`
- **DELETE /api/activities/:id** — Delete activity

## Exercises
- **GET /api/exercises?userId=** — Get all exercises for a user
- **POST /api/exercises** — Add new exercise
  - Body: `{ type, reps, date, notes? }`
- **PUT /api/exercises/:id** — Update exercise
  - Body: `{ type?, reps?, date?, notes? }`
- **DELETE /api/exercises/:id** — Delete exercise

## Clubs
- **GET /api/clubs** — List all clubs
- **POST /api/clubs** — Create club
  - Body: `{ name, description, image? }`
- **GET /api/clubs/:id** — Get club details
- **PUT /api/clubs/:id** — Update club
- **DELETE /api/clubs/:id** — Delete club
- **POST /api/clubs/:id/join** — Join club
- **POST /api/clubs/:id/leave** — Leave club

## Challenges
- **GET /api/challenges** — List all challenges
- **POST /api/challenges** — Create challenge
  - Body: `{ title, description, activity_type, target_value, unit, start_date, end_date, is_public }`
- **GET /api/challenges/:id** — Get challenge details
- **PUT /api/challenges/:id** — Update challenge
- **DELETE /api/challenges/:id** — Delete challenge
- **POST /api/challenges/:id/join** — Join challenge
- **POST /api/challenges/:id/leave** — Leave challenge

## Users
- **GET /api/users/:id** — Get user profile
- **PUT /api/users/:id** — Update user profile

## Club Members
- **GET /api/clubs/:id/members** — List club members
- **POST /api/clubs/:id/members** — Add member
- **DELETE /api/clubs/:id/members/:memberId** — Remove member

## Challenge Participants
- **GET /api/challenges/:id/participants** — List challenge participants
- **POST /api/challenges/:id/participants** — Add participant
- **DELETE /api/challenges/:id/participants/:participantId** — Remove participant

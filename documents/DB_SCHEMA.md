# Database Schema: Scaffold Your Shape

## Users
- id (uuid, PK)
- email (text, unique)
- name (text)
- avatar (text, nullable)
- bio (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Exercises
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- type (text)
- reps (integer)
- date (date)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Activities
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- type (text)
- distance (integer)
- duration (integer)
- date (date)
- location (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Clubs
- id (uuid, PK)
- name (text)
- description (text)
- creator_id (uuid, FK -> users.id)
- image (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## ClubMembers
- id (uuid, PK)
- club_id (uuid, FK -> clubs.id)
- user_id (uuid, FK -> users.id)
- role (text: 'admin'|'member')
- joined_at (timestamp)

## Challenges
- id (uuid, PK)
- title (text)
- description (text)
- creator_id (uuid, FK -> users.id)
- activity_type (text)
- target_value (integer)
- unit (text)
- start_date (date)
- end_date (date)
- is_public (boolean)
- created_at (timestamp)
- updated_at (timestamp)

## ChallengeParticipants
- id (uuid, PK)
- challenge_id (uuid, FK -> challenges.id)
- user_id (uuid, FK -> users.id)
- current_value (integer)
- completed (boolean)
- completed_at (timestamp, nullable)
- joined_at (timestamp)

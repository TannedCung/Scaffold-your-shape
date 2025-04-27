# Database Schema: Scaffold Your Shape

## Users
- id (uuid, PK)
- email (text, unique)
- name (text)
- avatar (text, nullable)
- bio (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Activities
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- type (text)  # e.g., 'workout', 'run', 'swim', 'bike'
- name (text)  # e.g., 'Push-ups', 'Morning Run'
- date (timestamp)
- value (integer)  # e.g., 50, 5000, 15
- unit (text)     # e.g., 'reps', 'meters'
- created_at (timestamp)
- updated_at (timestamp)
- timeAgo (text, generated in UI)

## Clubs
- id (uuid, PK)
- name (text)
- description (text)
- creatorId (uuid, FK -> users.id)
- imageUrl (text, nullable)
- memberCount (integer)
- isPrivate (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)

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
- creatorId (uuid, FK -> users.id)
- exerciseId (text)
- targetValue (integer)
- unit (text)
- startDate (timestamp)
- endDate (timestamp)
- isPublic (boolean)
- participantCount (integer)
- createdAt (timestamp)
- updatedAt (timestamp)

## ChallengeParticipants
- id (uuid, PK)
- challenge_id (uuid, FK -> challenges.id)
- user_id (uuid, FK -> users.id)
- current_value (integer)
- completed (boolean)
- completed_at (timestamp, nullable)
- joined_at (timestamp)

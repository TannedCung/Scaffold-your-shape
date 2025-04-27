# Product Requirements Document (PRD)

## Product Name
**Scaffold Your Shape**

---

## Overview

**Scaffold Your Shape** is a modern fitness tracking web application designed to help users log, monitor, and compete in both indoor exercises (e.g., push-ups, pull-ups, bench press) and outdoor activities (e.g., running, walking, swimming). The platform encourages community engagement through clubs and challenges, fostering motivation and healthy competition.

---

## Goals

- Provide a seamless and friendly interface for tracking various activities (reps and distance-based).
- Enable social interaction and motivation through clubs and challenges.
- Offer real-time, personalized dashboards for users to monitor their progress.
- Ensure security and scalability with modern authentication and backend solutions.

---

## Target Users

- Fitness enthusiasts looking to track and improve their performance.
- Individuals seeking community support and friendly competition.
- Clubs, teams, or groups wanting to organize collective fitness goals.

---

## Tech Stack

- **Frontend:** ReactJS (v18+), Material UI (MUI)
- **Authentication:** Auth.js (NextAuth)
- **Backend/Database:** Supabase (Postgres, RESTful API)
- **Deployment:** Docker-compatible, cloud-ready

---

## Core Features

### 0. **Strava Sync**
- **Sync with Strava:** Users can connect their Strava account to import activities (runs, rides, swims, etc.) into Scaffold Your Shape. Activities logged in Strava will automatically appear in the dashboard and can be used in clubs and challenges. Optionally, users can export activities from Scaffold Your Shape to Strava.

### 1. **Authentication & User Management**
- Sign up/in with email, OAuth (Google, etc.) via Auth.js.
- Secure session management.
- Profile management (avatar, bio, stats).

### 2. **Dashboard**
- Personal summary: total reps, distance, time, recent activities.
- Visualizations: charts for weekly/monthly progress.
- Quick-add activity/exercise.

### 3. **Activity Tracking**
- **Reps-based Activities:** Log reps for push-ups, pull-ups, bench press, squats, etc.
- **Distance-based Activities:** Log distance (meters) and duration for running, walking, swimming, cycling, etc.
- Edit/delete entries.
- Activity history.

### 4. **Clubs**
- Create/join clubs based on interest or location.
- Club feed: shared activities, leaderboards, announcements.
- Club member management (admin, member roles).

### 5. **Challenges**
- Join or create challenges (e.g., “Run 50km in April”, “1000 push-ups in a month”).
- Compete with friends or public.
- Track progress and see leaderboards.
- Challenge history and achievements.

### 6. **Social & Community (Optional/Stretch)**
- Activity feed: see friends’ activities.
- Comment/like on activities.
- Notifications (challenge invites, club updates).

---

## UI/UX Design

- **Color Scheme:** Main tone between green and blue (`#2da58e` as primary), minimal, vintage-inspired palette (3-4 colors).
- **Style:** Friendly, approachable, and minimal. No gradients, minimal motion, subtle transitions.
- **Components:** All UI elements use MUI for consistency and accessibility.
- **Responsiveness:** Fully responsive for desktop and mobile.

---

## Data Model (Supabase)

- **Users:** id, email, name, avatar, bio, created_at, updated_at
- **Activities:** id, user_id, type, reps, distance, duration, date, location, notes, created_at, updated_at
- **Clubs:** id, name, description, creator_id, image, created_at, updated_at
- **ClubMembers:** id, club_id, user_id, role, joined_at
- **Challenges:** id, title, description, creator_id, activity_type, target_value, unit, start_date, end_date, is_public, created_at, updated_at
- **ChallengeParticipants:** id, challenge_id, user_id, current_value, completed, completed_at, joined_at

---

## Non-Functional Requirements

- **Security:** RLS (Row Level Security) on Supabase tables, secure auth flows.
- **Performance:** Fast load times, optimized queries.
- **Accessibility:** WCAG 2.1 compliant via MUI.
- **Scalability:** Cloud-ready, Dockerized for easy deployment.

---

## Stretch Features

- **Badges/Achievements:** Reward users for milestones.
- **Additional Integrations:** Sync with Apple Health, Google Fit, etc.
- **Push Notifications:** For new challenges, club invites, etc.
- **Dark Mode:** Optional minimal dark theme.

---

## Success Metrics

- User retention and daily activity logging.
- Number of clubs created and joined.
- Number of challenges created and completed.
- Positive user feedback on UI/UX.

---

## Milestones

1. **MVP:** Auth, dashboard, activity tracking.
2. **Social:** Clubs and challenges.
3. **Polish:** UI/UX improvements, stretch features.

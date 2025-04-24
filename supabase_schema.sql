-- SUPABASE SCHEMA FOR SCAFFOLD YOUR SHAPE

-- Table: profiles
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: clubs
create table if not exists clubs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  creator_id uuid references profiles(id),
  image_url text,
  member_count integer default 0,
  is_private boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: club_members
create table if not exists club_members (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references clubs(id) not null,
  user_id uuid references profiles(id) not null,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamp with time zone default now()
);

-- Table: challenges
create table if not exists challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  creator_id uuid references profiles(id),
  exercise_id text,
  activity_type text,
  target_value integer,
  unit text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_public boolean default true,
  participant_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: challenge_participants
create table if not exists challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) not null,
  user_id uuid references profiles(id) not null,
  current_value integer default 0,
  completed boolean default false,
  completed_at timestamp with time zone,
  joined_at timestamp with time zone default now()
);

-- Table: activities
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) not null,
  type text,
  distance integer,
  duration integer,
  date timestamp with time zone,
  location text,
  notes text
);

-- Add social features for activities: reactions, comments, and shares

-- Activity Reactions Table
CREATE TABLE IF NOT EXISTS activity_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'celebrate', 'fire', 'muscle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reaction per user per activity
    UNIQUE(activity_id, user_id, reaction_type)
);

-- Activity Comments Table
CREATE TABLE IF NOT EXISTS activity_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
    parent_comment_id UUID REFERENCES activity_comments(id) ON DELETE CASCADE, -- For future nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Shares Table
CREATE TABLE IF NOT EXISTS activity_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('internal', 'external')),
    platform VARCHAR(50), -- For external shares: 'twitter', 'facebook', 'whatsapp', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_reactions_activity_id ON activity_reactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reactions_user_id ON activity_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_reactions_type ON activity_reactions(reaction_type);

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_parent ON activity_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_created_at ON activity_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_shares_activity_id ON activity_shares(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_shares_user_id ON activity_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_shares_created_at ON activity_shares(created_at DESC);

-- Row Level Security (RLS) policies

-- Activity Reactions RLS
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions" ON activity_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON activity_reactions
    FOR ALL USING (auth.uid()::text = user_id);

-- Activity Comments RLS  
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" ON activity_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON activity_comments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own comments" ON activity_comments
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own comments" ON activity_comments
    FOR DELETE USING (auth.uid()::text = user_id);

-- Activity Shares RLS
ALTER TABLE activity_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all shares" ON activity_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own shares" ON activity_shares
    FOR ALL USING (auth.uid()::text = user_id);

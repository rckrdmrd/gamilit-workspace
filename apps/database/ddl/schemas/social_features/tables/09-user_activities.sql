-- Tabla: user_activities
-- Schema: social_features
-- Descripción: Registro de actividades de usuarios para el Activity Feed
-- CREADO: 2025-11-26

CREATE TABLE social_features.user_activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('achievement', 'level_up', 'streak', 'friend_request', 'exercise', 'challenge', 'guild', 'rankup')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_user_activities_user_id ON social_features.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON social_features.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_type ON social_features.user_activities(activity_type);
CREATE INDEX idx_user_activities_is_public ON social_features.user_activities(is_public) WHERE is_public = true;

-- Índice compuesto para búsquedas del feed de amigos
CREATE INDEX idx_user_activities_public_recent ON social_features.user_activities(is_public, created_at DESC) WHERE is_public = true;

-- Comentarios
COMMENT ON TABLE social_features.user_activities IS 'User activities for the activity feed';
COMMENT ON COLUMN social_features.user_activities.activity_type IS 'Type of activity: achievement, level_up, streak, friend_request, exercise, challenge, guild, rankup';
COMMENT ON COLUMN social_features.user_activities.title IS 'Activity title/summary';
COMMENT ON COLUMN social_features.user_activities.description IS 'Detailed activity description';
COMMENT ON COLUMN social_features.user_activities.metadata IS 'Additional activity data (achievementId, exerciseId, etc.) in JSONB format';
COMMENT ON COLUMN social_features.user_activities.is_public IS 'Whether this activity is visible to friends';

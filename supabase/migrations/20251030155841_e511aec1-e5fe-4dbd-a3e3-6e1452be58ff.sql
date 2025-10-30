-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'org_request_received',
  'org_request_approved',
  'org_request_rejected',
  'org_invitation_received',
  'org_member_joined',
  'org_role_changed',
  'job_application_received',
  'job_application_status_changed',
  'match_created',
  'message_received',
  'system_update'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create product updates table
CREATE TABLE product_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feature', 'improvement', 'bugfix', 'announcement')),
  version TEXT,
  image_url TEXT,
  link_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track which users have seen updates
CREATE TABLE user_seen_updates (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  update_id UUID REFERENCES product_updates(id) ON DELETE CASCADE,
  seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, update_id)
);

-- Indexes
CREATE INDEX idx_product_updates_published_at ON product_updates(published_at DESC);
CREATE INDEX idx_user_seen_updates_user_id ON user_seen_updates(user_id);

-- Enable RLS
ALTER TABLE product_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seen_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published updates"
  ON product_updates FOR SELECT
  TO authenticated
  USING (published_at <= NOW());

CREATE POLICY "Users can track their own seen updates"
  ON user_seen_updates FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger to sync email from auth.users to user_profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id 
  AND (email IS NULL OR email = '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users email changes
CREATE TRIGGER on_auth_user_email_change
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();

-- Backfill existing users with missing emails
UPDATE user_profiles up
SET email = u.email
FROM auth.users u
WHERE up.user_id = u.id
AND (up.email IS NULL OR up.email = '')
AND u.email IS NOT NULL;
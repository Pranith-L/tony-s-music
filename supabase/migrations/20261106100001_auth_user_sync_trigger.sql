-- Migration 01: Auth User Sync Trigger & Existing Users Backfill
-- Ensures public."User" and auth.users are continuously synchronized

-- 1. Grant necessary permissions to supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO supabase_auth_admin;

-- 2. Create or replace the synchronization function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
  v_avatar TEXT;
  v_provider TEXT;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  v_role := COALESCE(
    NEW.raw_app_meta_data->>'role',
    NEW.raw_user_meta_data->>'role',
    'USER'
  );
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';
  v_provider := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'LOCAL'
  );

  INSERT INTO public."User" (
    id,
    email,
    name,
    avatar,
    role,
    provider,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id::text,
    LOWER(NEW.email),
    v_name,
    v_avatar,
    v_role,
    v_provider,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public."User".name),
    avatar = COALESCE(EXCLUDED.avatar, public."User".avatar),
    role = COALESCE(EXCLUDED.role, public."User".role),
    "updatedAt" = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Attach trigger to auth.users (runs on new user creation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Safely backfill existing public."User" accounts into auth.users so they can authenticate via Supabase Auth
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM public."User" LOOP
    -- Only insert if user does not already exist in auth.users by email
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(r.email)) THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        confirmation_token,
        email_change,
        email_change_token_new,
        email_change_token_current,
        recovery_token,
        phone_change,
        phone_change_token,
        reauthentication_token,
        is_sso_user,
        is_anonymous,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        r.id::uuid,
        'authenticated',
        'authenticated',
        LOWER(r.email),
        COALESCE(r."passwordHash", ''),
        NOW(),
        jsonb_build_object('provider', r.provider, 'role', r.role),
        jsonb_build_object('name', r.name, 'role', r.role),
        '', '', '', '', '', '', '', '',
        false,
        false,
        r."createdAt",
        r."updatedAt"
      );
    END IF;
  END LOOP;
END $$;

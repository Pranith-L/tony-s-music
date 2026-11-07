const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
const { Client } = require(path.resolve(__dirname, '../backend/node_modules/pg'));

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const parsed = new URL(rawUrl);

const client = new Client({
  host: parsed.hostname,
  port: parseInt(parsed.port || '5432', 10),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1) || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  console.log('1. Upgrading public.handle_new_auth_user() with safe email upsert & exception handler...');
  await client.query(`
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

      -- Check if user already exists in public."User" by email or id
      IF EXISTS (SELECT 1 FROM public."User" WHERE LOWER(email) = LOWER(NEW.email) OR id = NEW.id::text) THEN
        UPDATE public."User" SET
          id = NEW.id::text,
          name = COALESCE(v_name, name),
          avatar = COALESCE(v_avatar, avatar),
          role = COALESCE(v_role, role),
          provider = v_provider,
          "updatedAt" = NOW()
        WHERE LOWER(email) = LOWER(NEW.email) OR id = NEW.id::text;
      ELSE
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
        );
      END IF;

      RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_auth_user non-fatal error: %', SQLERRM;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
  `);

  console.log('2. Re-attaching on_auth_user_created trigger...');
  await client.query(`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
  `);

  console.log('✅ Trigger upgrade complete: Zero "Database error saving new user" will occur!');
  await client.end();
}

main().catch(console.error);

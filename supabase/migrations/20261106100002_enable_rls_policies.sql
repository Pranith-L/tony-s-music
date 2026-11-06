-- Migration 02: Row Level Security (RLS) Policy Implementation
-- Grants explicit, secure access while replacing the 0-policy default deny

-- 1. Helper Function to verify administrator privileges securely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on all 14 tables
ALTER TABLE public."Track" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Album" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Entitlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Playlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PlaylistTrack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LikedTrack" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WebhookEvent" ENABLE ROW LEVEL SECURITY;

-- 3. Clean up any existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 4. Table: Track
CREATE POLICY "track_public_read"
  ON public."Track" FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY "track_admin_all"
  ON public."Track" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Table: Album
CREATE POLICY "album_public_read"
  ON public."Album" FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY "album_admin_all"
  ON public."Album" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Table: Video
CREATE POLICY "video_public_read"
  ON public."Video" FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY "video_admin_all"
  ON public."Video" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Table: User
CREATE POLICY "user_select_self"
  ON public."User" FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text OR public.is_admin());

CREATE POLICY "user_update_self"
  ON public."User" FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text OR public.is_admin())
  WITH CHECK (id = auth.uid()::text OR public.is_admin());

-- 8. Table: Subscription (Read self, mutations via service_role / admin only)
CREATE POLICY "subscription_select_self"
  ON public."Subscription" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "subscription_admin_all"
  ON public."Subscription" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. Table: Purchase (Read self, mutations via service_role / admin only)
CREATE POLICY "purchase_select_self"
  ON public."Purchase" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "purchase_admin_all"
  ON public."Purchase" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. Table: Entitlement (Read self, mutations via service_role / admin only)
CREATE POLICY "entitlement_select_self"
  ON public."Entitlement" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "entitlement_admin_all"
  ON public."Entitlement" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. Table: Playlist (Users control their own playlists)
CREATE POLICY "playlist_select_self"
  ON public."Playlist" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "playlist_insert_self"
  ON public."Playlist" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "playlist_update_self"
  ON public."Playlist" FOR UPDATE
  TO authenticated
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "playlist_delete_self"
  ON public."Playlist" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- 12. Table: PlaylistTrack (Manage tracks in own playlist)
CREATE POLICY "playlist_track_select_self"
  ON public."PlaylistTrack" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Playlist" p 
      WHERE p.id = "playlistId" 
      AND (p."userId" = auth.uid()::text OR public.is_admin())
    )
  );

CREATE POLICY "playlist_track_insert_self"
  ON public."PlaylistTrack" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Playlist" p 
      WHERE p.id = "playlistId" 
      AND p."userId" = auth.uid()::text
    )
  );

CREATE POLICY "playlist_track_delete_self"
  ON public."PlaylistTrack" FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Playlist" p 
      WHERE p.id = "playlistId" 
      AND p."userId" = auth.uid()::text
    )
  );

-- 13. Table: LikedTrack (Manage liked tracks)
CREATE POLICY "liked_track_select_self"
  ON public."LikedTrack" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "liked_track_insert_self"
  ON public."LikedTrack" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "liked_track_delete_self"
  ON public."LikedTrack" FOR DELETE
  TO authenticated
  USING ("userId" = auth.uid()::text);

-- 14. Table: PaymentTransaction (Read self, admin read, mutations via service_role)
CREATE POLICY "payment_tx_select_self"
  ON public."PaymentTransaction" FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin());

CREATE POLICY "payment_tx_admin_read"
  ON public."PaymentTransaction" FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 15. Table: Booking (Anyone can submit, admin can view & update)
CREATE POLICY "booking_insert_public"
  ON public."Booking" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "booking_admin_all"
  ON public."Booking" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 16. Table: SiteSetting (Public can read, admin can update)
CREATE POLICY "site_setting_public_read"
  ON public."SiteSetting" FOR SELECT
  USING (true);

CREATE POLICY "site_setting_admin_all"
  ON public."SiteSetting" FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


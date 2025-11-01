-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Public can view active hero slides" ON hero_slides;

-- Create a more permissive SELECT policy that allows reading all slides (for admin)
CREATE POLICY "Public can view all hero slides"
  ON hero_slides
  FOR SELECT
  TO public
  USING (true);

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;

-- Create more permissive policies for admin operations
-- Note: In production, you should implement proper authentication
-- For now, we'll allow operations with the service role key

-- Allow public INSERT (you can restrict this later with proper auth)
CREATE POLICY "Allow public insert on categories"
  ON categories
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public UPDATE
CREATE POLICY "Allow public update on categories"
  ON categories
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow public DELETE
CREATE POLICY "Allow public delete on categories"
  ON categories
  FOR DELETE
  TO public
  USING (true);

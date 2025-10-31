-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (admins) to insert categories
CREATE POLICY "Allow authenticated users to insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to update categories
CREATE POLICY "Allow authenticated users to update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete categories
CREATE POLICY "Allow authenticated users to delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Tote', 'tote'),
  ('Clutch', 'clutch'),
  ('Potli', 'potli'),
  ('Sling', 'sling'),
  ('Handbag', 'handbag'),
  ('Accessories', 'accessories')
ON CONFLICT (name) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

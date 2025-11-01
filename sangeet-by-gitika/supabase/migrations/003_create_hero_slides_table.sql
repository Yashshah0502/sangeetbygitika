-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  button_text text,
  image_url text NOT NULL,
  category_slug text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key to categories (optional - allows NULL if category is deleted)
ALTER TABLE hero_slides
ADD CONSTRAINT fk_category_slug
FOREIGN KEY (category_slug)
REFERENCES categories(slug)
ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides
CREATE POLICY "Public can view active hero slides"
  ON hero_slides
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow public to manage hero slides (for admin without auth)
CREATE POLICY "Public can insert hero slides"
  ON hero_slides
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update hero slides"
  ON hero_slides
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete hero slides"
  ON hero_slides
  FOR DELETE
  TO public
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for ordering
CREATE INDEX idx_hero_slides_order ON hero_slides(display_order, created_at);
CREATE INDEX idx_hero_slides_active ON hero_slides(is_active);

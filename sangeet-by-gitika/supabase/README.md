# Supabase Database Migrations

## Running Migrations

To set up the dynamic categories feature, you need to run the SQL migration file in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `migrations/001_create_categories_table.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## What the Migration Does

The `001_create_categories_table.sql` migration:

1. **Creates the `categories` table** with the following structure:
   - `id` (uuid, primary key)
   - `name` (text, unique, not null)
   - `slug` (text, unique, not null)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **Sets up Row Level Security (RLS)** policies:
   - Public read access (everyone can view categories)
   - Authenticated users (admins) can insert, update, and delete categories

3. **Inserts default categories**:
   - Tote
   - Clutch
   - Potli
   - Sling
   - Handbag
   - Accessories

4. **Creates an `updated_at` trigger** to automatically update the timestamp when a category is modified

## Verification

After running the migration, verify it worked by:

1. Going to **Table Editor** in Supabase dashboard
2. You should see a new `categories` table
3. The table should have 6 default categories

## Next Steps

Once the migration is complete:

1. Restart your Next.js dev server: `npm run dev`
2. Navigate to `/admin/categories` to manage categories
3. Categories will now appear dynamically in:
   - Header navigation menu
   - Main page filter dropdown
   - Category pages

## Troubleshooting

If you encounter errors:

- **"relation already exists"**: The table already exists. You can skip this migration or drop the existing table first.
- **Permission denied**: Make sure you're logged in as the database owner or have sufficient permissions.
- **RLS policies conflict**: Drop existing policies on the `categories` table before running the migration.

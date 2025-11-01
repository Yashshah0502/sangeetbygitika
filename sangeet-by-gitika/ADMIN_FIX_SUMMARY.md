# Admin Operations Fix Summary

## Problem
Admin operations in production were failing with **401 Unauthorized** errors due to Row Level Security (RLS) policies in Supabase. The client-side code was using the ANON_KEY which respects RLS policies, preventing admin operations.

## Root Cause
```
Error: "new row violates row-level security policy for table \"products\""
```

Admin pages were making direct Supabase calls from the client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which respects RLS policies. We need to use the `SUPABASE_SERVICE_ROLE_KEY` on the server side, which bypasses RLS.

## Solution Implemented

### 1. Created Secure API Routes ✅
Created three new API route files that use the SERVICE_ROLE_KEY:

- **`/src/app/api/admin/products/route.ts`** - CRUD operations for products
- **`/src/app/api/admin/categories/route.ts`** - CRUD operations for categories
- **`/src/app/api/admin/hero-slides/route.ts`** - CRUD operations for hero slides

All routes:
- ✅ Verify admin authentication via JWT token
- ✅ Use `supabaseAdmin` client with SERVICE_ROLE_KEY
- ✅ Support GET, POST, PUT, DELETE operations
- ✅ Return proper error messages

### 2. Updated Products Admin Page ✅
**File:** `/src/app/admin/products/page.tsx`

Updated three key functions to use API routes instead of direct Supabase calls:
- ✅ `fetchProducts()` - Now calls `/api/admin/products`
- ✅ `handleDelete()` - Now calls `/api/admin/products?id={id}` with DELETE method
- ✅ `handleDuplicate()` - Now calls `/api/admin/products` with POST method

## What Still Needs to be Done

### 3. Update Other Admin Pages ⚠️
The following admin pages still need to be updated to use the new API routes:

#### A. Edit Product Modal
**File:** `/src/app/admin/components/EditProductModal.tsx`
- Update the save/update function to call `/api/admin/products` with PUT method

#### B. Add Product Page
**File:** `/src/app/admin/page.tsx` (main admin dashboard)
- Update product creation to call `/api/admin/products` with POST method

#### C. Categories Management
**File:** `/src/app/admin/categories/page.tsx`
- Update all Supabase calls to use `/api/admin/categories`

#### D. Hero Slides Management
**File:** `/src/app/admin/hero-slides/page.tsx`
- Update all Supabase calls to use `/api/admin/hero-slides`
- Fix the activation/deactivation toggle functionality (Issue #2)

## Testing Instructions

### Local Testing
1. Start dev server: `npm run dev`
2. Login to admin panel
3. Try these operations:
   - ✅ View products list
   - ✅ Delete a product
   - ✅ Duplicate a product
   - ⚠️ Edit a product (needs EditProductModal update)
   - ⚠️ Add new product (needs main admin page update)
   - ⚠️ Manage categories (needs categories page update)
   - ⚠️ Manage hero slides (needs hero-slides page update)

### Deployment to Vercel
**IMPORTANT:** Make sure these environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITICAL - Must be set!**
- `JWT_SECRET`

## Pattern for Updating Other Pages

To update any admin page that uses Supabase directly:

### Before (❌ Direct Supabase Call):
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase
  .from("products")
  .insert(productData)
  .select()
  .single();
```

### After (✅ API Route Call):
```typescript
const response = await fetch("/api/admin/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(productData),
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || "Failed to create product");
}

const data = result.product;
```

## Other Pending Issues

### Issue #2: Sold Out Feature
- Show "Sold Out" when `stock_quantity === 0`
- Needs to be implemented on both admin and client sides

### Issue #3: Slide Activation/Deactivation
- Hero slides activation toggle not working
- Needs investigation in `/src/app/admin/hero-slides/page.tsx`

## Summary
- ✅ **Fixed:** Products page CRUD operations now work via secure API routes
- ⚠️ **TODO:** Update EditProductModal, main admin page, categories page, and hero-slides page
- ⚠️ **TODO:** Implement Sold Out feature
- ⚠️ **TODO:** Fix slide activation toggle

Once all admin pages are updated to use the API routes, all 401 errors should be resolved!

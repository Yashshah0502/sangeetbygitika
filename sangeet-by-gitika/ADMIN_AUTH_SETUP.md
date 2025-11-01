# 🔐 Admin Authentication Setup Guide

Complete secure admin authentication implementation for **SanGeet by Gitika**.

---

## ✅ What's Been Done

All the authentication infrastructure has been set up:

- ✅ **Packages installed**: bcrypt, jsonwebtoken
- ✅ **Database table created**: `admins` table in Supabase
- ✅ **Supabase admin client**: Service role access configured
- ✅ **JWT authentication**: Token-based secure authentication
- ✅ **Login/Logout API routes**: `/api/auth/login` and `/api/auth/logout`
- ✅ **Middleware protection**: All `/admin` routes protected
- ✅ **Login page**: Beautiful themed login interface
- ✅ **Admin layout**: Header with logout functionality
- ✅ **Environment variables**: JWT_SECRET auto-generated
- ✅ **Password hash generator**: Easy admin creation

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Get Your Supabase Service Role Key**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `sangeet-by-gitika`
3. Navigate to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Copy the **`service_role`** key (NOT the anon key)

### **Step 2: Add Service Role Key to Environment**

Open `.env.local` and replace `your-service-role-key-here` with your actual service role key:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-key-here
```

### **Step 3: Create Your Admin User**

#### 3a. Generate Password Hash

Run this command with your desired password:

```bash
node generate-admin-hash.mjs "YourSecurePassword123!"
```

This will output a hash like:
```
$2b$10$GPmSRpOTvfEOxtWImgP72eCTrd7FaSTZpZCIScaL2lRK2Kk8UAaRK
```

#### 3b. Add Admin to Supabase

1. Go to **Supabase Dashboard** → **Table Editor** → **admins**
2. Click **Insert Row** (or the + button)
3. Fill in the fields:
   - **email**: `gitika@sangeet.com` (or your preferred email)
   - **name**: `Gitika` (or your preferred name)
   - **hashed_password**: `[paste the hash from step 3a]`
   - **role**: `superadmin`
   - Leave other fields as default (they auto-populate)
4. Click **Save**

---

## 🧪 Testing Your Setup

### **1. Start the Development Server**

```bash
npm run dev
```

### **2. Test Authentication Flow**

1. **Try accessing admin without login:**
   - Visit: http://localhost:3000/admin/dashboard
   - Expected: Redirects to login page ✅

2. **Login with your credentials:**
   - Visit: http://localhost:3000/admin/login
   - Enter your email and password
   - Expected: Redirects to dashboard ✅

3. **Test protected routes:**
   - Navigate to different admin pages
   - Expected: All work without redirecting ✅

4. **Test logout:**
   - Click the "Logout" button in the header
   - Expected: Redirects to login page ✅
   - Try accessing admin pages
   - Expected: Redirects to login ✅

---

## 🔒 Security Features

Your admin authentication includes:

- ✅ **Bcrypt password hashing** (10 rounds - industry standard)
- ✅ **HTTP-only cookies** (JavaScript cannot access tokens)
- ✅ **JWT tokens** (24-hour expiry)
- ✅ **Secure cookies** in production (HTTPS only)
- ✅ **SameSite protection** (CSRF attack prevention)
- ✅ **Service role isolation** (admin table not publicly accessible)
- ✅ **Middleware protection** (automatic route guarding)
- ✅ **Last login tracking** (audit trail)
- ✅ **Role-based access** (ready for multiple admin levels)

---

## 📁 Files Created/Modified

### **New Files:**
```
src/lib/supabase/admin.ts              # Supabase admin client
src/lib/auth.ts                        # JWT & password utilities
src/app/api/auth/login/route.ts        # Login endpoint
src/app/api/auth/logout/route.ts       # Logout endpoint
generate-admin-hash.mjs                # Password hash generator
```

### **Modified Files:**
```
src/middleware.ts                      # Route protection
src/app/admin/login/page.tsx          # Login UI (email + password)
src/app/admin/components/AuthCheck.tsx # Admin layout with logout
.env.local                             # Environment variables
package.json                           # Added bcrypt, jsonwebtoken
```

---

## 🎨 UI Theme

The login page matches your existing brand theme:

- **Colors**: Lavender-pink gradient (`brand-primary`, `brand-accent`)
- **Fonts**: Playfair Display (headings) + Inter (body)
- **Components**: Rounded cards, luxury shadows, smooth transitions
- **Icons**: Lucide React icons (Lock, Eye, LogOut, etc.)

---

## 🔧 Creating Additional Admins

To add more admin users later:

1. Run the hash generator:
   ```bash
   node generate-admin-hash.mjs "AnotherPassword123"
   ```

2. Insert into Supabase `admins` table with the new email and hash

3. They can now login with their credentials!

---

## 🚨 Before Deploying to Production

When deploying to **Vercel** or any hosting platform:

### **1. Add Environment Variables**

In your hosting dashboard (e.g., Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://kqzcjvlbbeidpixsefqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
JWT_SECRET=d1487da6534f9a455e72fed375b23ee432bc9b426d9b5a9c008041053024f862
```

### **2. Security Checklist**

- ✅ Change default admin password to a strong one
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use HTTPS in production (Vercel auto-enables this)
- ✅ Keep service role key secret (never expose in client code)
- ✅ Regularly update dependencies (`npm audit`)

---

## 🆘 Troubleshooting

### **"Invalid credentials" on login**
- Check email is correct (case-sensitive)
- Verify password matches what you used to generate hash
- Confirm admin exists in Supabase `admins` table
- Check `is_active` is `true` in database

### **Redirects to login immediately after logging in**
- Check `JWT_SECRET` is set in `.env.local`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check browser console for errors
- Restart dev server (`npm run dev`)

### **"Internal server error" on login**
- Check all environment variables are set
- Verify Supabase service role key is correct
- Look at server console for detailed error
- Ensure `admins` table exists with correct columns

### **Can't find service role key**
- Supabase Dashboard → Settings → API
- Scroll to "Project API keys"
- Copy `service_role` (NOT `anon`)
- It starts with `eyJ...` and is very long

---

## 📝 Sample Admin Credentials (for testing)

If you used the example password:

- **Email**: `gitika@sangeet.com`
- **Password**: `Gitika@2024`
- **Hash**: `$2b$10$GPmSRpOTvfEOxtWImgP72eCTrd7FaSTZpZCIScaL2lRK2Kk8UAaRK`

⚠️ **Change this in production!**

---

## 🎯 Next Steps

Your authentication is complete! You can now:

1. ✅ Login securely to admin panel
2. ✅ Manage products, categories, hero slides
3. ✅ Add more admins with different roles
4. ✅ Deploy to production with confidence

---

## 🔗 Useful Commands

```bash
# Generate admin password hash
node generate-admin-hash.mjs "YourPassword"

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 💡 Tips

- Use a password manager to generate strong admin passwords
- Create different admin roles (admin vs superadmin) for team members
- Monitor login activity via `last_login_at` column
- Consider adding 2FA for extra security in future
- Keep this guide for reference when adding new admins

---

**🎉 Your admin authentication is now enterprise-grade secure!**

For questions or issues, check the troubleshooting section above.

# Hero Carousel - Implementation Guide

## ✅ What's Included

The Hero Carousel is now live on your homepage at http://localhost:3000

### Features:
- ✅ **Auto-play** - Slides change every 5 seconds
- ✅ **Pause on hover** - Stops auto-play when user hovers
- ✅ **Manual navigation** - Left/Right arrow buttons
- ✅ **Dot indicators** - Click to jump to any slide
- ✅ **Slide counter** - Shows "1/3", "2/3", etc.
- ✅ **Smooth transitions** - Elegant fade animations
- ✅ **Next.js Image optimization** - Fast loading
- ✅ **Responsive design** - Works on mobile, tablet, desktop
- ✅ **Text overlays** - Title, subtitle, CTA button
- ✅ **Clickable slides** - Navigate to products/pages

---

## 🎨 Current Setup

**Location:** [src/app/components/HeroCarousel.tsx](src/app/components/HeroCarousel.tsx)

**Usage in Homepage:** [src/app/page.tsx](src/app/page.tsx#L192)

**Current Slides:** 3 demo slides using Unsplash images

---

## 📸 Adding Your Own Images

### Option 1: Use Unsplash URLs (Temporary)

Currently using:
```typescript
{
  id: "1",
  image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&q=80",
  alt: "Elegant Potli Bags Collection",
  title: "Timeless Elegance",
  subtitle: "Handcrafted potli bags for every occasion",
  cta: "Shop Collection",
  link: "/",
}
```

### Option 2: Upload to Supabase Storage (Recommended)

1. **Go to Supabase Dashboard → Storage**
2. **Create a new bucket:**
   - Name: `hero-images`
   - Public: ✅ Yes
3. **Upload your images** (recommended: 1920x1080px, JPG/PNG)
4. **Get the public URL** for each image
5. **Update the slides** in `page.tsx`:

```typescript
const heroSlides = [
  {
    id: "1",
    image: "https://[your-project].supabase.co/storage/v1/object/public/hero-images/slide1.jpg",
    alt: "Your Product",
    title: "Your Title",
    subtitle: "Your subtitle",
    cta: "Shop Now",
    link: "/category/potli",
  },
  // ... more slides
];
```

### Option 3: Use Local Images

1. **Add images to** `public/hero/` folder:
   ```
   public/
   └── hero/
       ├── slide1.jpg
       ├── slide2.jpg
       └── slide3.jpg
   ```

2. **Update slides**:
   ```typescript
   image: "/hero/slide1.jpg"
   ```

---

## 🎯 Customization Options

### Change Auto-Play Speed

In [page.tsx:192](src/app/page.tsx#L192):
```typescript
<HeroCarousel slides={heroSlides} autoPlayInterval={7000} /> // 7 seconds
```

### Hide Carousel on Search

Already implemented! Carousel only shows when NOT searching.

### Link to Specific Products

```typescript
{
  id: "2",
  image: "/hero/featured-product.jpg",
  alt: "Featured Clutch",
  title: "Limited Edition",
  subtitle: "Exclusive bridal clutch",
  cta: "View Product",
  link: "/product/[product-id]", // ← Links to product page
}
```

### Link to Category Pages

```typescript
{
  id: "3",
  image: "/hero/potli-collection.jpg",
  alt: "Potli Collection",
  title: "Potli Bags",
  subtitle: "Traditional elegance",
  cta: "Shop Potli",
  link: "/category/potli", // ← Links to category
}
```

---

## 🔮 Future: Admin-Managed Slides

Later, you can let Gitika manage hero slides from the admin panel:

### Database Schema (Optional - Future Enhancement):

```sql
create table hero_slides (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  title text,
  subtitle text,
  cta_text text,
  link_url text,
  display_order integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS policies
alter table hero_slides enable row level security;

create policy "Public can read active hero slides"
  on hero_slides for select
  to public
  using (is_active = true);

create policy "Public can manage hero slides"
  on hero_slides for all
  to public
  using (true);
```

### Admin Page (Future):

Create `/admin/hero-slides` page similar to `/admin/categories` for CRUD operations.

---

## 🎨 Styling Adjustments

### Change Carousel Height

In [HeroCarousel.tsx:67](src/app/components/HeroCarousel.tsx#L67):
```typescript
className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] ..." // Shorter
// or
className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] ..." // Taller
```

### Change Text Color/Position

In [HeroCarousel.tsx:96-120](src/app/components/HeroCarousel.tsx#L96):
```typescript
<motion.div
  className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 text-white"
  // Change to: text-black, top-0, center alignment, etc.
>
```

### Adjust Button Style

In [HeroCarousel.tsx:113-115](src/app/components/HeroCarousel.tsx#L113):
```typescript
className="px-6 md:px-8 py-2 md:py-3 bg-brand-primary text-white ..."
// Change colors, size, etc.
```

---

## 📱 Testing Checklist

Test the carousel on your live site:

- [ ] Visit http://localhost:3000
- [ ] Carousel auto-plays every 5 seconds
- [ ] Hover over carousel - auto-play stops
- [ ] Click left/right arrows - navigates manually
- [ ] Click dots - jumps to specific slide
- [ ] Click slide - navigates to link
- [ ] Check on mobile - responsive sizing works
- [ ] Search for something - carousel hides
- [ ] Clear search - carousel reappears

---

## 🚀 Next Steps

1. **Replace demo images** with your actual product photos
2. **Update slide content** (titles, subtitles, CTAs)
3. **Set proper links** to your products/categories
4. **Adjust auto-play speed** if needed
5. **(Optional)** Implement admin panel for slide management

---

## 📝 File Locations

- **Component:** [src/app/components/HeroCarousel.tsx](src/app/components/HeroCarousel.tsx)
- **Usage:** [src/app/page.tsx](src/app/page.tsx#L154-L192)
- **Images:** Upload to `public/hero/` or Supabase Storage

---

## 🎉 Summary

Your hero carousel is ready! It's a production-quality component with:
- Smooth animations
- Mobile-responsive
- Auto-play with controls
- Easy to customize
- Ready for dynamic content

Just replace the demo images with your own and you're set! 🎨

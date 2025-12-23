# Logo Upload Guide for Mamma's Food

## 📁 **Where to Upload Your Logo**

### **For Local Development:**
Place your logo files in the `public` folder:

```
daily-dish-delights/
├── public/
│   ├── logo.png          ← Main logo (recommended: 200x200px)
│   ├── logo-small.png    ← Small logo (recommended: 64x64px)
│   ├── favicon.ico       ← Browser tab icon (16x16, 32x32, 48x48px)
│   └── og-image.jpg      ← Social media preview (1200x630px)
```

### **For Production (Netlify):**
1. **Upload via Netlify Dashboard:**
   - Go to your Netlify site dashboard
   - Navigate to "Site settings" → "Asset optimization"
   - Or use the file manager in the deploy section

2. **Upload via Git (Recommended):**
   - Add logo files to the `public` folder
   - Commit and push to GitHub
   - Netlify will automatically deploy

## 🎨 **Logo Requirements**

### **Recommended Sizes:**
- **Main Logo**: 200x200px (PNG with transparent background)
- **Small Logo**: 64x64px (for mobile/compact views)
- **Favicon**: 32x32px (ICO format)
- **Social Media**: 1200x630px (JPG/PNG for Facebook/Twitter previews)

### **File Formats:**
- **PNG**: For logos with transparency
- **SVG**: For scalable vector logos (best option)
- **ICO**: For favicon only
- **JPG**: For social media previews

## 🔧 **How to Update Logo in Code**

### **1. Update Header Logo:**
Edit `src/components/Header.tsx`:
```tsx
// Replace the UtensilsCrossed icon with your logo
<img 
  src="/logo-small.png" 
  alt="Mamma's Food Logo" 
  className="w-10 h-10 rounded-full"
/>
```

### **2. Update Favicon:**
Edit `index.html`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
```

### **3. Update Social Media Preview:**
Edit `index.html`:
```html
<meta property="og:image" content="https://mammasfood.netlify.app/og-image.jpg" />
```

## 📱 **Logo Usage Examples**

### **Header Logo (Current):**
```tsx
// Current: Icon-based logo
<UtensilsCrossed className="w-5 h-5 text-primary-foreground" />

// Updated: Image logo
<img 
  src="/logo.png" 
  alt="Mamma's Food" 
  className="w-10 h-10 object-contain"
/>
```

### **Admin Panel Logo:**
```tsx
// In Admin.tsx, replace the Package icon
<img 
  src="/logo-small.png" 
  alt="Mamma's Food" 
  className="w-5 h-5"
/>
```

## 🚀 **Quick Setup Steps**

### **Step 1: Prepare Your Logo**
- Create logo in PNG format (transparent background)
- Resize to 200x200px for main logo
- Create 64x64px version for small uses
- Create 32x32px favicon

### **Step 2: Upload Files**
```bash
# Place in public folder:
public/
├── logo.png
├── logo-small.png
├── favicon.ico
└── og-image.jpg
```

### **Step 3: Update Code**
I can help you update the code once you have the logo files ready!

### **Step 4: Test Locally**
```bash
npm run dev
# Check http://localhost:8080 to see your logo
```

### **Step 5: Deploy**
```bash
git add public/
git commit -m "Add Mamma's Food logo"
git push origin main
```

## 💡 **Logo Design Tips**

### **For Food Business:**
- Use warm colors (reds, oranges, yellows)
- Include food-related elements (chef hat, spoon, plate)
- Keep it simple and readable
- Ensure it works on both light and dark backgrounds

### **Brand Colors for Mamma's Food:**
- Primary: Warm orange/red
- Secondary: Deep brown/gold
- Accent: Fresh green (for freshness)

## 📞 **Need Help?**

Once you have your logo files ready:
1. Place them in the `public` folder
2. Let me know the file names
3. I'll update the code to use your logo instead of the current icon

**Your logo will appear in:**
- Website header
- Browser tab (favicon)
- Admin panel
- Social media previews
- Mobile app icon (if applicable)
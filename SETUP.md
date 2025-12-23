# Daily Dish Delights - Setup Guide

This guide will help you set up the Daily Dish Delights application with all necessary integrations.

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Razorpay account

## Step 1: Clone and Install

```bash
git clone https://github.com/YOUR_NEW_USERNAME/daily-dish-delights.git
cd daily-dish-delights
npm install
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2.2 Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the following SQL to create the necessary tables:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create enums
CREATE TYPE app_role AS ENUM ('admin', 'user');
CREATE TYPE order_status AS ENUM ('pending', 'delivered', 'cancelled');
CREATE TYPE payment_type AS ENUM ('prepaid', 'postpaid');
CREATE TYPE plan_type AS ENUM ('daily', 'weekly', 'fifteen_day', 'monthly');

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user'
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    plan_type plan_type NOT NULL,
    payment_type payment_type NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_meals table
CREATE TABLE daily_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week TEXT NOT NULL,
    items TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view daily meals" ON daily_meals
    FOR SELECT TO authenticated, anon USING (true);

-- Create functions
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_roles_empty()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (SELECT 1 FROM user_roles LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.3 Deploy Edge Functions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy functions:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

## Step 3: Razorpay Setup

### 3.1 Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and complete verification
3. Go to Settings > API Keys
4. Generate API keys (Key ID and Key Secret)

### 3.2 Configure Razorpay in Supabase

1. Go to your Supabase dashboard
2. Navigate to Edge Functions > Settings
3. Add the following environment variables:
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

## Step 4: Environment Configuration

1. Copy the environment example:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Step 5: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 6: Test the Integration

### 6.1 Test User Registration
1. Go to `/auth` and create a new account
2. Verify email if required

### 6.2 Test Order Flow
1. Go to `/order`
2. Select a meal plan
3. Fill in delivery details
4. Test payment with Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

### 6.3 Test Admin Features
1. Manually add admin role to your user in Supabase
2. Access `/admin` to manage orders

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Frontend Deployment (Netlify)

1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## Troubleshooting

### Common Issues

1. **Razorpay not loading**: Check if the script is loaded properly
2. **Payment verification fails**: Ensure Razorpay secrets are correctly set
3. **Database errors**: Check RLS policies and table permissions
4. **CORS errors**: Ensure proper CORS headers in edge functions

### Support

For issues, please check:
1. Browser console for errors
2. Supabase logs for backend issues
3. Network tab for API call failures

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Enable RLS on all tables
- Validate all user inputs
- Use HTTPS in production
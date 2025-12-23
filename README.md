# Express Home Meals

A modern food delivery application for fresh, homemade meals delivered daily.

## Project Overview

Express Home Meals is a comprehensive meal delivery platform that offers:
- **Fresh Daily Meals**: Homemade Indian meals with dal, rice, sabzi, and roti
- **Flexible Plans**: Daily, weekly, and monthly meal subscriptions
- **Payment Options**: Prepaid and postpaid payment methods
- **Razorpay Integration**: Secure payment processing
- **User Management**: Authentication and order tracking

## Features

- 🍽️ **Meal Plans**: Daily (₹149), Weekly (₹899), Monthly (₹3839)
- 💳 **Payment Integration**: Razorpay for secure transactions
- 📱 **Responsive Design**: Works on all devices
- 🔐 **User Authentication**: Supabase auth integration
- 📊 **Admin Dashboard**: Order management and analytics
- 🚚 **Order Tracking**: Real-time order status updates

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payment**: Razorpay
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/saif-ur26/food.git
cd food
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Environment Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Deploy the edge functions in `supabase/functions/`
4. Set up the following environment variables in Supabase:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

### Razorpay Configuration

1. Create a Razorpay account
2. Get your API keys from the dashboard
3. Add them to your Supabase edge functions environment

## Deployment

### Frontend Deployment

The app can be deployed to:
- Vercel
- Netlify
- GitHub Pages

### Backend Deployment

Supabase handles the backend deployment automatically.

## Project Structure

```
daily-dish-delights/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   └── lib/                # Utility functions
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    days INTEGER NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    applicable_plans TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO pricing_plans (name, days, original_price, current_price, plan_type) VALUES
('Daily Meal', 1, 179, 149, 'daily'),
('Weekly Plan', 7, 1199, 899, 'weekly'),
('Monthly Plan', 30, 4199, 3839, 'monthly')
ON CONFLICT DO NOTHING;

-- Insert sample offer
INSERT INTO offers (name, description, discount_percentage, start_date, end_date, applicable_plans) VALUES
('New Year Special', 'Special discount for New Year celebration', 15, '2024-12-25', '2025-01-15', ARRAY['daily', 'weekly', 'monthly'])
ON CONFLICT DO NOTHING;

-- Create RLS policies
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read pricing and offers
CREATE POLICY "Everyone can view pricing plans" ON pricing_plans
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Everyone can view active offers" ON offers
    FOR SELECT TO authenticated, anon USING (is_active = true);

-- Only authenticated users can modify (admin check can be added later)
CREATE POLICY "Authenticated users can modify pricing" ON pricing_plans
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can modify offers" ON offers
    FOR ALL TO authenticated USING (true);
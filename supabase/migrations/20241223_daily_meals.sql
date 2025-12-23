-- Create daily_meals table for weekly menu
CREATE TABLE IF NOT EXISTS daily_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week TEXT NOT NULL UNIQUE CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    items TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert weekly menu data
INSERT INTO daily_meals (day_of_week, items) VALUES
('Monday', ARRAY['Dal Tadka', 'Jeera Rice', 'Aloo Gobi', 'Roti', 'Pickle', 'Curd']),
('Tuesday', ARRAY['Rajma', 'Steamed Rice', 'Bhindi Masala', 'Chapati', 'Papad', 'Raita']),
('Wednesday', ARRAY['Chana Dal', 'Pulao', 'Palak Paneer', 'Roti', 'Achaar', 'Lassi']),
('Thursday', ARRAY['Moong Dal', 'Plain Rice', 'Baingan Bharta', 'Chapati', 'Pickle', 'Curd']),
('Friday', ARRAY['Toor Dal', 'Jeera Rice', 'Aloo Matar', 'Roti', 'Papad', 'Buttermilk']),
('Saturday', ARRAY['Mixed Dal', 'Veg Biryani', 'Paneer Butter Masala', 'Naan', 'Raita', 'Gulab Jamun']),
('Sunday', ARRAY['Dal Makhani', 'Basmati Rice', 'Chole', 'Kulcha', 'Onion Salad', 'Kheer'])
ON CONFLICT (day_of_week) DO UPDATE SET
    items = EXCLUDED.items,
    updated_at = NOW();

-- Create RLS policies
ALTER TABLE daily_meals ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read daily meals
CREATE POLICY "Everyone can view daily meals" ON daily_meals
    FOR SELECT TO authenticated, anon USING (true);

-- Only authenticated users can modify (admin check can be added later)
CREATE POLICY "Authenticated users can modify daily meals" ON daily_meals
    FOR ALL TO authenticated USING (true);
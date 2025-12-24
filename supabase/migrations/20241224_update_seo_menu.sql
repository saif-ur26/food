-- Update weekly menu data to match SEO content
UPDATE daily_meals SET items = ARRAY['Bagara Rice', 'Aloo Korma', 'Onion Salad', 'Curd'], updated_at = NOW() WHERE day_of_week = 'Monday';
UPDATE daily_meals SET items = ARRAY['Lemon Rice', 'Pickle', 'Papad', 'Curd'], updated_at = NOW() WHERE day_of_week = 'Tuesday';
UPDATE daily_meals SET items = ARRAY['Steam Rice', 'Dal Tadka', 'Veg Fry'], updated_at = NOW() WHERE day_of_week = 'Wednesday';
UPDATE daily_meals SET items = ARRAY['Zeera Rice', 'Dal Fry', 'Salad', 'Raita'], updated_at = NOW() WHERE day_of_week = 'Thursday';
UPDATE daily_meals SET items = ARRAY['Plain Rice', 'Kadhi', 'Papad', 'Veg Fry'], updated_at = NOW() WHERE day_of_week = 'Friday';
UPDATE daily_meals SET items = ARRAY['Veg Pulao', 'Vegetable Curry', 'Raita'], updated_at = NOW() WHERE day_of_week = 'Saturday';
UPDATE daily_meals SET items = ARRAY['Chicken Biryani', 'Veg Biryani', 'Raita'], updated_at = NOW() WHERE day_of_week = 'Sunday';
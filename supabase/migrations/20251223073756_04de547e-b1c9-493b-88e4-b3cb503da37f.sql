-- Create table for daily meal menus
CREATE TABLE public.daily_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week TEXT NOT NULL UNIQUE,
  items TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_meals ENABLE ROW LEVEL SECURITY;

-- Anyone can view daily meals (for the public menu)
CREATE POLICY "Anyone can view daily meals"
ON public.daily_meals
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can update meals
CREATE POLICY "Admins can update meals"
ON public.daily_meals
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert meals
CREATE POLICY "Admins can insert meals"
ON public.daily_meals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for timestamp updates
CREATE TRIGGER update_daily_meals_updated_at
BEFORE UPDATE ON public.daily_meals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default meal data
INSERT INTO public.daily_meals (day_of_week, items) VALUES
  ('Monday', ARRAY['Dal', 'Plain Rice', 'Curd']),
  ('Tuesday', ARRAY['Monda', 'Plain Rice', 'Pickle']),
  ('Wednesday', ARRAY['Sambar', 'Plain Rice', 'Papad']),
  ('Thursday', ARRAY['Rasam', 'Plain Rice', 'Curd']),
  ('Friday', ARRAY['Dal Fry', 'Jeera Rice', 'Salad']),
  ('Saturday', ARRAY['Kadhi', 'Plain Rice', 'Pickle']),
  ('Sunday', ARRAY['Special Dal', 'Pulao', 'Sweet']);
-- Enable RLS on the public views to control access to character data
ALTER TABLE public.idols_basic_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idols_public ENABLE ROW LEVEL SECURITY;

-- Create policies for idols_basic_public - only authenticated users can view
CREATE POLICY "Authenticated users can view basic idol data" 
ON public.idols_basic_public 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policies for idols_public - only authenticated users can view  
CREATE POLICY "Authenticated users can view public idol data" 
ON public.idols_public 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add comments to clarify the security reasoning
COMMENT ON TABLE public.idols_basic_public IS 'View containing basic AI character data. Access restricted to authenticated users to prevent intellectual property theft.';
COMMENT ON TABLE public.idols_public IS 'View containing public AI character data. Access restricted to authenticated users to prevent competitor access to character designs and business model.';
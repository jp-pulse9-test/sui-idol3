-- Update profile_image for male idols using a subquery with row numbers
WITH ranked_males AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM idols202 
  WHERE "Gender" = 'Male' AND (profile_image IS NULL OR profile_image = '')
)
UPDATE idols202 
SET profile_image = 'https://lylblbckiwabbnjasahu.supabase.co/storage/v1/object/public/idols/male' || ((ranked_males.rn - 1) % 20 + 1) || '.png'
FROM ranked_males
WHERE idols202.id = ranked_males.id;

-- Update profile_image for female idols using a subquery with row numbers
WITH ranked_females AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM idols202 
  WHERE "Gender" = 'Female' AND (profile_image IS NULL OR profile_image = '')
)
UPDATE idols202 
SET profile_image = 'https://lylblbckiwabbnjasahu.supabase.co/storage/v1/object/public/idols/female' || ((ranked_females.rn - 1) % 20 + 1) || '.png'
FROM ranked_females
WHERE idols202.id = ranked_females.id;
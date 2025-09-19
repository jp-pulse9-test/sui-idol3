-- Update profile_image for male idols in idols202 table with storage paths
UPDATE idols202 
SET profile_image = 'https://lylblbckiwabbnjasahu.supabase.co/storage/v1/object/public/idols/male' || ((ROW_NUMBER() OVER (ORDER BY id)) % 20 + 1) || '.png'
WHERE "Gender" = 'Male' AND (profile_image IS NULL OR profile_image = '');

-- Update profile_image for female idols in idols202 table with storage paths  
UPDATE idols202 
SET profile_image = 'https://lylblbckiwabbnjasahu.supabase.co/storage/v1/object/public/idols/female' || ((ROW_NUMBER() OVER (ORDER BY id)) % 20 + 1) || '.png'
WHERE "Gender" = 'Female' AND (profile_image IS NULL OR profile_image = '');
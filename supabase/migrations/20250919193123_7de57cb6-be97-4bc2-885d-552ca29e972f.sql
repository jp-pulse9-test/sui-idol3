-- Update profile_image for male idols in idols2002 table with storage paths
-- First, create a temporary sequence for numbering
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN
        SELECT id
        FROM idols2002
        WHERE "Gender" = 'Male'
        ORDER BY id
        LIMIT 101
    LOOP
        UPDATE idols2002
        SET profile_image = 'https://lylblbckiwabbnjasahu.supabase.co/storage/v1/object/public/idols/male_' || LPAD(counter::text, 3, '0') || '.png'
        WHERE id = rec.id;

        counter := counter + 1;
    END LOOP;
END $$;
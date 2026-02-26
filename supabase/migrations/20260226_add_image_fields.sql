-- Add framework letter images (array of URLs, one per letter)
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS framework_letter_images TEXT[];

-- Add hero image to steps
ALTER TABLE chapter_steps 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add comments
COMMENT ON COLUMN chapters.framework_letter_images IS 'Array of image URLs for each framework letter (e.g., [S.png, P.png, A.png, R.png, K.png])';
COMMENT ON COLUMN chapter_steps.hero_image_url IS 'Optional hero image for this step';

-- Add adapted_prompt column to form_submissions table
ALTER TABLE form_submissions 
ADD COLUMN IF NOT EXISTS adapted_prompt TEXT;

-- Add index for faster queries on adapted_prompt
CREATE INDEX IF NOT EXISTS idx_form_submissions_adapted_prompt 
ON form_submissions(id) WHERE adapted_prompt IS NOT NULL;

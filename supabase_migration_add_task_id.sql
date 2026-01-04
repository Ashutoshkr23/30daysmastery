-- Add task_id column to identify specific tasks (e.g., 'ADD_1D_1D')
ALTER TABLE course_attempts ADD COLUMN task_id text;

-- Create index for faster querying by task
CREATE INDEX idx_course_attempts_task ON course_attempts(course_id, day_id, task_id);

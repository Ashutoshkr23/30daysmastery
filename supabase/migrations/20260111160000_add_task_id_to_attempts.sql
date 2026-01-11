alter table course_attempts add column if not exists task_id text;

create index if not exists idx_course_attempts_task_id on course_attempts(task_id);

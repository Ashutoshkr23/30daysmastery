import fs from 'fs';
import path from 'path';
import { Course } from '@/types/course';
import { Quiz } from '@/types/quiz';
import { getCourseProgress } from '@/lib/actions/progress';

const DATA_DIR = path.join(process.cwd(), 'src/data/courses');
const QUIZ_DIR = path.join(process.cwd(), 'src/data/quizzes');

export async function getCourse(courseId: string): Promise<Course | null> {
    try {
        const filePath = path.join(DATA_DIR, `${courseId}.json`);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const courseData = JSON.parse(fileContents);

        // Fetch actual user progress from database
        const totalDays = courseData.days?.length || 30;
        const actualProgress = await getCourseProgress(courseId, totalDays);

        return {
            ...courseData,
            totalDays,
            progress: actualProgress, // Override static progress with actual progress
        };
    } catch (error) {
        console.error(`Error loading course ${courseId}:`, error);
        return null;
    }
}

export async function getAllCourses(): Promise<Course[]> {
    try {
        const files = await fs.promises.readdir(DATA_DIR);
        const courses = await Promise.all(
            files
                .filter((file) => file.endsWith('.json'))
                .map(async (file) => {
                    const content = await fs.promises.readFile(
                        path.join(DATA_DIR, file),
                        'utf8'
                    );
                    return JSON.parse(content);
                })
        );
        return courses;
    } catch (error) {
        console.error('Error loading all courses:', error);
        return [];
    }
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
    try {
        const filePath = path.join(QUIZ_DIR, `${quizId}.json`);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error loading quiz ${quizId}:`, error);
        return null;
    }
}

import { firebaseService } from '@/lib/firebase/service';
import { sampleCourses } from './sample-courses';
import { Course } from '@/types/course';

export async function seedCourses(): Promise<void> {
  console.log('🌱 Starting to seed courses...');

  try {
    // Check if courses already exist
    const existingCourses = await firebaseService.getCollection<Course>('courses');

    if (existingCourses.length > 0) {
      console.log(`📚 Found ${existingCourses.length} existing courses. Skipping seed.`);
      return;
    }

    console.log(`📚 Seeding ${sampleCourses.length} courses...`);

    const seedPromises = sampleCourses.map(async (courseData) => {
      const course: Omit<Course, 'id'> = {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system-seed',
      };

      try {
        const courseId = await firebaseService.addDocument('courses', course);
        console.log(`✅ Created course: ${course.title} (${courseId})`);
        return courseId;
      } catch (error) {
        console.error(`❌ Failed to create course: ${course.title}`, error);
        throw error;
      }
    });

    await Promise.all(seedPromises);
    console.log('🎉 Courses seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

// Function to clear all courses (for development/testing)
export async function clearCourses(): Promise<void> {
  console.log('🧹 Clearing all courses...');

  try {
    const courses = await firebaseService.getCollection<Course>('courses');

    const deletePromises = courses.map(async (course) => {
      try {
        await firebaseService.deleteDocument('courses', course.id);
        console.log(`🗑️ Deleted course: ${course.title}`);
      } catch (error) {
        console.error(`❌ Failed to delete course: ${course.title}`, error);
      }
    });

    await Promise.all(deletePromises);
    console.log('🧹 All courses cleared!');

  } catch (error) {
    console.error('❌ Error clearing courses:', error);
    throw error;
  }
}

// Function to run course seeding (can be called from browser console)
if (typeof window !== 'undefined') {
  (window as any).seedCourses = seedCourses;
  (window as any).clearCourses = clearCourses;
}
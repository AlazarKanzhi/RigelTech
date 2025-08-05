import {
  users,
  courses,
  courseMaterials,
  enrollments,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type CourseMaterial,
  type InsertCourseMaterial,
  type Enrollment,
  type InsertEnrollment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Course materials operations
  getCourseMaterials(courseId: string): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;
  deleteCourseMaterial(id: string): Promise<void>;
  
  // Enrollment operations
  getEnrollments(userId: string): Promise<Enrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: string, progress: number): Promise<Enrollment>;
  
  // Analytics
  getCourseStats(): Promise<{
    totalCourses: number;
    activeStudents: number;
    completionRate: number;
    avgStudyTime: number;
  }>;
  
  getStudentStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    studyHours: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true)).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  // Course materials operations
  async getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
    return await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, courseId))
      .orderBy(courseMaterials.orderIndex);
  }

  async createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial> {
    const [newMaterial] = await db.insert(courseMaterials).values(material).returning();
    return newMaterial;
  }

  async deleteCourseMaterial(id: string): Promise<void> {
    await db.delete(courseMaterials).where(eq(courseMaterials.id, id));
  }

  // Enrollment operations
  async getEnrollments(userId: string): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async updateEnrollmentProgress(id: string, progress: number): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ 
        progress,
        completedAt: progress >= 100 ? new Date() : null 
      })
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Analytics
  async getCourseStats(): Promise<{
    totalCourses: number;
    activeStudents: number;
    completionRate: number;
    avgStudyTime: number;
  }> {
    // This would typically involve complex queries
    // For now, returning placeholder structure
    return {
      totalCourses: 0,
      activeStudents: 0,
      completionRate: 0,
      avgStudyTime: 0,
    };
  }

  async getStudentStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    studyHours: number;
  }> {
    const userEnrollments = await this.getEnrollments(userId);
    const completedCourses = userEnrollments.filter(e => e.progress >= 100).length;
    
    return {
      enrolledCourses: userEnrollments.length,
      completedCourses,
      studyHours: completedCourses * 8, // Estimate 8 hours per completed course
    };
  }
}

export const storage = new DatabaseStorage();

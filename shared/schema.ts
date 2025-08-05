import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // hashed password
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // in weeks
  coverImageUrl: varchar("cover_image_url"),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseMaterials = pgTable("course_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // pdf, video, document
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  progress: integer("progress").default(0), // percentage 0-100
  completedAt: timestamp("completed_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  coursesCreated: many(courses),
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  materials: many(courseMaterials),
  enrollments: many(enrollments),
}));

export const courseMaterialsRelations = relations(courseMaterials, ({ one }) => ({
  course: one(courses, {
    fields: [courseMaterials.courseId],
    references: [courses.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_BASE = 'https://example.com/exercises';

const EXERCISES = [
  // Chest
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', defaultSets: 4, defaultReps: 6 },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 10 },
  { name: 'Push-Up', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 15 },
  { name: 'Cable Fly', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 12 },
  { name: 'Dumbbell Flyes', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 12 },

  // Back
  { name: 'Deadlift', muscleGroup: 'Back', defaultSets: 4, defaultReps: 5 },
  { name: 'Pull-Up', muscleGroup: 'Back', defaultSets: 4, defaultReps: 8 },
  { name: 'Lat Pulldown', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10 },
  { name: 'Bent-Over Barbell Row', muscleGroup: 'Back', defaultSets: 4, defaultReps: 8 },
  { name: 'Seated Cable Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10 },
  { name: 'Face Pull', muscleGroup: 'Back', defaultSets: 3, defaultReps: 15 },

  // Legs
  { name: 'Barbell Back Squat', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 6 },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 8 },
  { name: 'Leg Press', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Walking Lunge', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Leg Curl', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Leg Extension', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Standing Calf Raise', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 15 },

  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 6 },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15 },
  { name: 'Front Raise', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 12 },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 10 },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15 },

  // Arms
  { name: 'Barbell Curl', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 10 },
  { name: 'Hammer Curl', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 12 },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 12 },
  { name: 'Skull Crusher', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 10 },
  { name: 'Dips', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 10 },

  // Core
  { name: 'Plank', muscleGroup: 'Core', defaultSets: 3, defaultReps: 60 },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core', defaultSets: 3, defaultReps: 12 },
  { name: 'Cable Crunch', muscleGroup: 'Core', defaultSets: 3, defaultReps: 15 },
  { name: 'Russian Twist', muscleGroup: 'Core', defaultSets: 3, defaultReps: 20 },
  { name: 'Ab Wheel Rollout', muscleGroup: 'Core', defaultSets: 3, defaultReps: 10 },

  // Full Body / Conditioning
  { name: 'Rowing Machine', muscleGroup: 'Full Body', defaultSets: 1, defaultReps: 500 },
  { name: 'Kettlebell Swing', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: 15 },
  { name: 'Burpee', muscleGroup: 'Full Body', defaultSets: 3, defaultReps: 12 },
  { name: 'Battle Ropes', muscleGroup: 'Full Body', defaultSets: 4, defaultReps: 30 },
  { name: 'Box Jump', muscleGroup: 'Full Body', defaultSets: 3, defaultReps: 8 },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

let created = 0;
let updated = 0;

for (const exercise of EXERCISES) {
  const demoUrl = `${DEMO_BASE}/${slugify(exercise.name)}`;
  const result = await prisma.exercise.upsert({
    where: { name: exercise.name },
    create: { ...exercise, demoUrl },
    update: {
      muscleGroup: exercise.muscleGroup,
      defaultSets: exercise.defaultSets,
      defaultReps: exercise.defaultReps,
      demoUrl,
    },
  });
  if (result.createdAt.getTime() === result.updatedAt.getTime()) {
    created++;
  } else {
    updated++;
  }
}

console.log(`Seeded ${EXERCISES.length} exercises (${created} created, ${updated} already existed and were refreshed).`);
await prisma.$disconnect();

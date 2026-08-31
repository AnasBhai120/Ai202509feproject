import { connectDB } from './config/db.js';
import { seedInitialData } from './services/dataStore.js';

async function runSeed() {
  console.log('[Seed CLI] Starting MongoDB Seeding...');
  await connectDB();
  await seedInitialData();
  console.log('[Seed CLI] Completed! Admin Account: admin@fitness.com / admin123 | User Account: user@fitness.com / user123');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed CLI] Failed:', err);
  process.exit(1);
});

import { query } from './index';
import { Logger } from '../utils';
import bcrypt from 'bcryptjs';

/**
 * Seed the database with sample data for development.
 */
async function seed(): Promise<void> {
  Logger.info('Seeding database with development data...');

  // Create a test user
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = await query(
    `INSERT INTO users (email, password_hash, plan)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, plan`,
    ['test@example.com', passwordHash, 'pro']
  );

  if (users.length > 0) {
    Logger.info('Test user created', { email: 'test@example.com', plan: 'pro' });
  } else {
    Logger.info('Test user already exists');
  }

  // Create a free-tier test user
  const freeUsers = await query(
    `INSERT INTO users (email, password_hash, plan)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, plan`,
    ['free@example.com', passwordHash, 'free']
  );

  if (freeUsers.length > 0) {
    Logger.info('Free test user created', { email: 'free@example.com', plan: 'free' });
  }

  Logger.info('Database seeding completed.');
  Logger.info('Test credentials: test@example.com / password123 (Pro plan)');
  Logger.info('Test credentials: free@example.com / password123 (Free plan)');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      Logger.error('Seed failed', { error: err.message });
      process.exit(1);
    });
}

export { seed };

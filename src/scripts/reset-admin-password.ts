import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { user, account } from '../db/schema/auth-schema';
import { v4 as uuid } from 'uuid';
import { hash } from 'bcrypt';

async function createNewAdminUser() {
  console.log('Creating a new admin user account...');
  
  try {
    // Generate random strings for password to avoid collisions
    const password = 'admin123';
    const passwordHash = await hash(password, 10);
    
    // First delete any existing admin user
    console.log('Cleaning up existing admin@example.com accounts...');
    await db.execute(sql`DELETE FROM account WHERE account_id = 'admin@example.com'`);
    await db.execute(sql`DELETE FROM "user" WHERE email = 'admin@example.com'`);
    
    // Create a new admin user
    const adminId = uuid();
    await db.insert(user).values({
      id: adminId,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: true,
      tier: 'pro', 
      role: 'admin',
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Created new admin user with ID:', adminId);
    
    // Create admin account with credential provider
    await db.insert(account).values({
      id: uuid(),
      userId: adminId,
      providerId: 'credential',
      accountId: 'admin@example.com',
      password: passwordHash,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Created admin account with credential provider');
    console.log('You should now be able to login with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  process.exit(0);
}

createNewAdminUser(); 
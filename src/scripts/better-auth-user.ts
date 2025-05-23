import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// This is the format Better Auth uses for passwords
async function hashWithBetterAuth(password: string): Promise<string> {
  const salt = uuid().replace(/-/g, '');
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${Buffer.from(key as Buffer).toString('hex')}`;
}

async function setupBetterAuthUser() {
  console.log('Setting up admin user for Better Auth...');
  
  try {
    // Clean up any existing admin users
    console.log('Cleaning up...');
    await db.execute(sql`DELETE FROM account WHERE account_id = 'admin@example.com'`);
    await db.execute(sql`DELETE FROM "user" WHERE email = 'admin@example.com'`);
    
    // Create a new admin user
    const adminId = uuid();
    console.log('Creating new admin user with ID:', adminId);
    
    await db.execute(sql`
      INSERT INTO "user" (id, name, email, email_verified, tier, role, image, created_at, updated_at) 
      VALUES (
        ${adminId}, 
        'Admin User', 
        'admin@example.com', 
        true, 
        'pro', 
        'admin', 
        null, 
        now(), 
        now()
      )
    `);
    
    // Hash the password
    const hashedPassword = await hashWithBetterAuth('admin123');
    console.log('Generated password hash for Better Auth');
    
    // Create the admin account with credential provider
    const accountId = uuid();
    await db.execute(sql`
      INSERT INTO account (
        id, account_id, provider_id, user_id, 
        password, access_token, refresh_token, 
        id_token, access_token_expires_at, 
        refresh_token_expires_at, scope, 
        created_at, updated_at
      ) 
      VALUES (
        ${accountId}, 
        'admin@example.com', 
        'credential', 
        ${adminId}, 
        ${hashedPassword}, 
        null, null, null, null, null, null, 
        now(), now()
      )
    `);
    
    console.log('Created admin account for Better Auth');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error setting up Better Auth user:', error);
  }
}

setupBetterAuthUser(); 
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { account, user } from '../db/schema/auth-schema';

async function fixAccounts() {
  console.log('Checking accounts...');
  
  try {
    // First, get all users and accounts
    const users = await db.query.user.findMany();
    const accounts = await db.query.account.findMany();
    
    console.log(`Found ${users.length} users and ${accounts.length} accounts`);
    
    // Display all accounts for debugging
    accounts.forEach(acc => {
      console.log(`Account: providerId=${acc.providerId}, accountId=${acc.accountId}, userId=${acc.userId}, hasPassword=${!!acc.password}`);
    });
    
    // Update all email accounts to ensure:
    // 1. providerId is 'credential'
    // 2. accountId matches the user's email
    for (const user of users) {
      // Find the user's account
      const userAccount = accounts.find(acc => acc.userId === user.id);
      
      if (userAccount) {
        console.log(`Updating account for user ${user.email}`);
        
        // Update the account to match Better Auth expectations
        await db.update(account)
          .set({
            providerId: 'credential',
            // Make sure accountId matches the user's email exactly
            accountId: user.email
          })
          .where(eq(account.id, userAccount.id));
          
        console.log(`Updated account for ${user.email}`);
      } else {
        console.log(`No account found for user ${user.email}, creating one...`);
        
        // If no account exists, display a warning but don't create a new one
        // as we don't have the password
        console.log(`WARNING: User ${user.email} has no account record. Manual password reset may be needed.`);
      }
    }
    
    // Verify the changes
    const updatedAccounts = await db.query.account.findMany();
    console.log('Updated accounts:');
    updatedAccounts.forEach(acc => {
      console.log(`Account: providerId=${acc.providerId}, accountId=${acc.accountId}, userId=${acc.userId}, hasPassword=${!!acc.password}`);
    });
  } catch (error) {
    console.error('Error fixing accounts:', error);
  }
  
  process.exit(0);
}

fixAccounts(); 
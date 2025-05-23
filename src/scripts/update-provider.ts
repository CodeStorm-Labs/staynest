import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { account } from '../db/schema/auth-schema';

async function updateProvider() {
  console.log('Updating provider_id from credentials to email...');
  
  try {
    const result = await db.execute(
      sql`UPDATE account SET provider_id = 'email' WHERE provider_id = 'credentials'`
    );

    console.log('Update complete!');
    console.log(result);
    
    // Verify the changes
    const updatedAccounts = await db.query.account.findMany({
      where: eq(account.providerId, 'email'),
    });
    
    console.log(`Found ${updatedAccounts.length} accounts with provider_id 'email'`);
  } catch (error) {
    console.error('Error updating provider_id:', error);
  }
  
  process.exit(0);
}

updateProvider(); 
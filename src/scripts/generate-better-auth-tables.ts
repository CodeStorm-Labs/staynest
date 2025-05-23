import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { exec } from 'child_process';

async function generateSchema() {
  console.log('Generating Better Auth schema...');
  
  try {
    // Run the Better Auth CLI to generate the schema
    exec('npx @better-auth/cli generate', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    });
  } catch (error) {
    console.error('Error generating schema:', error);
  }
}

generateSchema(); 
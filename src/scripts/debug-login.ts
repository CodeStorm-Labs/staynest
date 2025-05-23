import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { auth } from '../lib/auth';

async function testLogin() {
  console.log('Testing login with admin credentials...');
  
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: 'admin@example.com',
        password: 'admin123',
      },
      // We don't want to create a response, just test the login
      asResponse: false,
    });
    
    console.log('Login success!', result);
  } catch (error) {
    console.error('Login error:', error);
    
    // Inspect email and password provider setup
    console.log('\nDebugging provider setup:');
    console.log('Auth config:', JSON.stringify(auth, null, 2));
  }
}

testLogin(); 
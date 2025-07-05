#!/usr/bin/env node

/**
 * Demo Registration Script
 * 
 * This script can be used to register demo users via the API
 * Usage: node scripts/demo-register.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3002/trpc';

async function registerDemoUser(userData) {
  try {
    const response = await fetch(`${API_URL}/auth.register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok && result.result?.data) {
      console.log(`✅ Successfully registered: ${userData.email}`);
      console.log('User:', result.result.data.user);
      console.log('Token:', result.result.data.token.substring(0, 20) + '...');
    } else {
      console.error(`❌ Failed to register ${userData.email}:`, result.error || 'Unknown error');
    }
  } catch (error) {
    console.error(`❌ Error registering ${userData.email}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting demo user registration...\n');

  // Demo users to register
  const demoUsers = [
    {
      name: 'Demo User',
      email: 'demo@krushr.dev',
      password: 'demo1234'
    },
    {
      name: 'Alice Johnson',
      email: 'alice@krushr.dev',
      password: 'password123'
    },
    {
      name: 'Bob Smith',
      email: 'bob@krushr.dev',
      password: 'password123'
    },
    {
      name: 'Test User',
      email: 'test@krushr.dev',
      password: 'test1234'
    }
  ];

  console.log(`API URL: ${API_URL}\n`);

  for (const user of demoUsers) {
    await registerDemoUser(user);
    // Small delay between registrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✨ Demo registration complete!');
  console.log('\nYou can now login with any of these demo accounts.');
  console.log('The easiest way is to use the "Try Demo Account" button on the login page.');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ or you need to install node-fetch');
  console.error('Run: npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);
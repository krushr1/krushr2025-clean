#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:3002';
const TOKEN = '0KhPgP0U1e_dYg0060qh6zBmnkpNvZ3h'; // Alice's token
const WORKSPACE_ID = 'cmd5h651y0004qhdklsudml39'; // Alice's actual workspace

async function fixWorkspaceMembership() {
  try {
    console.log('🔧 Fixing workspace membership for Alice...\n');
    
    // Try to add Alice as a member of her own workspace
    const response = await fetch(`${API_BASE}/trpc/workspace.addMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        workspaceId: WORKSPACE_ID,
        userId: 'cmd5h64yy0000qhdk2znrxel2', // Alice's user ID
        role: 'ADMIN'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Alice added to workspace as member');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed to add Alice to workspace:', data);
      
      // If Alice is the owner, she should already have access
      // Let's check if there's a different endpoint or if we need to create the membership directly
      console.log('\n🔍 Alice is the workspace owner, checking if owner has implicit access...');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixWorkspaceMembership().catch(console.error);
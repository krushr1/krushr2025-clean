#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:3002';
const TOKEN = '0KhPgP0U1e_dYg0060qh6zBmnkpNvZ3h'; // Alice's token

async function getAliceWorkspace() {
  try {
    console.log('🔍 Getting Alice\'s workspace...\n');
    
    // Get user's workspaces
    const response = await fetch(`${API_BASE}/trpc/workspace.getAll`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const data = await response.json();
    
    console.log('Raw response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.result && Array.isArray(data.result)) {
      console.log(`✅ Found ${data.result.length} workspaces for Alice:`);
      data.result.forEach((workspace, index) => {
        console.log(`   ${index + 1}. ${workspace.id}: ${workspace.name}`);
      });
      
      if (data.result.length > 0) {
        const firstWorkspace = data.result[0];
        console.log(`\n🎯 Using workspace: ${firstWorkspace.id} (${firstWorkspace.name})`);
        return firstWorkspace.id;
      }
    } else {
      console.log('❌ Failed to get workspaces or no results:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getAliceWorkspace().then(workspaceId => {
  if (workspaceId) {
    console.log(`\n📋 Update your test files to use: ${workspaceId}`);
  }
}).catch(console.error);
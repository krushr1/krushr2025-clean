#!/usr/bin/env node

/**
 * Debug script to check workspace access issue
 */

const { PrismaClient } = require('@prisma/client');

async function checkWorkspaceAccess() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./api/prisma/dev.db'
      }
    }
  });

  try {
    console.log('🔍 Checking Workspace Access Debug\n');

    // Find Alice's user ID
    const alice = await prisma.user.findFirst({
      where: { email: 'alice@krushr.dev' }
    });

    if (!alice) {
      console.log('❌ Alice user not found');
      return;
    }

    console.log(`✅ Alice found: ${alice.id} (${alice.email})`);

    // Check Alice's workspaces
    const aliceWorkspaces = await prisma.workspace.findMany({
      where: { 
        members: {
          some: { userId: alice.id }
        }
      },
      include: {
        members: {
          where: { userId: alice.id }
        }
      }
    });

    console.log(`\n📁 Alice's workspaces (${aliceWorkspaces.length}):`);
    aliceWorkspaces.forEach(workspace => {
      console.log(`   - ${workspace.id}: ${workspace.name} (role: ${workspace.members[0]?.role || 'unknown'})`);
    });

    // Check the specific workspace from the test
    const targetWorkspaceId = 'cmd5h64yj0003qhdkepezkhvu';
    console.log(`\n🎯 Checking specific workspace: ${targetWorkspaceId}`);

    const workspace = await prisma.workspace.findUnique({
      where: { id: targetWorkspaceId },
      include: {
        members: true
      }
    });

    if (!workspace) {
      console.log('❌ Target workspace not found');
    } else {
      console.log(`✅ Target workspace found: ${workspace.name}`);
      console.log(`   Members (${workspace.members.length}):`);
      workspace.members.forEach(member => {
        console.log(`   - ${member.userId} (role: ${member.role})`);
      });

      // Check if Alice is a member
      const aliceMembership = workspace.members.find(m => m.userId === alice.id);
      if (aliceMembership) {
        console.log(`✅ Alice IS a member with role: ${aliceMembership.role}`);
      } else {
        console.log(`❌ Alice is NOT a member of this workspace`);
        
        // Let's add Alice to the workspace
        console.log('\n🔧 Adding Alice to the workspace...');
        await prisma.workspaceMember.create({
          data: {
            userId: alice.id,
            workspaceId: targetWorkspaceId,
            role: 'ADMIN'
          }
        });
        console.log('✅ Alice added to workspace as ADMIN');
      }
    }

    // Check workspace_members table directly
    console.log('\n📊 Direct workspace_members query:');
    const directMembers = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: targetWorkspaceId
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    console.log(`   Found ${directMembers.length} members:`);
    directMembers.forEach(member => {
      console.log(`   - ${member.user.email} (${member.role})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspaceAccess().catch(console.error);
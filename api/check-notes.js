// Check current notes in database
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotes() {
  console.log('📋 Current notes in database:\n');
  
  const notes = await prisma.note.findMany({
    where: {
      workspaceId: 'cmd5h651y0004qhdklsudml39', // Krushr Development workspace
      authorId: 'cmd5h64yy0000qhdk2znrxel2' // Alice's ID
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      tags: true
    }
  });
  
  console.log(`Found ${notes.length} notes total\n`);
  
  notes.forEach((note, idx) => {
    console.log(`Note ${idx + 1}:`);
    console.log(`  ID: ${note.id}`);
    console.log(`  Title: "${note.title}"`);
    console.log(`  Content Length: ${note.content.length} characters`);
    console.log(`  Content: "${note.content}"`);
    console.log(`  Tags: ${note.tags.map(t => t.name).join(', ')}`);
    console.log(`  Created: ${note.createdAt}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkNotes();
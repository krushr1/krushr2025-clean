// Watch for new notes being created
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let lastNoteCount = 0;
let lastNoteId = null;

async function checkNotes() {
  try {
    const notes = await prisma.note.findMany({
      where: {
        workspaceId: 'cmd5h651y0004qhdklsudml39',
        authorId: 'cmd5h64yy0000qhdk2znrxel2'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        tags: true
      }
    });
    
    if (notes.length > lastNoteCount || (notes.length > 0 && notes[0].id !== lastNoteId)) {
      console.log(`\n🔥 NEW NOTE DETECTED! ${new Date().toLocaleTimeString()}`);
      console.log('='.repeat(60));
      
      const newNote = notes[0];
      console.log(`📝 Title: "${newNote.title}"`);
      console.log(`📄 Content Length: ${newNote.content.length} characters`);
      console.log(`📄 Full Content: "${newNote.content}"`);
      console.log(`🏷️  Tags: ${newNote.tags.map(t => t.name).join(', ')}`);
      console.log(`⏰ Created: ${newNote.createdAt}`);
      
      // Check if this looks like AI-generated content
      const isAIGenerated = newNote.tags.some(t => t.name === 'ai-generated');
      console.log(`🤖 AI Generated: ${isAIGenerated ? 'YES' : 'NO'}`);
      
      // Analyze content length and quality
      if (newNote.content.length > 50) {
        console.log('✅ Content has good length (>50 chars)');
      } else {
        console.log('⚠️  Content is short (<50 chars)');
      }
      
      if (newNote.content.includes(' ') && newNote.content.length > 20) {
        console.log('✅ Content appears to be full sentences');
      } else {
        console.log('⚠️  Content may be truncated');
      }
      
      lastNoteId = newNote.id;
    }
    
    lastNoteCount = notes.length;
    
  } catch (error) {
    console.error('Error checking notes:', error.message);
  }
}

console.log('👀 Watching for new notes...');
console.log('🚀 Go to http://127.0.0.1:8001/#/workspace and test the AI!');
console.log('💬 Try: "Create a note about our meeting tomorrow to discuss the new authentication system, including OAuth setup, user roles, and security requirements"');
console.log('');

// Check immediately
checkNotes();

// Then check every 2 seconds
setInterval(checkNotes, 2000);
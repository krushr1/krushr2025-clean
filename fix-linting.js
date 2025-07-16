const fs = require('fs');

// Fix WorkspaceAiChat.tsx JSX structure
const chatFile = 'frontend/src/components/ai/WorkspaceAiChat.tsx';
let chatContent = fs.readFileSync(chatFile, 'utf8');

// Find the last occurrence of </div> before </FloatingWrapper> and ensure it's properly structured
const lines = chatContent.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</FloatingWrapper>')) {
    // Make sure there's a closing div before FloatingWrapper
    if (!lines[i-1].includes('</div>')) {
      lines.splice(i, 0, '      </div>');
    }
    break;
  }
}
chatContent = lines.join('\n');
fs.writeFileSync(chatFile, chatContent);

// Fix use-comments.ts destructuring syntax  
const commentsFile = 'frontend/src/hooks/use-comments.ts';
let commentsContent = fs.readFileSync(commentsFile, 'utf8');
commentsContent = commentsContent.replace('deleteComment as removeComment,', 'deleteComment: removeComment,');
fs.writeFileSync(commentsFile, commentsContent);

console.log('Fixed both linting issues');

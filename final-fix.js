const fs = require('fs');

const file = 'frontend/src/components/ai/WorkspaceAiChat.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the problematic ending with the correct JSX structure
const badEnding = `      )}
      </div>
    </FloatingWrapper>`;

const goodEnding = `      )}
    </div>
    </FloatingWrapper>`;

content = content.replace(badEnding, goodEnding);
fs.writeFileSync(file, content);
console.log('Fixed JSX structure');

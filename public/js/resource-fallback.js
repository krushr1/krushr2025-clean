
// Resource Fallback Handler
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG' && e.target.src.includes('krushr.svg')) {
    // Fallback for missing krushr.svg
    e.target.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#143197" rx="4"/>
        <text x="50" y="25" font-family="Arial" font-size="12" fill="white" text-anchor="middle">KRUSHR</text>
      </svg>
    `);
  }
}, true);

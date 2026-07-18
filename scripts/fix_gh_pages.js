const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// 1. Define the mapping of public files to their new root files
const mapping = {
  'index.html': 'index.html',
  'products.html': 'liquidi.html',
  'brands.html': 'dispositivi.html',
  'about.html': 'chi-siamo.html',
  'contact.html': 'contatti.html',
  'faq.html': 'faq.html',
  'myliquido.html': 'myliquido.html'
};

const routeMapping = {
  'index.html': '/',
  'products.html': '/liquidi',
  'brands.html': '/dispositivi',
  'about.html': '/chi-siamo',
  'contact.html': '/contatti',
  'faq.html': '/faq',
  'myliquido.html': '/myliquido'
};

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  console.error("Public directory not found.");
  process.exit(1);
}

// For each file in mapping
for (const [oldName, newName] of Object.entries(mapping)) {
  const oldPath = path.join(publicDir, oldName);
  const newPath = path.join(rootDir, newName);

  if (fs.existsSync(oldPath)) {
    // Read the content
    let content = fs.readFileSync(oldPath, 'utf8');

    // Replace asset paths: ../assets/ -> ./assets/ etc
    content = content.replace(/\.\.\/assets\//g, './assets/');
    content = content.replace(/\.\.\/shared\//g, './shared/');
    content = content.replace(/\.\.\/src\//g, './src/');
    content = content.replace(/\.\.\/backend\//g, './backend/');
    
    // Also catch some that might be missing the trailing slash
    content = content.replace(/\.\.\/assets/g, './assets');
    content = content.replace(/\.\.\/shared/g, './shared');
    content = content.replace(/\.\.\/src/g, './src');

    // Write the modified content to the new root location
    fs.writeFileSync(newPath, content, 'utf8');
    console.log(`Created ${newName} in root and updated asset paths.`);

    // Replace the original file in public/ with a meta redirect
    const redirectUrl = routeMapping[oldName];
    const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=${redirectUrl}">
    <title>Redirecting...</title>
    <script>window.location.href = "${redirectUrl}";</script>
</head>
<body>
    <p>Redirecting to <a href="${redirectUrl}">the new page</a>...</p>
</body>
</html>`;
    
    fs.writeFileSync(oldPath, redirectHtml, 'utf8');
    console.log(`Replaced ${oldName} in public/ with a meta redirect to ${redirectUrl}.`);
  } else {
    console.warn(`File ${oldName} not found in public directory.`);
  }
}

// Note: other html files in public/ (like search.html, category-products.html, etc.) 
// should probably be moved to root too if they are accessed directly.
// Let's move them too without renaming (except replacing asset paths).
const allPublicFiles = fs.readdirSync(publicDir);
for (const file of allPublicFiles) {
  if (file.endsWith('.html') && !mapping[file]) {
    const oldPath = path.join(publicDir, file);
    const newPath = path.join(rootDir, file);
    
    let content = fs.readFileSync(oldPath, 'utf8');
    
    // Check if it's already a redirect (skip if so)
    if (content.includes('meta http-equiv="refresh"')) continue;

    content = content.replace(/\.\.\/assets\//g, './assets/');
    content = content.replace(/\.\.\/shared\//g, './shared/');
    content = content.replace(/\.\.\/src\//g, './src/');
    
    fs.writeFileSync(newPath, content, 'utf8');
    console.log(`Moved ${file} to root and updated asset paths.`);
    
    const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/${file}">
    <title>Redirecting...</title>
    <script>window.location.href = "/${file}";</script>
</head>
<body>
    <p>Redirecting to <a href="/${file}">the new page</a>...</p>
</body>
</html>`;
    fs.writeFileSync(oldPath, redirectHtml, 'utf8');
    console.log(`Replaced ${file} in public/ with a meta redirect to /${file}.`);
  }
}

console.log('Restructuring complete. GitHub Pages static routing is now enabled.');

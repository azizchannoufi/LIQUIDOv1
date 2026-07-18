const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..');

const replacements = [
  // Canonical / Absolute URLs
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/index\.html/g, new: 'https://www.liquidovapeshop.it/' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/products\.html/g, new: 'https://www.liquidovapeshop.it/liquidi' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/brands\.html/g, new: 'https://www.liquidovapeshop.it/dispositivi' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/about\.html/g, new: 'https://www.liquidovapeshop.it/chi-siamo' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/contact\.html/g, new: 'https://www.liquidovapeshop.it/contatti' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/faq\.html/g, new: 'https://www.liquidovapeshop.it/faq' },
  { old: /https:\/\/(?:www\.)?(?:liquido\.vapeshop|liquidovapeshop\.it)\/public\/myliquido\.html/g, new: 'https://www.liquidovapeshop.it/myliquido' },

  // Relative / Absolute Paths in href or src
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?index\.html(\?[^"']*)?["']/g, new: '$1="/"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?products\.html(\?[^"']*)?["']/g, new: '$1="/liquidi$2"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?brands\.html(\?[^"']*)?["']/g, new: '$1="/dispositivi$2"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?about\.html(\?[^"']*)?["']/g, new: '$1="/chi-siamo$2"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?contact\.html(\?[^"']*)?["']/g, new: '$1="/contatti$2"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?faq\.html(\?[^"']*)?["']/g, new: '$1="/faq$2"' },
  { old: /(href|action)=["'](?:\.\/|\/)?(?:public\/)?myliquido\.html(\?[^"']*)?["']/g, new: '$1="/myliquido$2"' },

  // Catch JS redirections (e.g., window.location.href = "/liquidi")
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?index\.html(\?[^'"]*)?(?:'|")/g, new: '"/"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?products\.html(\?[^'"]*)?(?:'|")/g, new: '"/liquidi$1"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?brands\.html(\?[^'"]*)?(?:'|")/g, new: '"/dispositivi$1"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?about\.html(\?[^'"]*)?(?:'|")/g, new: '"/chi-siamo$1"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?contact\.html(\?[^'"]*)?(?:'|")/g, new: '"/contatti$1"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?faq\.html(\?[^'"]*)?(?:'|")/g, new: '"/faq$1"' },
  { old: /(?:'|")(?:\.\/|\/)?(?:public\/)?myliquido\.html(\?[^'"]*)?(?:'|")/g, new: '"/myliquido$1"' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const { old, new: replacement } of replacements) {
    content = content.replace(old, replacement);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        walkDir(fullPath);
      }
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir(projectDir);
console.log('Done updating URLs.');

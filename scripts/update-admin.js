const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.html')) {
            callback(path.join(dir, f));
        }
    });
}

walkDir('c:\\Users\\DELL\\Desktop\\LIQUIDO\\LIQUIDOv1\\admin', function (filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace Inter with Plus Jakarta Sans in Google Fonts
    content = content.replace(/family=Inter:[^&"']+/g, 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800');

    // Replace primary color
    content = content.replace(/#f2f20d/g, '#F8ED70');

    // Replace Inter in tailwind config and inline styles
    content = content.replace(/"Inter"/g, '"Plus Jakarta Sans"');
    content = content.replace(/'Inter'/g, "'Plus Jakarta Sans'");

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});

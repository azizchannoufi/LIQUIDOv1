// Script pour démarrer le serveur depuis le répertoire LIQUIDOv1
const { spawn } = require('child_process');
const path = require('path');

// Obtenir le répertoire du script (LIQUIDOv1)
const serverDir = __dirname;

// Changer de répertoire et lancer http-server
process.chdir(serverDir);

console.log('Starting LIQUIDO server...');
console.log('Server directory:', serverDir);
console.log('Admin page will be available at: http://localhost:3000/admin/');

const server = spawn('npx', [
  'http-server',
  '.',
  '-p', '3000',
  '-o',
  '-c-1',
  '--cors',
  '-d', 'false'
], {
  stdio: 'inherit',
  shell: true,
  cwd: serverDir
});

server.on('error', (error) => {
  console.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill();
  process.exit(0);
});



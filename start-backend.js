const { spawn } = require('child_process');
const path = require('path');

// Change to backend directory and start server
process.chdir(path.join(__dirname, 'backend'));
console.log('Starting backend server from:', process.cwd());

const server = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

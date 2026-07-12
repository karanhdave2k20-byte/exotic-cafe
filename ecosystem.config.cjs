module.exports = {
  apps: [
    {
      name: 'aura-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--host --port 5173',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'aura-backend',
      script: 'server/server.js',
      cwd: './',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
    },
    {
      name: 'aura-share',
      script: 'ssh',
      args: '-R 80:localhost:5173 nokey@localhost.run',
      watch: false,
    },
  ],
};

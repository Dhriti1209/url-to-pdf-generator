const path = require("path");
const npmPath = path.resolve(require.resolve("npm"))

module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './frontend',
      script: npmPath,
       args: "run dev",
      
    },
    {
      name: 'backend',
      cwd: './backend', // path to your Express project
      script: 'app.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
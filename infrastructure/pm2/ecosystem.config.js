module.exports = {
  apps: [
    {
      name: 'talha-backend',
      script: 'dist/main.js',
      cwd: '../backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

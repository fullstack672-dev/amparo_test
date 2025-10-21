const config = {
  user: process.env.DB_USER || 'SA',
  password: process.env.DB_PASSWORD || 'Basketball@0615',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'PJF_Amparos',
  options: {
    encrypt: false,              // true if using Azure
    trustServerCertificate: true, // required for local dev
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

module.exports = config;

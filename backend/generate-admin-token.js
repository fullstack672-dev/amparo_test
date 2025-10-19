#!/usr/bin/env node

/**
 * Admin Token Generator
 * Automatically generates a valid JWT token for admin@admin.com
 * 
 * Usage: node generate-admin-token.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Super admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_USER_ID = 2;

// Database password hash (from database)
const STORED_HASH = '$2a$12$wicihN6nWQ9sg0BwlQ5NOOD646fdHdTYx.fdG2okOo4ktvLVi2BMy';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for the admin user
 */
async function generateAdminToken() {
  console.log('🔐 Admin Token Generator');
  console.log('========================\n');

  // Step 1: Verify password
  console.log('Step 1: Verifying password...');
  const passwordValid = await bcrypt.compare(ADMIN_PASSWORD, STORED_HASH);
  
  if (!passwordValid) {
    console.error('❌ Password verification failed!');
    console.error('The stored hash does not match the password.');
    process.exit(1);
  }
  console.log('✅ Password verified successfully\n');

  // Step 2: Generate token
  console.log('Step 2: Generating JWT token...');
  const token = jwt.sign(
    { userId: ADMIN_USER_ID },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  console.log('✅ Token generated successfully\n');

  // Step 3: Decode token to show contents
  console.log('Step 3: Token information:');
  const decoded = jwt.decode(token);
  const issuedAt = new Date(decoded.iat * 1000);
  const expiresAt = new Date(decoded.exp * 1000);
  
  console.log('  Payload:', JSON.stringify(decoded, null, 2));
  console.log('  Issued at:', issuedAt.toISOString());
  console.log('  Expires at:', expiresAt.toISOString());
  console.log('  Valid for:', Math.round((decoded.exp - decoded.iat) / 3600), 'hours\n');

  // Step 4: Verify token
  console.log('Step 4: Verifying generated token...');
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token signature is valid');
    console.log('  User ID:', verified.userId, '\n');
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    process.exit(1);
  }

  // Step 5: Display results
  console.log('========================');
  console.log('🎉 SUCCESS!');
  console.log('========================\n');
  
  console.log('Admin Credentials:');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  User ID:', ADMIN_USER_ID);
  console.log('  Profile ID: 1 (Administrador)\n');

  console.log('Generated Token:');
  console.log('  ' + token);
  console.log('');

  console.log('Usage in API calls:');
  console.log('  Authorization: Bearer ' + token);
  console.log('');

  console.log('Test with curl:');
  console.log(`  curl -X GET http://localhost:3000/api/users \\`);
  console.log(`    -H "Authorization: Bearer ${token}"`);
  console.log('');

  // Step 6: Copy to clipboard (if on Linux with xclip)
  try {
    const { execSync } = require('child_process');
    execSync(`echo "${token}" | xclip -selection clipboard`, { stdio: 'ignore' });
    console.log('✅ Token copied to clipboard!');
  } catch (error) {
    console.log('💡 Tip: Install xclip to auto-copy token to clipboard');
  }

  console.log('');
  return token;
}

// Run if executed directly
if (require.main === module) {
  generateAdminToken().catch((error) => {
    console.error('❌ Error generating token:', error);
    process.exit(1);
  });
}

module.exports = { generateAdminToken };


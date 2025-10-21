const { getPool, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

/**
 * Database Initialization Utility
 * Checks if database is initialized and sets it up if needed
 */

const SUPER_ADMIN_EMAIL = 'admin@admin.com';
const SUPER_ADMIN_PASSWORD = 'admin123';

/**
 * Check if database tables exist
 */
async function checkTablesExist() {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT COUNT(*) as tableCount
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'Usuarios'
    `);
    
    return result.recordset[0].tableCount > 0;
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
}

/**
 * Execute SQL script file
 */
async function executeSqlScript(scriptPath) {
  try {
    const pool = getPool();
    // Read as buffer first to detect encoding
    const buffer = fs.readFileSync(scriptPath);
    
    // Detect UTF-16 BOM (FF FE for little-endian or FE FF for big-endian)
    let sqlScript;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      console.log('📄 Detected UTF-16 LE encoding');
      sqlScript = buffer.toString('utf16le');
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      console.log('📄 Detected UTF-16 BE encoding');
      // Node.js doesn't have utf16be, convert manually or use iconv
      sqlScript = buffer.toString('utf16le'); // Try LE first
    } else {
      // Assume UTF-8
      sqlScript = buffer.toString('utf8');
    }
    
    // Remove BOM if present
    if (sqlScript.charCodeAt(0) === 0xFEFF) {
      sqlScript = sqlScript.slice(1);
    }
    
    // Normalize line endings to \n
    sqlScript = sqlScript.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split by GO statements (on their own line, case insensitive)
    const batches = sqlScript
      .split(/\nGO\n/i)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);
    
    console.log(`📋 Found ${batches.length} SQL batches to execute...`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch.length === 0) continue;
      
      // Skip USE [database] statements - we're already connected
      if (batch.match(/^\s*USE\s+\[.*?\]\s*$/i)) {
        skipCount++;
        continue;
      }
      
      // Skip empty or comment-only batches
      if (batch.match(/^\s*\/\*.*\*\/\s*$/s) || batch.match(/^\s*--/)) {
        skipCount++;
        continue;
      }
      
      try {
        await pool.request().query(batch);
        successCount++;
        if ((i + 1) % 50 === 0) {
          console.log(`   Processed ${i + 1}/${batches.length} batches...`);
        }
      } catch (error) {
        // Ignore errors for objects that already exist
        if (error.message.includes('already exists') || 
            error.message.includes('already an object') ||
            error.message.includes('already has a DEFAULT') ||
            error.message.includes('cannot be added. Property')) {
          skipCount++;
        } else {
          console.warn(`⚠️  Warning in batch ${i + 1}:`, error.message.substring(0, 150));
          // Don't fail completely, continue with other batches
        }
      }
    }
    
    console.log(`✅ Schema loaded: ${successCount} batches executed, ${skipCount} skipped`);
    return successCount > 0; // Success if at least some batches executed
  } catch (error) {
    console.error('❌ Error executing SQL script:', error.message);
    return false;
  }
}

/**
 * Expand password column for bcrypt hashes
 */
async function expandPasswordColumn() {
  try {
    const pool = getPool();
    await pool.request().query(`
      ALTER TABLE Usuarios ALTER COLUMN Clave VARCHAR(255);
    `);
    console.log('✅ Password column expanded to VARCHAR(255)');
    return true;
  } catch (error) {
    if (error.message.includes('already')) {
      console.log('✅ Password column already expanded');
      return true;
    }
    console.error('❌ Error expanding password column:', error.message);
    return false;
  }
}

/**
 * Create initial data (districts, profiles, juzgados)
 */
async function createInitialData() {
  try {
    const pool = getPool();
    
    // Create default district
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM Cat_Distritos WHERE IdDistrito = 1)
      BEGIN
        INSERT INTO Cat_Distritos (IdDistrito, Distrito, Nombre, Tipo, Eliminado) 
        VALUES (1, 'ADM', 'Administración Central', 'A', 0);
        PRINT '✅ Default district created';
      END
    `);
    
    // Create admin profile
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM Cat_Perfil WHERE id_perfil = 1)
      BEGIN
        SET IDENTITY_INSERT Cat_Perfil ON;
        INSERT INTO Cat_Perfil (id_perfil, Nombre, Eliminado) 
        VALUES (1, 'Administrador', 0);
        SET IDENTITY_INSERT Cat_Perfil OFF;
        PRINT '✅ Admin profile created';
      END
    `);
    
    // Create default juzgado
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM Cat_Juzgados WHERE organo_impartidor_justicia = 1)
      BEGIN
        INSERT INTO Cat_Juzgados (IdJuzgadoPJHGO, Clave, Nombre, TipoJuicio, IdDistrito, organo_impartidor_justicia, Correo, Eliminado) 
        VALUES (1, 'ADM', 'Administración Central', 'A', 1, 1, '${SUPER_ADMIN_EMAIL}', 0);
        PRINT '✅ Default juzgado created';
      END
    `);
    
    console.log('✅ Initial data created');
    return true;
  } catch (error) {
    console.error('❌ Error creating initial data:', error.message);
    return false;
  }
}

/**
 * Create super admin user
 */
async function createSuperAdminUser() {
  try {
    const pool = getPool();
    
    // Check if admin user already exists
    const checkResult = await pool.request()
      .input('email', sql.VarChar, SUPER_ADMIN_EMAIL)
      .query(`
        SELECT COUNT(*) as count 
        FROM Usuarios 
        WHERE Correo = @email
      `);
    
    if (checkResult.recordset[0].count > 0) {
      console.log('✅ Super admin user already exists');
      return true;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
    
    // Create admin user
    await pool.request()
      .input('organo', sql.Int, 1)
      .input('nombre', sql.VarChar, 'Super')
      .input('apaterno', sql.VarChar, 'Administrador')
      .input('amaterno', sql.VarChar, 'Sistema')
      .input('usuario', sql.VarChar, 'admin')
      .input('correo', sql.VarChar, SUPER_ADMIN_EMAIL)
      .input('clave', sql.VarChar, hashedPassword)
      .input('telefono', sql.VarChar, '0000000000')
      .input('extension', sql.VarChar, '0000')
      .input('estado', sql.Char, 'A')
      .input('perfil', sql.Int, 1)
      .input('eliminado', sql.Bit, 0)
      .query(`
        INSERT INTO Usuarios 
          (organo_impartidor_justicia, Nombre, APaterno, AMaterno, Usuario, Correo, Clave, Telefono, Extensión, Estado, id_perfil, Eliminado)
        VALUES 
          (@organo, @nombre, @apaterno, @amaterno, @usuario, @correo, @clave, @telefono, @extension, @estado, @perfil, @eliminado)
      `);
    
    console.log('✅ Super admin user created');
    console.log('   Email:', SUPER_ADMIN_EMAIL);
    console.log('   Password:', SUPER_ADMIN_PASSWORD);
    return true;
  } catch (error) {
    console.error('❌ Error creating super admin user:', error.message);
    return false;
  }
}

/**
 * Initialize database with schema and seed data
 */
async function initializeDatabase() {
  console.log('');
  console.log('🗄️  Database Initialization Check');
  console.log('===================================');
  console.log('');
  
  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log('✅ Database tables already exist');
      console.log('✅ Database is ready');
      console.log('');
      return true;
    }
    
    console.log('📊 Database is empty - initializing...');
    console.log('');
    
    // Load schema from SQL file
    const schemaPath = path.join(__dirname, '../../../30092025.sql');
    console.log('📋 Loading schema from:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      return false;
    }
    
    const schemaLoaded = await executeSqlScript(schemaPath);
    if (!schemaLoaded) {
      return false;
    }
    
    console.log('');
    
    // Expand password column
    await expandPasswordColumn();
    
    console.log('');
    
    // Create initial data
    console.log('👤 Creating initial data...');
    await createInitialData();
    
    console.log('');
    
    // Create super admin user
    console.log('👤 Creating super administrator...');
    await createSuperAdminUser();
    
    console.log('');
    console.log('===================================');
    console.log('✅ Database initialization complete!');
    console.log('===================================');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  checkTablesExist,
  createSuperAdminUser
};


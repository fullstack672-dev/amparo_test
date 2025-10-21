#!/bin/bash

# Database Initialization Script for PJF_Amparos
# This script runs when the SQL Server container starts for the first time

echo "🔄 Waiting for SQL Server to start..."
sleep 30s

echo "📊 Creating PJF_Amparos database..."

# Create database if it doesn't exist
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PJF_Amparos')
BEGIN
    CREATE DATABASE PJF_Amparos;
    PRINT '✅ Database PJF_Amparos created successfully';
END
ELSE
BEGIN
    PRINT '✅ Database PJF_Amparos already exists';
END
"

echo "📋 Executing schema script..."

# Execute the schema script
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -i /docker-entrypoint-initdb.d/schema.sql

echo "👤 Creating initial data..."

# Expand Clave column for bcrypt hashes
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
ALTER TABLE Usuarios ALTER COLUMN Clave VARCHAR(255);
PRINT '✅ Usuarios.Clave column expanded to VARCHAR(255)';
"

# Create initial data
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
-- Create default district
IF NOT EXISTS (SELECT * FROM Cat_Distritos WHERE IdDistrito = 1)
BEGIN
    INSERT INTO Cat_Distritos (IdDistrito, Distrito, Nombre, Tipo, Eliminado) 
    VALUES (1, 'ADM', 'Administración Central', 'A', 0);
    PRINT '✅ Default district created';
END

-- Create admin profile
IF NOT EXISTS (SELECT * FROM Cat_Perfil WHERE id_perfil = 1)
BEGIN
    SET IDENTITY_INSERT Cat_Perfil ON;
    INSERT INTO Cat_Perfil (id_perfil, Nombre, Eliminado) VALUES (1, 'Administrador', 0);
    SET IDENTITY_INSERT Cat_Perfil OFF;
    PRINT '✅ Admin profile created';
END

-- Create default juzgado
IF NOT EXISTS (SELECT * FROM Cat_Juzgados WHERE organo_impartidor_justicia = 1)
BEGIN
    INSERT INTO Cat_Juzgados (IdJuzgadoPJHGO, Clave, Nombre, TipoJuicio, IdDistrito, organo_impartidor_justicia, Correo, Eliminado) 
    VALUES (1, 'ADM', 'Administración Central', 'A', 1, 1, 'admin@admin.com', 0);
    PRINT '✅ Default juzgado created';
END

-- Create super admin user
IF NOT EXISTS (SELECT * FROM Usuarios WHERE Correo = 'admin@admin.com')
BEGIN
    INSERT INTO Usuarios (organo_impartidor_justicia, Nombre, APaterno, AMaterno, Usuario, Correo, Clave, Telefono, Extensión, Estado, id_perfil, Eliminado)
    VALUES (1, 'Super', 'Administrador', 'Sistema', 'admin', 'admin@admin.com', '\$2a\$12\$wicihN6nWQ9sg0BwlQ5NOOD646fdHdTYx.fdG2okOo4ktvLVi2BMy', '0000000000', '0000', 'A', 1, 0);
    PRINT '✅ Super admin user created';
    PRINT '   Email: admin@admin.com';
    PRINT '   Password: admin123';
END
"

echo "✅ Database initialization complete!"


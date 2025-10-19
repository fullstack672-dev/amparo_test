const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database to check current status
    const { getPool, sql } = require('../config/database');
    const pool = getPool();
    
    const userResult = await pool.request()
      .input('IdUsuario', sql.Int, decoded.userId)
      .query(`
        SELECT u.*, p.Nombre as perfil_nombre 
        FROM Usuarios u 
        LEFT JOIN Cat_Perfil p ON u.id_perfil = p.id_perfil 
        WHERE u.IdUsuario = @IdUsuario AND u.Estado = 'A' AND u.Eliminado = 0
      `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado o inactivo' 
      });
    }

    const user = userResult.recordset[0];
    
    // Check if user has admin privileges
    // Assuming profile ID 1 is admin, or check by profile name
    const isAdmin = user.id_perfil === 1 || 
                   user.perfil_nombre?.toLowerCase().includes('admin') ||
                   user.perfil_nombre?.toLowerCase().includes('administrador');

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren privilegios de administrador' 
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

module.exports = adminAuth;

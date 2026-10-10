import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'construction_realestate_jwt_secret_key_2026'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    // If no token, allow optional access or attach empty user
    req.user = null
    return next()
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next()
  })
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication token required or session expired.' })
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user || String(req.user.role).toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin privileges required to access this resource.' })
  }
  next()
}

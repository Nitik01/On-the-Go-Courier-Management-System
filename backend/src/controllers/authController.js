const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const authController = {
  // Register Customer or Courier
  async register(req, res, next) {
    try {
      const {
        full_name,
        email,
        password,
        role = 'customer',
        phone,
        address,
        city,
        postal_code,
        vehicle_type,
        vehicle_plate,
        license_number,
      } = req.body;

      // Check if email already exists
      const existingUser = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insert User
      const userResult = await db.query(
        `INSERT INTO users (full_name, email, password_hash, role, phone, address, city, postal_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, full_name, email, role, phone, address, city, postal_code, created_at`,
        [full_name.trim(), email.trim().toLowerCase(), password_hash, role, phone, address, city, postal_code]
      );

      const newUser = userResult.rows[0];

      // If registered as a courier, create corresponding courier profile
      if (role === 'courier') {
        await db.query(
          `INSERT INTO couriers (user_id, vehicle_type, vehicle_plate, license_number, is_available)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [
            newUser.id,
            vehicle_type || 'Motorcycle',
            vehicle_plate || 'TBD-001',
            license_number || 'LIC-TBD',
          ]
        );
      }

      const token = createToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        data: {
          user: newUser,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.',
        });
      }

      // Find user by email
      const result = await db.query(
        'SELECT id, full_name, email, password_hash, role, phone, address, city, postal_code, is_active FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Extra courier details if user is courier
      let courierDetails = null;
      if (user.role === 'courier') {
        const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [user.id]);
        if (courierRes.rows.length > 0) {
          courierDetails = courierRes.rows[0];
        }
      }

      const token = createToken(user);
      delete user.password_hash;

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        data: {
          user: {
            ...user,
            courier: courierDetails,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get current authenticated user profile
  async getMe(req, res, next) {
    try {
      const result = await db.query(
        'SELECT id, full_name, email, role, phone, address, city, postal_code, is_active, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = result.rows[0];
      let courierDetails = null;

      if (user.role === 'courier') {
        const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [user.id]);
        if (courierRes.rows.length > 0) {
          courierDetails = courierRes.rows[0];
        }
      }

      return res.json({
        success: true,
        data: {
          user: {
            ...user,
            courier: courierDetails,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Update Profile
  async updateProfile(req, res, next) {
    try {
      const { full_name, phone, address, city, postal_code } = req.body;
      const result = await db.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             address = COALESCE($3, address),
             city = COALESCE($4, city),
             postal_code = COALESCE($5, postal_code),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, full_name, email, role, phone, address, city, postal_code`,
        [full_name, phone, address, city, postal_code, req.user.id]
      );

      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        data: { user: result.rows[0] },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;

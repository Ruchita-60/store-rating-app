import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    // Breakdown by role
    const [roleCounts] = await pool.query(
      'SELECT role, COUNT(*) AS count FROM users GROUP BY role'
    );
    const breakdown = { admin: 0, user: 0, store_owner: 0 };
    roleCounts.forEach((r) => {
      breakdown[r.role] = r.count;
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        breakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics.',
      error: error.message,
    });
  }
};

// @desc    Get all users with search, role filter, and sorting
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { search = '', role = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const allowedSortFields = ['id', 'name', 'email', 'address', 'role', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = 'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (search.trim()) {
      query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role && ['admin', 'user', 'store_owner'].includes(role)) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ` ORDER BY ${validSortBy} ${validSortOrder}`;

    const [users] = await pool.query(query, params);

    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
};

// @desc    Get single user details by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details.',
      error: error.message,
    });
  }
};

// @desc    Create a user (Admin, Store Owner, or Normal User)
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!role || !['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, user, or store_owner.',
      });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), hashedPassword, address.trim(), role]
    );

    return res.status(201).json({
      success: true,
      message: `User created successfully with role '${role}'.`,
      data: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        role,
      },
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
      error: error.message,
    });
  }
};

// @desc    Get all stores with average rating, total ratings, owner details, search & sort
// @route   GET /api/admin/stores
// @access  Private (Admin only)
export const getStores = async (req, res) => {
  try {
    const { search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const allowedSortFields = ['id', 'name', 'email', 'address', 'averageRating', 'totalRatings', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating,
        COUNT(r.id) AS totalRatings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      query += ' AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' GROUP BY s.id, u.name, u.email';

    // Handle order by computed or standard fields
    if (validSortBy === 'averageRating') {
      query += ` ORDER BY averageRating ${validSortOrder}, s.id DESC`;
    } else if (validSortBy === 'totalRatings') {
      query += ` ORDER BY totalRatings ${validSortOrder}, s.id DESC`;
    } else {
      query += ` ORDER BY s.${validSortBy} ${validSortOrder}`;
    }

    const [stores] = await pool.query(query, params);

    return res.json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    console.error('Error fetching stores for admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stores.',
      error: error.message,
    });
  }
};

// @desc    Add a new store
// @route   POST /api/admin/stores
// @access  Private (Admin only)
export const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if store with same email exists
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      });
    }

    // If owner_id provided, verify that the user exists and has store_owner role
    let validatedOwnerId = null;
    if (owner_id) {
      const [ownerRows] = await pool.query(
        'SELECT id, role FROM users WHERE id = ?',
        [owner_id]
      );
      if (ownerRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected store owner does not exist.',
        });
      }
      if (ownerRows[0].role !== 'store_owner') {
        return res.status(400).json({
          success: false,
          message: 'The selected user is not registered with role store_owner.',
        });
      }
      validatedOwnerId = owner_id;
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), address.trim(), validatedOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        owner_id: validatedOwnerId,
      },
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store.',
      error: error.message,
    });
  }
};

// @desc    Get all ratings across stores (view store ratings)
// @route   GET /api/admin/ratings
// @access  Private (Admin only)
export const getAllRatings = async (req, res) => {
  try {
    const { storeId, userId, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        s.id AS store_id,
        s.name AS store_name,
        s.email AS store_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (storeId) {
      query += ' AND r.store_id = ?';
      params.push(storeId);
    }

    if (userId) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }

    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY r.${sortBy === 'rating' ? 'rating' : 'created_at'} ${validSortOrder}`;

    const [ratings] = await pool.query(query, params);

    return res.json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    console.error('Error fetching ratings for admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings.',
      error: error.message,
    });
  }
};

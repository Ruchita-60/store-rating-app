import pool from '../config/db.js';

// @desc    Get all stores for normal user with overall average rating and user's own rating
// @route   GET /api/user/stores
// @access  Private (User/Admin)
export const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'address', 'averageRating', 'myRating'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(all_r.rating), 2), 0) AS averageRating,
        COUNT(all_r.id) AS totalRatings,
        MAX(my_r.rating) AS myRating,
        MAX(my_r.updated_at) AS myRatedAt
      FROM stores s
      LEFT JOIN ratings all_r ON s.id = all_r.store_id
      LEFT JOIN ratings my_r ON s.id = my_r.store_id AND my_r.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (search.trim()) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' GROUP BY s.id';

    if (validSortBy === 'averageRating') {
      query += ` ORDER BY averageRating ${validSortOrder}, s.name ASC`;
    } else if (validSortBy === 'myRating') {
      query += ` ORDER BY myRating ${validSortOrder}, s.name ASC`;
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
    console.error('Error fetching stores for user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores.',
      error: error.message,
    });
  }
};

// @desc    Submit or update a rating for a store
// @route   POST /api/user/ratings
// @access  Private (User only)
export const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required.',
      });
    }

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    // Check if store exists
    const [store] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (store.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Insert or Update rating on duplicate key (unique index on user_id, store_id)
    const [result] = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, ratingVal]
    );

    const isUpdate = result.affectedRows === 2; // 1 for insert, 2 for update in MySQL

    // Fetch updated store stats
    const [[{ averageRating, totalRatings }]] = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating), 2), 0) AS averageRating, COUNT(*) AS totalRatings 
       FROM ratings WHERE store_id = ?`,
      [storeId]
    );

    return res.json({
      success: true,
      message: isUpdate
        ? 'Your rating has been updated successfully!'
        : 'Thank you! Your rating has been submitted successfully.',
      data: {
        storeId,
        userRating: ratingVal,
        averageRating,
        totalRatings,
        isUpdate,
      },
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating.',
      error: error.message,
    });
  }
};

// @desc    Get user's own submitted ratings
// @route   GET /api/user/my-ratings
// @access  Private (User only)
export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [ratings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id AS store_id,
        s.name AS store_name,
        s.email AS store_email,
        s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your ratings.',
      error: error.message,
    });
  }
};

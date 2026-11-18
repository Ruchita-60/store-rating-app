import pool from '../config/db.js';

// @desc    Get store owner dashboard data: their store, average rating, and list of user ratings
// @route   GET /api/store-owner/dashboard
// @access  Private (Store Owner only)
export const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store assigned to this owner
    const [stores] = await pool.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store is currently associated with your account. Please contact the administrator.',
        store: null,
        ratings: [],
        stats: {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    const store = stores[0];

    // Get list of ratings with user's name and submitted rating
    const [ratings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    // Calculate rating distribution and average
    let totalScore = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    ratings.forEach((r) => {
      totalScore += r.rating;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(2)) : 0;

    return res.json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        created_at: store.created_at,
      },
      stats: {
        averageRating,
        totalRatings,
        ratingDistribution: distribution,
      },
      ratings,
    });
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store owner dashboard.',
      error: error.message,
    });
  }
};

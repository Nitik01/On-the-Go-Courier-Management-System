const db = require('../config/db');

const adminController = {
  // Operational KPIs & High-Level Metrics
  async getDashboardStats(req, res, next) {
    try {
      // Total orders
      const totalOrdersRes = await db.query('SELECT COUNT(*) as count FROM orders');
      const totalOrders = parseInt(totalOrdersRes.rows[0].count, 10);

      // Pending orders
      const pendingRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
      const pendingOrders = parseInt(pendingRes.rows[0].count, 10);

      // Active deliveries (assigned, picked_up, in_transit, out_for_delivery)
      const activeRes = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE status IN ('assigned', 'picked_up', 'in_transit', 'out_for_delivery')"
      );
      const activeOrders = parseInt(activeRes.rows[0].count, 10);

      // Delivered orders
      const deliveredRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'");
      const deliveredOrders = parseInt(deliveredRes.rows[0].count, 10);

      // Total Revenue
      const revenueRes = await db.query('SELECT COALESCE(SUM(total_price), 0) as total FROM orders');
      const totalRevenue = parseFloat(revenueRes.rows[0].total);

      // Total users count by role
      const usersRes = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
          COUNT(CASE WHEN role = 'courier' THEN 1 END) as total_couriers
        FROM users
      `);

      // Active couriers currently available
      const couriersRes = await db.query(`
        SELECT 
          COUNT(*) as total_fleet,
          COUNT(CASE WHEN is_available = 1 OR is_available = TRUE THEN 1 END) as available_couriers
        FROM couriers
      `);

      // Delivery success rate
      const completedOrCancelled = deliveredOrders + (await db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'cancelled'")).rows[0].c;
      const successRate = totalOrders > 0 ? Math.round((deliveredOrders / Math.max(1, totalOrders)) * 100) : 100;

      return res.json({
        success: true,
        data: {
          metrics: {
            totalOrders,
            pendingOrders,
            activeOrders,
            deliveredOrders,
            totalRevenue,
            successRate,
            totalCustomers: parseInt(usersRes.rows[0].total_customers, 10),
            totalCouriers: parseInt(usersRes.rows[0].total_couriers, 10),
            availableCouriers: parseInt(couriersRes.rows[0].available_couriers, 10),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Analytics & Distribution
  async getAnalytics(req, res, next) {
    try {
      // Status breakdown
      const statusRes = await db.query(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
        FROM orders
        GROUP BY status
      `);

      // Priority breakdown
      const priorityRes = await db.query(`
        SELECT priority, COUNT(*) as count
        FROM orders
        GROUP BY priority
      `);

      // Parcel type breakdown
      const typeRes = await db.query(`
        SELECT parcel_type, COUNT(*) as count
        FROM orders
        GROUP BY parcel_type
      `);

      // Recent 7-day volume simulation / query
      const dailyRes = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders_count,
          COALESCE(SUM(total_price), 0) as daily_revenue
        FROM orders
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
      `);

      return res.json({
        success: true,
        data: {
          byStatus: statusRes.rows,
          byPriority: priorityRes.rows,
          byParcelType: typeRes.rows,
          dailyVolume: dailyRes.rows,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // View all orders with rich joins and filtering
  async getAllOrders(req, res, next) {
    try {
      const { status, priority, courier_id, search, limit = 50, offset = 0 } = req.query;

      let queryText = `
        SELECT 
          o.*,
          u_cust.full_name AS customer_name,
          u_cust.email AS customer_email,
          u_cust.phone AS customer_phone,
          u_cour.full_name AS courier_name,
          u_cour.phone AS courier_phone,
          c.vehicle_type,
          c.vehicle_plate,
          df.rating AS feedback_rating
        FROM orders o
        INNER JOIN users u_cust ON o.customer_id = u_cust.id
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users u_cour ON c.user_id = u_cour.id
        LEFT JOIN delivery_feedback df ON df.order_id = o.id
        WHERE 1=1
      `;
      const queryParams = [];

      if (status && status !== 'all') {
        queryParams.push(status);
        queryText += ` AND o.status = $${queryParams.length}`;
      }

      if (priority && priority !== 'all') {
        queryParams.push(priority);
        queryText += ` AND o.priority = $${queryParams.length}`;
      }

      if (courier_id && courier_id !== 'all') {
        queryParams.push(parseInt(courier_id, 10));
        queryText += ` AND o.courier_id = $${queryParams.length}`;
      }

      if (search && search.trim()) {
        queryParams.push(`%${search.trim().toLowerCase()}%`);
        queryText += ` AND (
          LOWER(o.tracking_number) LIKE $${queryParams.length} OR
          LOWER(u_cust.full_name) LIKE $${queryParams.length} OR
          LOWER(o.delivery_name) LIKE $${queryParams.length} OR
          LOWER(o.delivery_city) LIKE $${queryParams.length}
        )`;
      }

      queryText += ' ORDER BY o.created_at DESC';

      const result = await db.query(queryText, queryParams);

      return res.json({
        success: true,
        data: {
          orders: result.rows,
          total: result.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Manual or automatic assignment of order to courier
  async assignCourier(req, res, next) {
    try {
      const { orderId } = req.params;
      const { courier_id } = req.body;

      if (!courier_id) {
        return res.status(400).json({ success: false, message: 'Courier ID is required.' });
      }

      // Check courier exists
      const courierRes = await db.query(
        `SELECT c.*, u.full_name, u.phone 
         FROM couriers c 
         INNER JOIN users u ON c.user_id = u.id 
         WHERE c.id = $1`,
        [courier_id]
      );

      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier not found.' });
      }

      const courier = courierRes.rows[0];

      // Check order
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];
      const newStatus = order.status === 'pending' ? 'assigned' : order.status;

      // Update order
      await db.query(
        `UPDATE orders
         SET courier_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [courier_id, newStatus, orderId]
      );

      // Record tracking event
      await db.query(
        `INSERT INTO order_tracking_events (order_id, status, location, notes, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          newStatus,
          `${courier.current_city} Hub`,
          `Order assigned to courier ${courier.full_name} (${courier.vehicle_type} - ${courier.vehicle_plate}) by Administrator.`,
          req.user.id,
        ]
      );

      return res.json({
        success: true,
        message: `Order successfully assigned to ${courier.full_name}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  // Fleet management: Couriers list with active workload
  async getAllCouriers(req, res, next) {
    try {
      const queryText = `
        SELECT 
          c.id,
          c.user_id,
          u.full_name,
          u.email,
          u.phone,
          c.vehicle_type,
          c.vehicle_plate,
          c.license_number,
          c.is_available,
          c.current_city,
          c.rating,
          c.total_deliveries,
          COUNT(CASE WHEN o.status IN ('assigned', 'picked_up', 'in_transit', 'out_for_delivery') THEN 1 END) AS active_load
        FROM couriers c
        INNER JOIN users u ON c.user_id = u.id
        LEFT JOIN orders o ON o.courier_id = c.id
        GROUP BY c.id, c.user_id, u.full_name, u.email, u.phone, c.vehicle_type, c.vehicle_plate, c.license_number, c.is_available, c.current_city, c.rating, c.total_deliveries
        ORDER BY c.rating DESC, c.total_deliveries DESC
      `;

      const result = await db.query(queryText);

      return res.json({
        success: true,
        data: {
          couriers: result.rows,
          count: result.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // User management: view and toggle users
  async getAllUsers(req, res, next) {
    try {
      const { role, search } = req.query;

      let queryText = `
        SELECT 
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.phone,
          u.city,
          u.is_active,
          u.created_at,
          COUNT(o.id) as orders_count
        FROM users u
        LEFT JOIN orders o ON o.customer_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (role && role !== 'all') {
        params.push(role);
        queryText += ` AND u.role = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        queryText += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
      }

      queryText += ' GROUP BY u.id, u.full_name, u.email, u.role, u.phone, u.city, u.is_active, u.created_at ORDER BY u.created_at DESC';

      const result = await db.query(queryText, params);

      return res.json({
        success: true,
        data: {
          users: result.rows,
          count: result.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Toggle user active status
  async toggleUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const userRes = await db.query('SELECT id, is_active, role FROM users WHERE id = $1', [userId]);

      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = userRes.rows[0];
      if (user.role === 'admin' && user.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
      }

      const newStatus = user.is_active ? 0 : 1;
      await db.query('UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, userId]);

      return res.json({
        success: true,
        message: `User account ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },

  // Summary reports data
  async getSummaryReports(req, res, next) {
    try {
      // Deliveries by status
      const statusSummary = await db.query(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total_amount
        FROM orders
        GROUP BY status
      `);

      // Top couriers by deliveries
      const courierRankings = await db.query(`
        SELECT 
          c.id,
          u.full_name,
          c.vehicle_type,
          c.rating,
          c.total_deliveries,
          COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_price ELSE 0 END), 0) as delivered_revenue
        FROM couriers c
        INNER JOIN users u ON c.user_id = u.id
        LEFT JOIN orders o ON o.courier_id = c.id
        GROUP BY c.id, u.full_name, c.vehicle_type, c.rating, c.total_deliveries
        ORDER BY c.total_deliveries DESC
        LIMIT 10
      `);

      return res.json({
        success: true,
        data: {
          byStatus: statusSummary.rows,
          topCouriers: courierRankings.rows,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;

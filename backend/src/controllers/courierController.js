const db = require('../config/db');

const courierController = {
  // Get deliveries assigned to the logged-in courier
  async getAssignedDeliveries(req, res, next) {
    try {
      const userId = req.user.id;

      // Find courier profile ID
      const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [userId]);
      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier profile not found for this user.' });
      }

      const courier = courierRes.rows[0];
      const { status } = req.query;

      let queryText = `
        SELECT 
          o.*,
          u_cust.full_name AS customer_name,
          u_cust.email AS customer_email,
          u_cust.phone AS customer_phone
        FROM orders o
        INNER JOIN users u_cust ON o.customer_id = u_cust.id
        WHERE o.courier_id = $1
      `;
      const queryParams = [courier.id];

      if (status === 'active') {
        queryText += " AND o.status IN ('assigned', 'picked_up', 'in_transit', 'out_for_delivery')";
      } else if (status === 'delivered') {
        queryText += " AND o.status = 'delivered'";
      } else if (status && status !== 'all') {
        queryParams.push(status);
        queryText += ` AND o.status = $${queryParams.length}`;
      }

      queryText += ' ORDER BY o.created_at DESC';

      const ordersRes = await db.query(queryText, queryParams);

      return res.json({
        success: true,
        data: {
          courier,
          deliveries: ordersRes.rows,
          count: ordersRes.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get available/unassigned deliveries that can be picked up
  async getAvailableDeliveries(req, res, next) {
    try {
      const queryText = `
        SELECT 
          o.*,
          u_cust.full_name AS customer_name,
          u_cust.phone AS customer_phone
        FROM orders o
        INNER JOIN users u_cust ON o.customer_id = u_cust.id
        WHERE o.status = 'pending' AND o.courier_id IS NULL
        ORDER BY o.created_at ASC
      `;

      const result = await db.query(queryText);

      return res.json({
        success: true,
        data: {
          deliveries: result.rows,
          count: result.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Courier accepts an unassigned delivery
  async acceptDelivery(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [userId]);
      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier profile not found.' });
      }
      const courier = courierRes.rows[0];

      // Check order
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];
      if (order.status !== 'pending' || order.courier_id !== null) {
        return res.status(400).json({
          success: false,
          message: 'This delivery has already been assigned or is no longer pending.',
        });
      }

      // Assign to courier
      await db.query(
        `UPDATE orders
         SET courier_id = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [courier.id, orderId]
      );

      // Log tracking event
      await db.query(
        `INSERT INTO order_tracking_events (order_id, status, location, notes, created_by_user_id)
         VALUES ($1, 'assigned', $2, $3, $4)`,
        [
          orderId,
          `${courier.current_city} Logistics Hub`,
          `Delivery accepted by courier ${req.user.full_name} (${courier.vehicle_type} ${courier.vehicle_plate}).`,
          userId,
        ]
      );

      return res.json({
        success: true,
        message: 'Delivery accepted successfully!',
      });
    } catch (err) {
      next(err);
    }
  },

  // Courier updates delivery status (Lifecycle: assigned -> picked_up -> in_transit -> out_for_delivery -> delivered)
  async updateDeliveryStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { status, location, notes, latitude, longitude } = req.body;

      const validStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [userId]);
      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier profile not found.' });
      }
      const courier = courierRes.rows[0];

      // Check order
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];

      // Must be assigned to this courier or user is admin
      if (req.user.role !== 'admin' && order.courier_id !== courier.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this delivery.',
        });
      }

      // Check valid progression
      const statusHierarchy = {
        pending: 0,
        assigned: 1,
        picked_up: 2,
        in_transit: 3,
        out_for_delivery: 4,
        delivered: 5,
        cancelled: 99,
      };

      if (statusHierarchy[status] < statusHierarchy[order.status]) {
        return res.status(400).json({
          success: false,
          message: `Cannot revert order status backwards from '${order.status}' to '${status}'.`,
        });
      }

      // Update order status
      const deliveredAtClause = status === 'delivered' ? ', delivered_at = CURRENT_TIMESTAMP' : '';
      await db.query(
        `UPDATE orders
         SET status = $1, updated_at = CURRENT_TIMESTAMP ${deliveredAtClause}
         WHERE id = $2`,
        [status, orderId]
      );

      // If delivered, increment courier's total_deliveries
      if (status === 'delivered') {
        await db.query(
          'UPDATE couriers SET total_deliveries = total_deliveries + 1 WHERE id = $1',
          [courier.id]
        );
      }

      // Record tracking event
      const eventLocation = location || (status === 'delivered' ? order.delivery_address : `${order.pickup_city} - Route Checkpoint`);
      const eventNotes = notes || `Status updated to ${status.replace(/_/g, ' ')} by courier ${req.user.full_name}.`;

      await db.query(
        `INSERT INTO order_tracking_events (order_id, status, location, notes, latitude, longitude, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, status, eventLocation, eventNotes, latitude || null, longitude || null, userId]
      );

      return res.json({
        success: true,
        message: `Order status successfully updated to '${status.replace(/_/g, ' ')}'.`,
      });
    } catch (err) {
      next(err);
    }
  },

  // Toggle courier availability
  async toggleAvailability(req, res, next) {
    try {
      const userId = req.user.id;
      const { is_available } = req.body;

      const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [userId]);
      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier profile not found.' });
      }

      const newStatus = is_available !== undefined ? is_available : !courierRes.rows[0].is_available;

      await db.query(
        'UPDATE couriers SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [newStatus ? 1 : 0, userId]
      );

      return res.json({
        success: true,
        message: `Courier availability updated to ${newStatus ? 'Online / Available' : 'Offline'}.`,
        data: { is_available: Boolean(newStatus) },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get Courier Profile & Dashboard Stats
  async getCourierProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const courierRes = await db.query('SELECT * FROM couriers WHERE user_id = $1', [userId]);
      if (courierRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Courier profile not found.' });
      }

      const courier = courierRes.rows[0];

      // Active orders
      const activeRes = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE courier_id = $1 AND status IN ('assigned', 'picked_up', 'in_transit', 'out_for_delivery')",
        [courier.id]
      );

      // Completed orders
      const completedRes = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE courier_id = $1 AND status = 'delivered'",
        [courier.id]
      );

      // Earnings generated
      const earningsRes = await db.query(
        "SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE courier_id = $1 AND status = 'delivered'",
        [courier.id]
      );

      return res.json({
        success: true,
        data: {
          courier,
          stats: {
            activeDeliveries: parseInt(activeRes.rows[0].count, 10),
            completedDeliveries: parseInt(completedRes.rows[0].count, 10),
            totalRevenueDelivered: parseFloat(earningsRes.rows[0].total),
            rating: courier.rating,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = courierController;

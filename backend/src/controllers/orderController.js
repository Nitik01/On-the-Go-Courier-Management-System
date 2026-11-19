const db = require('../config/db');
const { generateTrackingCode } = require('../utils/trackingCode');
const { calculateDeliveryPrice } = require('../utils/pricing');

const orderController = {
  // Customer books a parcel delivery
  async createOrder(req, res, next) {
    try {
      const customerId = req.user.id;
      const {
        parcel_type,
        weight_kg,
        dimensions,
        description,
        declared_value = 0.0,
        priority = 'standard',
        pickup_name,
        pickup_phone,
        pickup_address,
        pickup_city,
        pickup_postal_code,
        delivery_name,
        delivery_phone,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        delivery_instructions,
        payment_method = 'credit_card',
      } = req.body;

      // Calculate transparent price breakdown
      const { baseFee, weightFee, priorityFee, totalPrice } = calculateDeliveryPrice({
        parcelType: parcel_type,
        weightKg: weight_kg,
        priority,
      });

      // Generate unique tracking number
      let trackingNumber = generateTrackingCode();
      // Ensure uniqueness
      let exists = await db.query('SELECT id FROM orders WHERE tracking_number = $1', [trackingNumber]);
      while (exists.rows.length > 0) {
        trackingNumber = generateTrackingCode();
        exists = await db.query('SELECT id FROM orders WHERE tracking_number = $1', [trackingNumber]);
      }

      // Calculate estimated delivery based on priority
      const hoursToAdd = priority === 'overnight' ? 24 : priority === 'express' ? 48 : 96;

      const insertOrderSql = `
        INSERT INTO orders (
          tracking_number, customer_id, parcel_type, weight_kg, dimensions, description, declared_value, priority,
          pickup_name, pickup_phone, pickup_address, pickup_city, pickup_postal_code,
          delivery_name, delivery_phone, delivery_address, delivery_city, delivery_postal_code, delivery_instructions,
          base_fee, weight_fee, priority_fee, total_price, payment_status, payment_method, status,
          estimated_delivery
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, 'paid', $24, 'pending',
          datetime('now', '+${hoursToAdd} hours')
        )
        RETURNING *
      `;

      // In Postgres vs SQLite compatibility, let's pass parameters cleanly:
      const params = [
        trackingNumber,
        customerId,
        parcel_type,
        parseFloat(weight_kg),
        dimensions || 'Standard',
        description || '',
        parseFloat(declared_value) || 0.0,
        priority,
        pickup_name,
        pickup_phone,
        pickup_address,
        pickup_city,
        pickup_postal_code,
        delivery_name,
        delivery_phone,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        delivery_instructions || '',
        baseFee,
        weightFee,
        priorityFee,
        totalPrice,
        payment_method,
      ];

      const orderResult = await db.query(insertOrderSql, params);
      const newOrder = orderResult.rows[0];

      // Insert initial tracking event: 'pending'
      await db.query(
        `INSERT INTO order_tracking_events (order_id, status, location, notes, created_by_user_id)
         VALUES ($1, 'pending', $2, $3, $4)`,
        [
          newOrder.id,
          `${pickup_city} (Origin)`,
          'Shipment booking confirmed. Waiting for dispatch to courier.',
          customerId,
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Parcel delivery booked successfully!',
        data: {
          order: newOrder,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get customer orders with filtering
  async getMyOrders(req, res, next) {
    try {
      const customerId = req.user.id;
      const { status, search } = req.query;

      let queryText = `
        SELECT 
          o.*,
          u_cour.full_name AS courier_name,
          u_cour.phone AS courier_phone,
          c.vehicle_type,
          c.vehicle_plate,
          df.rating AS feedback_rating
        FROM orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users u_cour ON c.user_id = u_cour.id
        LEFT JOIN delivery_feedback df ON df.order_id = o.id
        WHERE o.customer_id = $1
      `;
      const queryParams = [customerId];

      if (status && status !== 'all') {
        queryParams.push(status);
        queryText += ` AND o.status = $${queryParams.length}`;
      }

      if (search && search.trim()) {
        queryParams.push(`%${search.trim().toLowerCase()}%`);
        queryText += ` AND (LOWER(o.tracking_number) LIKE $${queryParams.length} OR LOWER(o.delivery_name) LIKE $${queryParams.length} OR LOWER(o.delivery_city) LIKE $${queryParams.length})`;
      }

      queryText += ' ORDER BY o.created_at DESC';

      const result = await db.query(queryText, queryParams);

      return res.json({
        success: true,
        data: {
          orders: result.rows,
          count: result.rows.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Track an order by tracking number (Public or logged-in)
  async trackByNumber(req, res, next) {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        return res.status(400).json({ success: false, message: 'Tracking number is required.' });
      }

      const orderRes = await db.query(
        `SELECT 
          o.*,
          u_cust.full_name AS customer_name,
          u_cour.full_name AS courier_name,
          u_cour.phone AS courier_phone,
          c.vehicle_type,
          c.vehicle_plate,
          c.rating AS courier_rating
        FROM orders o
        INNER JOIN users u_cust ON o.customer_id = u_cust.id
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users u_cour ON c.user_id = u_cour.id
        WHERE LOWER(o.tracking_number) = LOWER($1)`,
        [trackingNumber.trim()]
      );

      if (orderRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No parcel found matching tracking code '${trackingNumber}'. Please verify your tracking number.`,
        });
      }

      const order = orderRes.rows[0];

      // Get tracking events history
      const eventsRes = await db.query(
        `SELECT 
          ote.*,
          u.full_name AS logged_by_name
        FROM order_tracking_events ote
        LEFT JOIN users u ON ote.created_by_user_id = u.id
        WHERE ote.order_id = $1
        ORDER BY ote.created_at ASC`,
        [order.id]
      );

      // Get feedback if exists
      const feedbackRes = await db.query(
        'SELECT rating, comments, created_at FROM delivery_feedback WHERE order_id = $1',
        [order.id]
      );

      return res.json({
        success: true,
        data: {
          order,
          timeline: eventsRes.rows,
          feedback: feedbackRes.rows[0] || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get order by ID (with authorization check)
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const orderRes = await db.query(
        `SELECT 
          o.*,
          u_cust.full_name AS customer_name,
          u_cust.email AS customer_email,
          u_cust.phone AS customer_phone,
          u_cour.full_name AS courier_name,
          u_cour.phone AS courier_phone,
          c.vehicle_type,
          c.vehicle_plate,
          c.rating AS courier_rating
        FROM orders o
        INNER JOIN users u_cust ON o.customer_id = u_cust.id
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users u_cour ON c.user_id = u_cour.id
        WHERE o.id = $1`,
        [id]
      );

      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];

      // Authorization check: customer can only view own order, unless admin or assigned courier
      if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
      }

      const eventsRes = await db.query(
        'SELECT * FROM order_tracking_events WHERE order_id = $1 ORDER BY created_at ASC',
        [id]
      );

      const feedbackRes = await db.query(
        'SELECT * FROM delivery_feedback WHERE order_id = $1',
        [id]
      );

      return res.json({
        success: true,
        data: {
          order,
          timeline: eventsRes.rows,
          feedback: feedbackRes.rows[0] || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Cancel order (Customer or Admin)
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = 'Cancelled by customer' } = req.body;

      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];

      if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
      }

      if (['in_transit', 'out_for_delivery', 'delivered'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an order that is already '${order.status}'. Please contact support.`,
        });
      }

      // Update order status
      await db.query(
        "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );

      // Add tracking event
      await db.query(
        `INSERT INTO order_tracking_events (order_id, status, location, notes, created_by_user_id)
         VALUES ($1, 'cancelled', $2, $3, $4)`,
        [id, order.pickup_city, `Order cancelled. Reason: ${reason}`, req.user.id]
      );

      return res.json({
        success: true,
        message: 'Order cancelled successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  // Submit Feedback / Review
  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body;
      const customerId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      }

      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const order = orderRes.rows[0];

      if (order.customer_id !== customerId) {
        return res.status(403).json({ success: false, message: 'You can only review your own orders.' });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'You can only submit feedback for delivered orders.' });
      }

      // Insert feedback
      const feedbackRes = await db.query(
        `INSERT INTO delivery_feedback (order_id, customer_id, courier_id, rating, comments)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, customerId, order.courier_id, parseInt(rating), comments || '']
      );

      // Recalculate courier rating if courier was assigned
      if (order.courier_id) {
        const avgRes = await db.query(
          'SELECT AVG(rating) as avg_rating FROM delivery_feedback WHERE courier_id = $1',
          [order.courier_id]
        );
        const newRating = Math.round((parseFloat(avgRes.rows[0].avg_rating) || 5.0) * 100) / 100;
        await db.query('UPDATE couriers SET rating = $1 WHERE id = $2', [newRating, order.courier_id]);
      }

      return res.status(201).json({
        success: true,
        message: 'Thank you for your delivery feedback!',
        data: { feedback: feedbackRes.rows[0] },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = orderController;

/**
 * Lightweight request validator for clean input sanitization & schema enforcement
 */
function validateRegistration(req, res, next) {
  const { full_name, email, password, role } = req.body;

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Full name is required (minimum 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (role && !['customer', 'courier', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified.' });
  }

  next();
}

function validateOrderBooking(req, res, next) {
  const {
    parcel_type,
    weight_kg,
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
  } = req.body;

  const validTypes = ['Document', 'Box/Parcel', 'Fragile/Glass', 'Electronics', 'Perishable', 'Heavy Cargo'];
  if (!parcel_type || !validTypes.includes(parcel_type)) {
    return res.status(400).json({ success: false, message: `Parcel type must be one of: ${validTypes.join(', ')}` });
  }

  const weight = parseFloat(weight_kg);
  if (isNaN(weight) || weight <= 0 || weight > 500) {
    return res.status(400).json({ success: false, message: 'Weight must be a positive number up to 500 kg.' });
  }

  if (!pickup_name || !pickup_phone || !pickup_address || !pickup_city || !pickup_postal_code) {
    return res.status(400).json({ success: false, message: 'All pickup details are required.' });
  }

  if (!delivery_name || !delivery_phone || !delivery_address || !delivery_city || !delivery_postal_code) {
    return res.status(400).json({ success: false, message: 'All delivery recipient details are required.' });
  }

  next();
}

module.exports = {
  validateRegistration,
  validateOrderBooking,
};

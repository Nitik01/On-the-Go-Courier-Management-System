/**
 * Pricing calculator for parcel bookings
 * Demonstrates business domain logic with transparent breakdown
 */
function calculateDeliveryPrice({ parcelType, weightKg, priority }) {
  const baseRates = {
    Document: 10.0,
    'Box/Parcel': 12.0,
    'Fragile/Glass': 15.0,
    Electronics: 15.0,
    Perishable: 15.0,
    'Heavy Cargo': 25.0,
  };

  const priorityFees = {
    standard: 0.0,
    express: 8.0,
    overnight: 15.0,
  };

  const baseFee = baseRates[parcelType] || 12.0;
  const weight = Math.max(0.1, parseFloat(weightKg) || 1.0);
  const weightFee = Math.round(weight * 2.0 * 100) / 100;
  const priorityFee = priorityFees[priority] || 0.0;
  const totalPrice = Math.round((baseFee + weightFee + priorityFee) * 100) / 100;

  return {
    baseFee,
    weightFee,
    priorityFee,
    totalPrice,
  };
}

module.exports = {
  calculateDeliveryPrice,
};

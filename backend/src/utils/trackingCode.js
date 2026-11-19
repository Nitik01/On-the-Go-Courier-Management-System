/**
 * Generates unique tracking code for parcels
 * Format: OTG-YYYYMM-XXXXX (e.g. OTG-202611-94812)
 */
function generateTrackingCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `OTG-${year}${month}-${random}`;
}

module.exports = {
  generateTrackingCode,
};

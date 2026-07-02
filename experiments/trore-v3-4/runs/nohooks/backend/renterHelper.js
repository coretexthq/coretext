const { queryGet } = require('./db');

/**
 * Helper utilities for the renter workflow, including quote calculations
 * and query parameter parsing.
 */

/**
 * Validates a date range format and logical order.
 * @param {string} startDateStr - YYYY-MM-DD start date
 * @param {string} endDateStr - YYYY-MM-DD end date
 * @returns {object} { valid: boolean, error?: string }
 */
function validateDateRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { valid: false, error: 'Missing start or end date' };
  }
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Strict YYYY-MM-DD format check
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(startDateStr) || !datePattern.test(endDateStr)) {
    return { valid: false, error: 'Dates must be in YYYY-MM-DD format' };
  }

  // Normalize dates to remove timezone variations for diff calculations
  const dStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  if (dStart >= dEnd) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  return { valid: true };
}

/**
 * Checks if a listing is active and if a date range overlaps with any existing availability blocks.
 * @param {number} listingId
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @param {boolean} checkActive - whether to check if listing is active
 * @returns {Promise<{available: boolean, errorType?: string, message?: string}>}
 */
async function checkListingAvailability(listingId, startDateStr, endDateStr, checkActive = false) {
  const dateVal = validateDateRange(startDateStr, endDateStr);
  if (!dateVal.valid) {
    return { available: false, errorType: 'Invalid Dates', message: dateVal.error };
  }
  
  const listing = await queryGet('SELECT is_active FROM listings WHERE id = ?', [listingId]);
  if (!listing) {
    return { available: false, errorType: 'Not Found', message: 'Listing not found' };
  }
  
  if (checkActive && listing.is_active !== 1) {
    return { available: false, errorType: 'Inactive Listing', message: 'Cannot book an inactive listing' };
  }
  
  const overlap = await queryGet(
    `SELECT 1 FROM availability_blocks 
     WHERE listing_id = ? AND start_date < ? AND end_date > ? LIMIT 1`,
    [listingId, endDateStr, startDateStr]
  );
  
  if (overlap) {
    return { available: false, errorType: 'Dates Unavailable', message: 'The selected date range overlaps with an existing blackout or booking' };
  }
  
  return { available: true };
}

/**
 * Calculates the total quote for a lodging stay.
 * @param {number} nightlyPrice - Price per night
 * @param {string} startDateStr - YYYY-MM-DD start date
 * @param {string} endDateStr - YYYY-MM-DD end date
 * @returns {object} Quote details or error message
 */
function calculateQuote(nightlyPrice, startDateStr, endDateStr) {
  const validation = validateDateRange(startDateStr, endDateStr);
  if (!validation.valid) {
    return { error: validation.error };
  }
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Normalize dates to remove timezone variations for diff calculations
  const dStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  const diffTime = dEnd - dStart;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const totalPrice = diffDays * nightlyPrice;
  return {
    nights: diffDays,
    nightlyPrice,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

/**
 * Parses and normalizes search query parameters.
 * @param {object} query - Express req.query object or URLSearchParams parsed object
 * @returns {object} Normalized search parameters
 */
function parseSearchParams(query) {
  const params = {};
  
  if (query.q) {
    params.q = String(query.q).trim();
  }
  if (query.district) {
    params.district = String(query.district).trim();
  }
  
  if (query.min_price !== undefined && query.min_price !== '') {
    const p = parseFloat(query.min_price);
    if (!isNaN(p) && p >= 0) params.min_price = p;
  }
  
  if (query.max_price !== undefined && query.max_price !== '') {
    const p = parseFloat(query.max_price);
    if (!isNaN(p) && p >= 0) params.max_price = p;
  }
  
  if (query.bedrooms !== undefined && query.bedrooms !== '') {
    const b = parseInt(query.bedrooms, 10);
    if (!isNaN(b) && b >= 0) params.bedrooms = b;
  }
  
  if (query.amenities) {
    if (Array.isArray(query.amenities)) {
      params.amenities = query.amenities.map(a => a.trim()).filter(Boolean);
    } else if (typeof query.amenities === 'string') {
      params.amenities = query.amenities.split(',')
        .map(a => a.trim())
        .filter(Boolean);
    }
  }
  
  if (query.start_date) params.start_date = String(query.start_date);
  if (query.end_date) params.end_date = String(query.end_date);
  
  if (query.sort) {
    params.sort = String(query.sort);
  } else {
    params.sort = 'relevance';
  }
  
  const page = parseInt(query.page, 10);
  params.page = !isNaN(page) && page > 0 ? page : 1;
  
  const limit = parseInt(query.limit, 10);
  params.limit = !isNaN(limit) && limit > 0 ? limit : 10;
  
  return params;
}

module.exports = {
  calculateQuote,
  parseSearchParams,
  validateDateRange,
  checkListingAvailability
};

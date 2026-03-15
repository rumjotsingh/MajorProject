/**
 * Production-level pagination middleware
 * Supports: page, limit, sort, filter
 */
export const paginate = (model) => {
  return async (req, res, next) => {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 items per page
      const skip = (page - 1) * limit;
      
      // Parse sort parameter (default: -createdAt)
      const sort = req.query.sort || '-createdAt';
      
      // Build query filter
      const filter = req.paginationFilter || {};
      
      // Count total documents
      const total = await model.countDocuments(filter);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      // Validate page number
      if (page > totalPages && totalPages > 0) {
        return res.status(400).json({
          success: false,
          message: `Page ${page} does not exist. Total pages: ${totalPages}`
        });
      }
      
      // Execute query with pagination
      const results = await model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(req.populateFields || '');
      
      // Attach paginated results to response
      res.paginatedResults = {
        success: true,
        data: {
          results,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
          }
        }
      };
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Pagination error',
        error: error.message
      });
    }
  };
};

/**
 * Set pagination filter
 */
export const setPaginationFilter = (filter) => {
  return (req, res, next) => {
    req.paginationFilter = typeof filter === 'function' ? filter(req) : filter;
    next();
  };
};

/**
 * Set populate fields
 */
export const setPopulateFields = (fields) => {
  return (req, res, next) => {
    req.populateFields = fields;
    next();
  };
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (req, res) => {
  if (res.paginatedResults) {
    res.status(200).json(res.paginatedResults);
  } else {
    res.status(500).json({
      success: false,
      message: 'Pagination results not found'
    });
  }
};

export default {
  paginate,
  setPaginationFilter,
  setPopulateFields,
  sendPaginatedResponse
};

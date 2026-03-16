import AuditLog from '../models/AuditLog.model.js';

export const createAuditLog = async (action, performedBy, performedByRole, targetUser, targetUserModel, targetId, details, metadata, req) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      performedByRole,
      targetUser,
      targetUserModel,
      targetId,
      details,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

export const auditLogMiddleware = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after successful response
    res.json = function(data) {
      // Only log if response was successful
      if (data.success) {
        createAuditLog(
          action,
          req.user.userId,
          req.user.role,
          req.params.id || req.params.instituteId || req.params.credentialId,
          null,
          req.params.id || req.params.instituteId || req.params.credentialId,
          `${action} performed`,
          { body: req.body, params: req.params },
          req
        ).catch(err => console.error('Audit log error:', err));
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

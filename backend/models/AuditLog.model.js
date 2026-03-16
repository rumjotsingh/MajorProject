import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'institute_approve',
      'institute_reject',
      'institute_suspend',
      'institute_delete',
      'learner_suspend',
      'learner_unsuspend',
      'learner_delete',
      'employer_approve',
      'employer_suspend',
      'employer_unsuspend',
      'employer_delete',
      'credential_verify',
      'credential_reject',
      'pathway_create',
      'pathway_update',
      'pathway_delete',
      'user_deactivate',
      'account_lock',
    ],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performedByRole: {
    type: String,
    enum: ['admin', 'institute', 'employer'],
    required: true,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetUserModel',
  },
  targetUserModel: {
    type: String,
    enum: ['User', 'Learner', 'Institute', 'Employer'],
  },
  targetId: {
    type: String,
  },
  details: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

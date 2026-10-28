// ✅ PATCHED: status enum + statusHistory + locked userId/jobId types preserved
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    candidate: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    // ✅ now enum-validated
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected'],
      default: 'Pending',
    },
    appliedAt: {
      type: String,
      required: true,
    },
    // ✅ NEW — tracks every status change
    statusHistory: [
      {
        status: String,
        changedBy: { type: String, default: 'system' },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'applications',
  }
);

export default mongoose.model('Application', applicationSchema);
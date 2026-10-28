// ✅ PATCHED: employerId now required + status + description added
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'Full Time',
    },
    salary: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    // ✅ description for the "About the role" section (currently hardcoded on frontend)
    description: {
      type: String,
      default: '',
    },
    // ✅ now required — set automatically from req.user.id on create
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userData',
      required: true,
    },
    // ✅ open / closed
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
    collection: 'jobs',
  }
);

export default mongoose.model('Job', jobSchema);
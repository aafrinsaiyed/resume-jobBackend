// ✅ PATCHED: Added profilePic support (for Cloudinary integration)
//    Also kept personalInfo → personal, experience → experiences fixes
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    personal: {
      // iske andar { fullName, email, profilePic, ... } sab aayega
      type: Object,
      default: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        jobTitle: '',
        profilePic: '', // 👈 Cloudinary se aayi hui image URL yahan save hogi
      },
    },
    summary: {
      type: String,
      default: '',
    },
    education: {
      type: Array,
      default: [],
    },
    experiences: {
      type: Array,
      default: [],
    },
    skills: {
      type: Array,
      default: [],
    },
    projects: {
      type: Array,
      default: [],
    },
    certifications: {
      type: Array,
      default: [],
    },
    templateId: {
      type: String,
      default: '1',
    },
  },
  {
    timestamps: true,
    collection: 'resumes',
  }
);

export default mongoose.model('Resume', resumeSchema);
// model/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin', 'recruiter'], default: 'user' },
    company: { type: String, default: '' },
    
    // 👇 Naye Fields
    profilePic: { type: String, default: '' },    // User ke liye
    companyLogo: { type: String, default: '' },  // Recruiter ke liye
  },
  { timestamps: true, collection: 'userdata' }
);

export default mongoose.model('userData', userSchema);
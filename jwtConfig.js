import crypto from 'crypto';
import 'dotenv/config'; // .env file padhne ke liye zaroori hai

// ✅ Yahan hum ek FIXED secret string use kar rahe hain jo .env se aayegi.
// Agar .env mein nahi hai, toh crypto se ek fallback string banayenge.
const secretKey = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

if (!secretKey) {
  throw new Error(
    "❌ JWT_SECRET is missing. Please add JWT_SECRET=your_secret_string in .env file."
  );
}

export default secretKey;
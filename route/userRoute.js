// ✅ PATCHED: added requireRole for admin-only + createRecruiter route
import express from 'express';
import {
  addUser,
  getUser,
  getSingleUser,
  updateUser,
  deleteUSer,
  login,
  createRecruiter,
} from '../controllers/userDataController.js';
import AuthanticateToken, { requireRole } from '../utils/authmiddleware.js';

const router = express.Router();

router.post('/api/add-user', addUser);
router.post('/api/login', login);

// Admin-only
router.get('/api/get-user', AuthanticateToken, requireRole('admin'), getUser);
router.delete('/api/delete-user/:uid', AuthanticateToken, requireRole('admin'), deleteUSer);
router.post('/api/admin/create-recruiter', AuthanticateToken, requireRole('admin'), createRecruiter);

// Any logged-in user
router.get('/api/get-singleuser/:uid', AuthanticateToken, getSingleUser);
router.put('/api/update-user/:uid', AuthanticateToken, updateUser);

export default router;
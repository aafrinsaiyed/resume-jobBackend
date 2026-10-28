// ✅ PATCHED: added requireRole — job creation/update/delete now restricted to admin OR recruiter
import express from 'express';
import {
  addJob,
  getJobs,
  getEmployerJobs,
  getSingleJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import AuthanticateToken, { requireRole } from '../utils/authmiddleware.js';

const router = express.Router();

// Public
router.get('/api/get-jobs', getJobs);
router.get('/api/get-job/:id', getSingleJob);

// Admin + Recruiter only
router.post('/api/add-job', AuthanticateToken, requireRole('admin', 'recruiter'), addJob);
router.put('/api/update-job/:id', AuthanticateToken, requireRole('admin', 'recruiter'), updateJob);
router.delete('/api/delete-job/:id', AuthanticateToken, requireRole('admin', 'recruiter'), deleteJob);

// Any logged-in user (self-scope enforced inside controller)
router.get('/api/employer-jobs/:employerId', AuthanticateToken, getEmployerJobs);

export default router;
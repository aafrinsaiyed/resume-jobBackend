// ✅ PATCHED: auth added everywhere + new scoped endpoints
import express from 'express';
import {
  applyJob,
  getApplications,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import AuthanticateToken, { requireRole } from '../utils/authmiddleware.js';

const router = express.Router();

// User
router.post('/api/apply-job', AuthanticateToken, applyJob);
router.get('/api/my-applications', AuthanticateToken, getMyApplications);

// Admin
router.get('/api/get-applications', AuthanticateToken, requireRole('admin'), getApplications);
router.delete('/api/delete-application/:id', AuthanticateToken, requireRole('admin'), deleteApplication);

// Recruiter (owner) or Admin
router.get('/api/job-applicants/:jobId', AuthanticateToken, requireRole('admin', 'recruiter'), getJobApplicants);
router.put('/api/update-application/:id', AuthanticateToken, requireRole('admin', 'recruiter'), updateApplicationStatus);

export default router;
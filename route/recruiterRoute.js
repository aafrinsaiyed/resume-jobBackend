// ✅ NEW: Recruiter-only routes
import express from 'express';
import AuthanticateToken, { requireRole } from '../utils/authmiddleware.js';
import {
  getDashboardStats,
  getMyJobs,
  createJob,
  updateMyJob,
  deleteMyJob,
  getJobApplicants,
  getAllMyApplicants,
  updateApplicantStatus,
  getCandidateResume,
} from '../controllers/recruiterController.js';

const router = express.Router();

// All routes below require recruiter role
router.use(AuthanticateToken, requireRole('recruiter'));

// Dashboard
router.get('/api/recruiter/dashboard', getDashboardStats);

// Jobs
router.get('/api/recruiter/jobs', getMyJobs);
router.post('/api/recruiter/jobs', createJob);
router.put('/api/recruiter/jobs/:id', updateMyJob);
router.delete('/api/recruiter/jobs/:id', deleteMyJob);

// Applicants
router.get('/api/recruiter/applicants', getAllMyApplicants);
router.get('/api/recruiter/jobs/:jobId/applicants', getJobApplicants);
router.patch('/api/recruiter/applications/:id/status', updateApplicantStatus);

// Candidate resume
router.get('/api/recruiter/candidates/:userId/resume', getCandidateResume);

export default router;
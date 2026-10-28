// ✅ PATCHED: auth added
import express from 'express';
import { saveResume, getResume, deleteResume } from '../controllers/resumeController.js';
import AuthanticateToken from '../utils/authmiddleware.js';

const router = express.Router();

router.post('/api/save-resume', AuthanticateToken, saveResume);
router.get('/api/get-resume/:userId', AuthanticateToken, getResume);
router.delete('/api/delete-resume/:userId', AuthanticateToken, deleteResume);

export default router;
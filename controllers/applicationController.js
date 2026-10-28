// ✅ PATCHED:
//  - applyJob forces status: "Pending" (anti-tamper) + sets userId from JWT
//  - updateApplicationStatus now records statusHistory + checks ownership
//  - deleteApplication checks ownership
//  - NEW: getMyApplications (for the user's own application list)
//  - NEW: getJobApplicants (scoped for recruiters)
import Application from '../model/application.js';
import Job from '../model/job.js';

// 1. Apply to job
export const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const newApp = await Application.create({
      userId: req.user.id, // ✅ from JWT, not body
      candidate: req.body.candidate || req.user.email,
      jobId: req.body.jobId,
      jobTitle: job.title,
      company: job.company,
      status: 'Pending', // ✅ forced
      appliedAt: new Date().toLocaleDateString(),
      statusHistory: [
        { status: 'Pending', changedBy: req.user.id, note: 'Application submitted' },
      ],
    });

    res.status(200).json({ message: 'Application submitted successfully', data: newApp });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 2. Get ALL applications (admin only — used by admin panel)
export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Applications fetched successfully', data: apps });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 3. Get MY applications (user panel)
export const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Applications fetched successfully', data: apps });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 4. Get applicants for a specific job (recruiter/admin — ownership required)
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role !== 'admin' && String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this job' });
    }

    const apps = await Application.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Applicants fetched successfully', data: apps });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 5. Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    // ownership check for recruiters
    if (req.user.role !== 'admin') {
      const job = await Job.findById(app.jobId);
      if (!job || String(job.employerId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const { status, note } = req.body;
    const allowed = ['Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (status) app.status = status;
    if (status) {
      app.statusHistory.push({
        status,
        changedBy: req.user.id,
        note: note || '',
      });
    }

    await app.save();
    res.status(200).json({ message: 'Status updated successfully', data: app });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 6. Delete application (admin only)
export const deleteApplication = async (req, res) => {
  try {
    const deletedApp = await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application deleted successfully', data: deletedApp });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
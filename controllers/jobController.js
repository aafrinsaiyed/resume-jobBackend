// ✅ PATCHED:
//  - addJob now sets employerId from req.user.id (no longer trusted from body)
//  - updateJob/deleteJob now check ownership OR admin role
//  - getEmployerJobs unchanged (already scoped correctly)
import Job from '../model/job.js';
import Application from '../model/application.js';

// 1. Add Job
export const addJob = async (req, res) => {
  try {
    const jobPayload = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      type: req.body.type,
      salary: req.body.salary,
      skills: req.body.skills,
      description: req.body.description || '',
      employerId: req.user.id, // ✅ set from JWT, not from body
      status: req.body.status || 'open',
    };

    const newJob = await Job.create(jobPayload);
    res.status(200).json({ message: 'Job added successfully', data: newJob });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 2. Get All Jobs (public)
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Jobs fetched successfully', data: jobs });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 3. Get Jobs posted by a specific Employer
export const getEmployerJobs = async (req, res) => {
  try {
    const { employerId } = req.params;
    // ✅ If not admin, only allow own jobs
    if (req.user.role !== 'admin' && req.user.id !== employerId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const jobs = await Job.find({ employerId }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Employer jobs fetched successfully', data: jobs });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 4. Get Single Job
export const getSingleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json({ message: 'Job fetched successfully', data: job });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 5. Update Job — ✅ now verifies ownership
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Admin can update any job; others only their own
    if (req.user.role !== 'admin' && String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only edit your own jobs' });
    }

    // Prevent employerId hijack
    const updateBody = { ...req.body };
    delete updateBody.employerId;

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateBody, { new: true });
    res.status(200).json({ message: 'Job updated successfully', data: updatedJob });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 6. Delete Job — ✅ now verifies ownership
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role !== 'admin' && String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own jobs' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });

    res.status(200).json({ message: 'Job and related applications deleted successfully', data: job });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
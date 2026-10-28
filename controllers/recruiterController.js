// ✅ NEW: All recruiter-scoped endpoints
//    Every function verifies the recruiter owns the data they're accessing
import Job from '../model/job.js';
import Application from '../model/application.js';
import Resume from '../model/resume.js';

// 1. Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const myJobs = await Job.find({ employerId: recruiterId });
    const myJobIds = myJobs.map((j) => String(j._id));

    const apps = await Application.find({ jobId: { $in: myJobIds } });

    const stats = {
      totalJobs: myJobs.length,
      openJobs: myJobs.filter((j) => (j.status || 'open') === 'open').length,
      totalApplicants: apps.length,
      pending: apps.filter((a) => a.status === 'Pending').length,
      shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
      interview: apps.filter((a) => a.status === 'Interview').length,
      hired: apps.filter((a) => a.status === 'Hired').length,
      rejected: apps.filter((a) => a.status === 'Rejected').length,
    };

    // recent 5 applicants
    const recentApplicants = [...apps]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.status(200).json({ message: 'Stats fetched', data: { stats, recentApplicants } });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 2. My jobs (only mine)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });

    // attach applicant count per job
    const jobsWithCount = await Promise.all(
      jobs.map(async (j) => {
        const count = await Application.countDocuments({ jobId: String(j._id) });
        return { ...j.toObject(), applicantCount: count };
      })
    );

    res.status(200).json({ message: 'My jobs fetched', data: jobsWithCount });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 3. Create job (auto-sets employerId)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      skills,
      description,
      status,
    } = req.body;

    if (!title || !company || !location || !salary || !skills?.length) {
      return res.status(400).json({ message: 'Missing required job fields' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type: type || 'Full Time',
      salary,
      skills,
      description: description || '',
      status: status || 'open',
      employerId: req.user.id,
    });

    res.status(201).json({ message: 'Job created', data: job });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 4. Update job (ownership check)
export const updateMyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only edit your own jobs' });
    }

    const body = { ...req.body };
    delete body.employerId;

    const updated = await Job.findByIdAndUpdate(req.params.id, body, { new: true });
    res.status(200).json({ message: 'Job updated', data: updated });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 5. Delete job (ownership check)
export const deleteMyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own jobs' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });

    res.status(200).json({ message: 'Job and its applications deleted', data: job });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 6. Applicants for a specific job (ownership check)
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this job' });
    }

    const apps = await Application.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Applicants fetched', data: { job, applications: apps } });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 7. All applicants across all my jobs (for pipeline view)
export const getAllMyApplicants = async (req, res) => {
  try {
    const myJobs = await Job.find({ employerId: req.user.id });
    const myJobIds = myJobs.map((j) => String(j._id));

    const apps = await Application.find({ jobId: { $in: myJobIds } }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'All applicants fetched', data: apps });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 8. Update application status (ownership via job)
export const updateApplicantStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findById(app.jobId);
    if (!job || String(job.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, note } = req.body;
    const allowed = ['Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    app.status = status;
    app.statusHistory.push({
      status,
      changedBy: req.user.id,
      note: note || '',
    });
    await app.save();

    res.status(200).json({ message: 'Status updated', data: app });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 9. View candidate resume (only if they applied to my job)
export const getCandidateResume = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if this user applied to any of my jobs
    const myJobs = await Job.find({ employerId: req.user.id });
    const myJobIds = myJobs.map((j) => String(j._id));

    const hasApplied = await Application.findOne({
      userId,
      jobId: { $in: myJobIds },
    });

    if (!hasApplied) {
      return res.status(403).json({ message: 'This candidate has not applied to your jobs' });
    }

    const resume = await Resume.findOne({ userId });
    res.status(200).json({ message: 'Resume fetched', data: resume });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
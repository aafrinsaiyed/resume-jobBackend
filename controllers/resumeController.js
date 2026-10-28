// ✅ PATCHED: force userId to match owner (except admin), no cross-user writes
import Resume from '../model/resume.js';

export const saveResume = async (req, res) => {
  try {
    const { userId, ...resumeData } = req.body;

    // Only own resume (or admin)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'You can only save your own resume' });
    }

    const savedResume = await Resume.findOneAndUpdate(
      { userId },
      { userId, ...resumeData },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Resume saved successfully', data: savedResume });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    res.status(200).json({ message: 'Resume fetched successfully', data: resume });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    // Only own resume (or admin)
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'You can only delete your own resume' });
    }
    await Resume.findOneAndDelete({ userId: req.params.userId });
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
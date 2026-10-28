// route/uploadRoute.js
import express from 'express';
import upload from '../utils/multer.js';
import cloudinary from '../config/cloudinary.js';
import AuthanticateToken from '../utils/authmiddleware.js';

const router = express.Router();

router.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // File ko base64 string mein convert karke Cloudinary par upload karein
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'resume_uploads', // Cloudinary mein folder ka naam
      resource_type: 'auto', // Image, PDF, etc. sab handle karega
    });

    res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url, // Ye URL aap database mein save karenge
      public_id: result.public_id, // Delete karne ke liye kaam aayega
    });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
});

export default router;
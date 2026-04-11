const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

/**
 * POST /api/products/upload
 * Upload up to 5 product images to Cloudinary
 * Returns an array of image URLs
 */
router.post('/upload', protect, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    try {
      // Upload each file to Cloudinary
      const uploadPromises = req.files.map(file =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'buytopia/products',
              resource_type: 'image',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        })
      );

      const imageUrls = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        data: imageUrls,
        count: imageUrls.length
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images to Cloudinary'
      });
    }
  });
});

module.exports = router;

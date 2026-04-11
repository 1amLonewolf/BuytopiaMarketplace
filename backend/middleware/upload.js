const multer = require('multer');

// Store files in memory (Cloudinary handles the upload)
const storage = multer.memoryStorage();

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Multer upload config
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB max per file
  },
  fileFilter
});

// Allow up to 5 images per upload
module.exports = upload.array('images', 5);

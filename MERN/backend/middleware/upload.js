const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Ensure uploads directory exists inside backend/
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local disk storage for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// Allow common image file types only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|webp|gif)$/i;
  const allowedMimeTypes = /^image\/(jpeg|jpg|png|webp|gif)$/i;

  const hasValidExt = allowedExtensions.test(
    path.extname(file.originalname)
  );
  const hasValidMime = allowedMimeTypes.test(file.mimetype);

  if (hasValidExt && hasValidMime) {
    return cb(null, true);
  }

  cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

// Express middleware wrapper for single product image upload (field name: "image")
const uploadProductImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file upload",
      });
    }

    next();
  });
};

module.exports = {
  upload,
  uploadProductImage,
};

import multer from 'multer';

// Memory storage for processing before file save
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept PDF and images only
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;

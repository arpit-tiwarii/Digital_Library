import multer from "multer";
import crypto from 'crypto'
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './images/upload'),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    let ext = file.mimetype.split('/')[1]; // get extension from MIME type
    if (ext === 'jpeg') ext = 'jpg';
    cb(null, `${unique}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
    // This correctly checks if the file is an image
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image uploads are allowed'));
    }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 2MB
});

export default upload;
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        req.fileValidationError = 'Only images and GIFs are allowed to be uploaded';
        cb(null, false);
    }
};

module.exports = fileFilter;

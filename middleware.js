const multer = require('multer');
const path = require('path');

// Cambiamos a almacenamiento en memoria
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes'));
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5000000, // 5MB max
        files: 1 // máximo 1 archivo
    },
    fileFilter: fileFilter
});

module.exports = upload;
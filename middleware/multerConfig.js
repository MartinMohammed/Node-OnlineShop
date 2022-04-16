// ---------------------- CONFIGURATION FOR MULTER -----------------
const multer = require("multer");

// Disk storage is a storage engine which can be used with multer
const fileStorage = multer.diskStorage({
  //!  Multer will call these functions for an incoming file:
  // functions control how that file is handled (stored)
  destination: (req, file, cb) => {
    // null: no error and the storage destination as string
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // Provide filename uniqueness
    const filename = new Date().toISOString().concat("-", file.originalname);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // do some logic
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // *  provide true in the callback if file should be stored else false
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// exports the function which returns the configured multer middleware
module.exports = multer({
  // add our configured fileStorage
  storage: fileStorage,
  fileFilter: fileFilter,
}).single("image");

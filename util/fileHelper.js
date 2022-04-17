// ------------------ HELPER FUNCTIONS ------------
const fs = require("fs");
const deleteFile = (filePath) => {
  // ! deletes the name and the file that is connected to the name
  fs.unlink(filePath, (err) => {
    if (err) {
      //   call express error middleware
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;

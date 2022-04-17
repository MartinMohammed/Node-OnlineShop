const path = require("path");

// ROOT PATH - so we can apply relative paths
// => Problem with __dirname (to the current file)
module.exports = path.dirname(require.main.filename);

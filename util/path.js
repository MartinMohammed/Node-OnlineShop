const path = require("path");

// ROOT PATH - so we can appy relative paths
// => Problem with __dirname
module.exports = path.dirname(require.main.filename);

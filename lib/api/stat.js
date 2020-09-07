var stats = require('../tools/stats.js');
var request = require('../tools/smb2-forge').request;

module.exports = function stat(path, cb) {
  var connection = this;
  request('open', { path: path }, connection, function(err, file) {
    if (err != null) {
      return cb(err);
    }
    request('close', file, connection, function() {
      cb(null, stats(file));
    });
  });
};

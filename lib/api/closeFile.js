var request = require('../tools/smb2-forge').request;

module.exports = function closeFile(file, cb) {
  request('close', file, this, cb);
};

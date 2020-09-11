var convert = require('./convert_time');
var BigInt = require('./bigint');
var DIRECTORY = require('../structures/constants').DIRECTORY;

module.exports = function stat(file) {
  return {
    birthtime: convert(BigInt.fromBuffer(file.CreationTime).toNumber()),
    atime: convert(BigInt.fromBuffer(file.LastAccessTime).toNumber()),
    mtime: convert(BigInt.fromBuffer(file.LastWriteTime).toNumber()),
    ctime: convert(BigInt.fromBuffer(file.ChangeTime).toNumber()),
    size: BigInt.fromBuffer(file.EndofFile).toNumber(),
    isDirectory: function() {
      var attr = file.FileAttributes;
      if (typeof attr !== 'number') {
        attr = BigInt.fromBuffer(attr).toNumber();
      }
      return (attr & DIRECTORY) == DIRECTORY;
    },
  };
};

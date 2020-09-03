var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;
var convert = require('../tools/convert_time');
var BigInt = require('../tools/bigint');

/*
 * readdir
 * =======
 *
 * list the file / directory from the path provided:
 *
 *  - open the directory
 *
 *  - query directory content
 *
 *  - close the directory
 *
 */
module.exports = function readdir(path, options, cb) {
  var connection = this;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var mapping = function(v) {
    // get the filename only
    return v.Filename;
  };

  if (options.details)
    mapping = function(v) {
      return {
        Filename: v.Filename,
        CreationTime: convert(BigInt.fromBuffer(v.CreationTime).toNumber()),
        LastAccessTime: convert(BigInt.fromBuffer(v.LastAccessTime).toNumber()),
        LastWriteTime: convert(BigInt.fromBuffer(v.LastWriteTime).toNumber()),
        ChangeTime: convert(BigInt.fromBuffer(v.ChangeTime).toNumber()),
        size: BigInt.fromBuffer(v.AllocationSize).toNumber(),
        isDirectory: function() {
          return BigInt.fromBuffer(v.FileAttributes).toNumber() === 16;
        },
      };
    };

  function queryDirectory(filesBatch, file, connection, cb) {
    SMB2Request('query_directory', file, connection, function(err, files) {
      if (err) {
        if (err.code === 'STATUS_NO_MORE_FILES') {
          cb(null, filesBatch);
        } else {
          cb(err);
        }
      } else {
        filesBatch.push(
          files
            .filter(function(v) {
              // remove '.' and '..' values
              return v.Filename !== '.' && v.Filename !== '..';
            })
            .map(mapping)
        );
        queryDirectory(filesBatch, file, connection, cb);
      }
    });
  }

  function openDirectory(path, connection, cb) {
    SMB2Request('open', { path: path }, connection, function(err, file) {
      if (err) {
        cb(err);
      } else {
        return cb(null, file);
      }
    });
  }

  function closeDirectory(file, connection, cb) {
    // SMB2 query directory
    SMB2Request('close', file, connection, function(err, res) {
      if (err) {
        if (err.code !== 'STATUS_FILE_CLOSED') {
          cb(err);
        }
      }
      // SMB2 close directory
      cb(null, res);
    });
  }

  openDirectory(path, connection, function(err, file) {
    var totalFiles = [];
    var filesBatch = [];
    if (err) {
      cb(err);
    } else {
      queryDirectory(filesBatch, file, connection, function(err, file) {
        if (err) {
          cb(err);
        } else {
          closeDirectory(file, connection, function(err, file) {
            if (err) {
              cb(err);
            } else {
              totalFiles = [].concat(...filesBatch);
              cb(null, totalFiles);
            }
          });
        }
      });
    }
  });
};

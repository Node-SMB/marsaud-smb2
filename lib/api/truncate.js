var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;
var BigInt = require('../tools/bigint');
var FILE_WRITE_DATA = require('../structures/constants').FILE_WRITE_DATA;

module.exports = function truncate(path, length, cb) {
  var connection = this;
  var file;
  var fileLength = new BigInt(8, length);

  function setFileSize(fileSizeSetted) {
    SMB2Request(
      'set_info',
      {
        FileId: file.FileId,
        FileInfoClass: 'FileEndOfFileInformation',
        Buffer: fileLength.toBuffer(),
      },
      connection,
      function(err) {
        if (err) cb && cb(err);
        else fileSizeSetted();
      }
    );
  }

  function closeFile(fileClosed) {
    SMB2Request('close', file, connection, function(err) {
      if (err) cb && cb(err);
      else {
        file = null;
        fileClosed();
      }
    });
  }

  SMB2Request(
    'open',
    { path: path, desiredAccess: FILE_WRITE_DATA },
    connection,
    function(err, fd) {
      if (err) cb && cb(err);
      file = fd;
      setFileSize(function() {
        closeFile(cb);
      });
    }
  );
};

var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;
var BigInt = require('../tools/bigint');

module.exports = function truncate(filename, length, cb) {
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

  SMB2Request('open', { path: filename }, 'w', function(err, fd) {
    if (err) cb && cb(err);
    file = fd;
    setFileSize(function() {
      closeFile(cb);
    });
  });
};

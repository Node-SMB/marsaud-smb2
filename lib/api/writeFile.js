var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;
var BigInt = require('../tools/bigint');
var constants = require('../structures/constants');
var parseFlags = require('../tools/parse-flags');

/*
 * writeFile
 * =========
 *
 * create and write file on the share
 *
 *  - create the file
 *
 *  - set info of the file
 *
 *  - set content of the file
 *
 *  - close the file
 *
 */
module.exports = function writeFile(filename, data, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options.encoding = options.encoding || 'utf8';

  var connection = this;
  var file;
  var fileContent = Buffer.isBuffer(data)
    ? data
    : Buffer.from(data, options.encoding);
  var fileLength = new BigInt(8, fileContent.length);

  function createFile(fileCreated) {
    SMB2Request(
      'create',
      {
        createDisposition: parseFlags(
          (options != null && (options.flags || options.flag)) || 'wx'
        ),
        path: filename,
      },
      connection,
      function(err, f) {
        if (err) cb && cb(err);
        // SMB2 set file size
        else {
          file = f;
          fileCreated();
        }
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

  function writeFile(fileWritten) {
    var offset = new BigInt(8);
    var stop = false;
    var nbRemainingPackets = 0;
    var maxPacketSize = new BigInt(8, constants.MAX_WRITE_LENGTH);
    // callback manager
    function callback() {
      return function(err) {
        if (stop) return;
        if (err) {
          cb && cb(err);
          stop = true;
        } else {
          nbRemainingPackets--;
          checkDone();
        }
      };
    }
    // callback manager
    function checkDone() {
      if (stop) return;
      createPackets();
      if (nbRemainingPackets === 0 && offset.ge(fileLength)) {
        fileWritten();
      }
    }
    // create packets
    function createPackets() {
      while (
        nbRemainingPackets < connection.packetConcurrency &&
        offset.lt(fileLength)
      ) {
        // process packet size
        var rest = fileLength.sub(offset);
        var packetSize = rest.gt(maxPacketSize) ? maxPacketSize : rest;
        // generate buffer
        SMB2Request(
          'write',
          {
            FileId: file.FileId,
            Offset: offset.toBuffer(),
            Buffer: fileContent.slice(
              offset.toNumber(),
              offset.add(packetSize).toNumber()
            ),
          },
          connection,
          callback(offset)
        );
        offset = offset.add(packetSize);
        nbRemainingPackets++;
      }
    }
    checkDone();
  }

  createFile(function() {
    setFileSize(function() {
      writeFile(function() {
        closeFile(cb);
      });
    });
  });
};

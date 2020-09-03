/*
 * CONSTANTS
 */
var shareRegExp = /\\\\([^\\]*)\\([^\\]*)\\?/;
var port = 445;
var packetConcurrency = 20;
var autoCloseTimeout = 10000;

/*
 * DEPENDENCIES
 */
var autoPromise = require('./tools/auto-promise');
var SMB2Connection = require('./tools/smb2-connection');

/*
 * CONSTRUCTOR
 */
var SMB = (module.exports = function(opt) {
  opt = opt || {};

  // Parse share-string
  var matches;
  if (!opt.share || !(matches = opt.share.match(shareRegExp))) {
    throw new Error('the share is not valid');
  }

  // resolve IP from NetBios
  // this.ip = netBios.resolve(matches[0]);
  this.ip = matches[1];

  // set default port
  this.port = opt.port || port;

  // extract share
  this.share = matches[2];

  // save the full path
  this.fullPath = opt.share;

  // packet concurrency default 20
  this.packetConcurrency = opt.packetConcurrency || packetConcurrency;

  // close timeout default 10s
  if (opt.autoCloseTimeout !== undefined) {
    this.autoCloseTimeout = opt.autoCloseTimeout;
  } else {
    this.autoCloseTimeout = autoCloseTimeout;
  }

  // store authentification
  this.domain = opt.domain;
  this.username = opt.username;
  this.password = opt.password;

  // set the process id
  // https://msdn.microsoft.com/en-us/library/ff470100.aspx
  this.ProcessId = Buffer.from([
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xfe,
  ]);

  // activate debug mode
  this.debug = opt.debug;

  // init connection (socket)
  SMB2Connection.init(this);
});

/*
 * PROTOTYPE
 */
var proto = (SMB.prototype = {});

proto.disconnect = require('./api/disconnect');

proto.exists = autoPromise(
  SMB2Connection.requireConnect(require('./api/exists'))
);

proto.rename = autoPromise(
  SMB2Connection.requireConnect(require('./api/rename'))
);

proto.readFile = autoPromise(
  SMB2Connection.requireConnect(require('./api/readFile'))
);
proto.createReadStream = autoPromise(
  SMB2Connection.requireConnect(require('./api/createReadStream'))
);
proto.createWriteStream = autoPromise(
  SMB2Connection.requireConnect(require('./api/createWriteStream'))
);
proto.writeFile = autoPromise(
  SMB2Connection.requireConnect(require('./api/writeFile'))
);
proto.unlink = autoPromise(
  SMB2Connection.requireConnect(require('./api/unlink'))
);

proto.readdir = autoPromise(
  SMB2Connection.requireConnect(require('./api/readdir'))
);
proto.rmdir = autoPromise(
  SMB2Connection.requireConnect(require('./api/rmdir'))
);
proto.mkdir = autoPromise(
  SMB2Connection.requireConnect(require('./api/mkdir'))
);

proto.getSize = autoPromise(
  SMB2Connection.requireConnect(require('./api/getSize'))
);

proto.stat = autoPromise(SMB2Connection.requireConnect(require('./api/stat')));

proto.open = autoPromise(SMB2Connection.requireConnect(require('./api/open')));
proto.read = autoPromise(require('./api/read'), function(bytesRead, buffer) {
  return {
    bytesRead: bytesRead,
    buffer: buffer,
  };
});
proto.write = autoPromise(require('./api/write'), function(
  bytesWritten,
  buffer
) {
  return {
    bytesWritten: bytesWritten,
    buffer: buffer,
  };
});
proto.close = autoPromise(require('./api/close'));
proto.truncate = autoPromise(
  SMB2Connection.requireConnect(require('./api/truncate'))
);

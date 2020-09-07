# SMB2 Client for Node.js

[![Node compatibility](https://badgen.net/npm/node/@marsaud/smb2)](https://npmjs.org/package/@marsaud/smb2) [![License](https://badgen.net/npm/license/@marsaud/smb2)](https://npmjs.org/package/@marsaud/smb2) [![PackagePhobia](https://badgen.net/packagephobia/install/@marsaud/smb2)](https://packagephobia.now.sh/result?p=@marsaud/smb2)

[![Package Version](https://badgen.net/npm/v/@marsaud/smb2)](https://npmjs.org/package/@marsaud/smb2) [![Build Status](https://travis-ci.org/Node-SMB/marsaud-smb2.png?branch=master)](https://travis-ci.org/Node-SMB/marsaud-smb2) [![Latest Commit](https://badgen.net/github/last-commit/Node-SMB/marsaud-smb2)](https://github.com/Node-SMB/marsaud-smb2/commits/master)

## Introduction

This library is a simple implementation of SMB2 for Node.js. It allows you to access a SMB2 share as if you were using the native fs library.

The development is still at an experimental stage and should not be yet considered for production environment.

## Installation

```bash
npm install -S @marsaud/smb2
```

## API

### Asynchronicity

All async methods can be used with Node-style callbacks or return promises if
none is passed:

```js
// Node-style callback
smb2Client.readFile('foo.txt', function(err, content) {
  if (err) throw err;
  console.log(content);
});

// With promise, ideal with ES2017 async functions
const content = await smb2Client.readFile('foo.txt');
console.log(content);
```

### Construction

> `var smb2Client = new SMB2 ( options )`

The SMB2 class is the constructor of your SMB2 client.

the parameter `options` accepts this list of attributes:

- `share`: the share you want to access
- `domain`: the domain of which the user is registered
- `username`: the username of the user that access the share
- `password`: the password
- `port` (optional): default `445`, the port of the SMB server
- `packetConcurrency` (optional): default `20`, the number of simultaneous packet when writing / reading data from the share
- `autoCloseTimeout` (optional): default `10000`, the timeout in milliseconds before to close the SMB2 session and the socket, if set to `0` the connection will never be closed unless you do it

Example:

```javascript
// load the library
var SMB2 = require('@marsaud/smb2');

// create an SMB2 instance
var smb2Client = new SMB2({
  share: '\\\\000.000.000.000\\c$',
  domain: 'DOMAIN',
  username: 'username',
  password: 'password!',
});
```

### Connection management

The connection to the SMB server will be automatically open when necessary.

Unless you have set `autoCloseTimeout` to `0` during client construction, the connection will be closed automatically.

If you have set `autoCloseTimeout` to `0`, the connection MUST be closed manually:

```js
smb2Client.disconnect();
```

### High level methods

> `smb2Client.exists ( path, callback )`

Test whether or not the given path exists by checking with the file system.

Example:

```javascript
smb2Client.exists('path\\to\\my\\file.txt', function(err, exists) {
  if (err) throw err;
  console.log(exists ? "it's there" : "it's not there!");
});
```

> `smb2Client.mkdir ( path, [mode], callback )`

Asynchronous `mkdir(2)`: create a directory.

`mode` defaults to `0o777`.

Example:

```javascript
smb2Client.mkdir('path\\to\\the\\directory', function(err) {
  if (err) throw err;
  console.log('Directory created!');
});
```

> `smb2Client.readdir ( path, [options], callback )`

- `path` String
- `options` Object
  - `encoding` String | Null default = null
- `callback` Function

Asynchronous `readdir(3)`: reads the contents of a directory.

The result is an array of the names of the files in the directory excluding `'.'` and `'..'`.

If you want the response to include stats, you need to pass the `stats: true`. Response will be an Array of this form:

```
[
    {
        name: String,
        birthtime: Date,
        mtime: Date,
        atime: Date,
        ctime: Date,
        isDirectory(): boolean
    },
...
]
```

Example:

```javascript
smb2Client.readdir('Windows\\System32', function(err, files) {
  if (err) throw err;
  console.log(files);
});
```

> `smb2Client.stat ( path, callback )`

- `path` String
- `callback` Function

Asynchronous `stat`: query stats of a directory or file.

Response will be an object with the following structure :

```
{
    birthtime: Date,
    mtime: Date,
    atime: Date,
    ctime: Date,
    isDirectory(): boolean
}
```

> `smb2Client.readFile ( path, [options], callback )`

- `path` String
- `options` Object
  - `encoding` String | Null default = null
- `callback` Function

Asynchronously reads the entire content of a file.

Example:

```javascript
smb2Client.readFile('path\\to\\my\\file.txt', function(err, content) {
  if (err) throw err;
  console.log(content);
});
```

If no encoding is specified, then the raw buffer is returned.

> `smb2Client.rename ( oldPath, newPath, [ options, ] callback )`

Asynchronous `rename(2)`: rename a file.

```javascript
smb2Client.rename(
  'path\\to\\my\\file.txt',
  'new\\path\\to\\my\\new-file-name.txt',
  function(err) {
    if (err) throw err;
    console.log('file has been renamed');
  }
);
```

Existing files are not replaced by default, you need to pass the `replace: true` option for this use case:

```javascript
smb2Client.rename(
  'path\\to\\my\\file.txt',
  'path\\to\\existing\\file.txt',
  {
    replace: true
  }
  function(err) {
    if (err) throw err;
    console.log('file has been renamed');
  }
);
```

> `smb2Client.rmdir ( path, callback )`

Asynchronous `rmdir(2)`: delete an empty directory.

Example:

```javascript
smb2Client.rmdir('path\\to\\the\\directory', function(err) {
  if (err) throw err;
  console.log('Directory deleted!');
});
```

> `smb2Client.unlink ( path, callback )`

Asynchronous `unlink(2)`: delete a file.

```javascript
smb2Client.unlink('path\\to\\my\\file.txt', function(err) {
  if (err) throw err;
  console.log('file has been deleted');
});
```

> `smb2Client.writeFile ( filename, data, [options], callback )`

- `filename` String
- `data` String | Buffer
- `options` Object
  - `encoding` String | Null default = `'utf8'`
- `callback` Function

Asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer.

The encoding option is ignored if data is a buffer.

Example:

```javascript
smb2Client.writeFile('path\\to\\my\\file.txt', 'Hello Node', function(err) {
  if (err) throw err;
  console.log("It's saved!");
});
```

> `smb2Client.truncate ( filename, length, callback )`

- `filename` String
- `length` Number
- `callback` Function

Asynchronously truncate a file to a size of precisely length bytes.

Example:

```javascript
smb2Client.truncate('path\\to\\my\\file.txt', 10, function(err) {
  if (err) throw err;
  console.log("It's truncated!");
});
```

### Streams

> `smb2Client.createReadStream ( fileName, [options], callback )`

Returns a read stream on the file.

> Unlike `fs.createReadStream`, this function is asynchronous, as we need use asynchronous smb requests to get the stream.

Example:

```javascript
smb2Client.createReadStream('path\\to\\the\\file', function(err, readStream) {
  if (err) throw err;
  var writeStream = fs.createWriteStream('localFile');
  readStream.pipe(writeStream);
});
```

Supported options:

- `autoClose`: whether the `fd` should be closed at the end or on error, default `true`
- `end`: offset in the file after which to stop reading, default `Infinity`
- `fd`: if specified, the path will be ignored and this opened file will be used instead
- `flags`: see [Node documentation](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_file_system_flags), default `'r'`
- `start`: offset in the file from which to start reading, default `0`

> `smb2Client.createWriteStream ( fileName, [options], callback )`

Returns a write stream on the file.

> Unlike `fs.createWriteStream`, this function is asynchronous, as we need use asynchronous smb requests to get the stream.

Example:

```javascript
smb2Client.createWriteStream('path\\to\\the\\file', function(err, writeStream) {
  if (err) throw err;
  var readStream = fs.createReadStream('localFile');
  readStream.pipe(writeStream);
});
```

Supported options:

- `autoClose`: whether the `fd` should be closed at the end or on error, default `true`
- `fd`: if specified, the path will be ignored and this opened file will be used instead
- `flags`: see [Node documentation](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_file_system_flags), default `'wx'`
- `start`: offset in the file from which to start writing, default `0`

### Low-level API

```javascript
smb2Client.open('path\\to\\the\\file', 'r', function(err, fd) {
  if (err) throw err;

  smb2Client.read(
    fd, // file descriptor
    Buffer.alloc(10), // buffer where to store the data
    0, // offset in the buffer
    10, // number of bytes to read
    0, // offset in the file
    function(err, bytesRead, buffer) {
      smb2Client.close(fd, function() {});

      if (err) throw cb(err);
      console.log(bytesRead, buffer);
    }
  );
});

smb2Client.open('path\\to\\the\\file', 'w', function(err, fd) {
  if (err) throw err;

  smb2Client.write(
    fd, // file descriptor
    Buffer.from('foo bar\n'), // data to write to the file
    0, // offset in the buffer
    10, // number of bytes to write
    0, // offset in the file
    function(err, bytesWritten, buffer) {
      smb2Client.close(fd, function() {});

      if (err) throw cb(err);
      console.log(bytesWritten);
    }
  );
});
```

> This API is modeled after Node's `fs` module.

> Note: be careful of `autoCloseTimeout` with this process as it is not intended to cover multiple method calls, you should set it to `0` and manually `disconnect()`.

## Contributors

- [Benjamin Chelli](https://github.com/bchelli)
- [Fabrice Marsaud](https://github.com/marsaud)

## References

    The[MS-SMB2]: Server Message Block (SMB) Protocol Versions 2 and 3
    Copyright (C) 2014 Microsoft
    http://msdn.microsoft.com/en-us/library/cc246482.aspx

## License

(The MIT License)

Copyright (c) 2013-2014 Benjamin Chelli &lt;benjamin@chelli.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

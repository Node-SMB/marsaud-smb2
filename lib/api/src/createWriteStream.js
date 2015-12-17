import {request} from '../tools/smb2-forge'
import Bigint from '../tools/bigint'
import Bluebird from 'bluebird'
import {Writable} from 'stream'

const requestAsync = Bluebird.promisify(request)

const maxPacketSize = 0x00010000

class SmbWritableStream extends Writable {
  constructor (connection, file, options) {
    super(options)
    this.connection = connection
    this.encoding = options.encoding || 'utf8'
    this.file = file
    this.offset = new Bigint(8)
  }

  async _write (chunk, encoding, next) {
    encoding = this.encoding || encoding
    chunk = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, encoding)
    if (chunk.length > maxPacketSize) {
      throw new Error('Chunk size exceeds allowed maximum packet size')
    }
    const offset = new Bigint(this.offset)
    this.offset = this.offset.add(chunk.length)
    await requestAsync('write', {
      FileId: this.file.FileId,
      Offset: offset.toBuffer(),
      Buffer: chunk
    }, this.connection)

    next()
  }

  async end (...args) {
    try {
      super.end(...args)
    } finally {
      await requestAsync('close', this.file, this.connection)
    }
  }
}

export default function (path, options, cb) {
  if(typeof options == 'function'){
    cb = options;
    options = {};
  }
  request('create', {path}, this, (err, file) => {
    if (err) {
      cb(err)
    } else {
      cb(null, new SmbWritableStream(this, file, options))
    }
  })
}

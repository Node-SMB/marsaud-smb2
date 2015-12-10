import {SMB2Request} from '../tools/smb2-forge'
import Bigint from '../tools/bigint'
import Bluebird from 'bluebird'
import {Writable} from 'stream'

const SMB2RequestAsync = Bluebird.promisify(SMB2Request)

const maxPacketSize = 0x00010000

class SmbWritableStream extends Writable {
  constructor (connection, file, options) {
    super(options)
    this.connection = connection
    this.file = file
    this.encoding = options.encoding || 'utf8'
    this.offset = new Bigint(8)
  }

  async _write (chunk, encoding, next) {
    encoding = this.encoding || encoding
    chunk = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, encoding)
    if (chunk.length > maxPacketSize) {
      throw new Error('Chunk size exceeds allowed maximum packet size')
    }

    await SMB2RequestAsync('write', {
      FileId: this.file.FileId,
      Offset: this.offset.toBuffer(),
      Buffer: chunk
    }, this.connection)

    this.offset = this.offset.add(chunk.length)
    next()
  }

  async end (...args) {
    try {
      super.end(...args)
    } finally {
      await SMB2RequestAsync('close', this.file, this.connection)
    }
  }
}

export default async function (path, options = {}) {
  const file = await SMB2RequestAsync('create', {path}, this)
  options.objectMode = false
  return new SmbWritableStream(this, file, options)
}

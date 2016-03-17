import Bigint from '../tools/bigint'
import Bluebird from 'bluebird'
import {request} from '../tools/smb2-forge'
import {Writable} from 'stream'

const requestAsync = Bluebird.promisify(request)

const maxPacketSize = new Bigint(8, 0x00010000 - 0x71)

function * fibonacci () {
  let a = 1
  let b = 2

  for (;;) {
    const c = a
    a = b
    b = c + a
    yield c
  }
}

class SmbWritableStream extends Writable {
  constructor (connection, file, options = {}) {
    super(options)

    const {
      encoding = 'utf8',
      start = 0
    } = options

    this.connection = connection
    this.encoding = encoding
    this.file = file
    this.offset = new Bigint(8, start)
  }

  async _write (chunk, encoding, next) {
    encoding = this.encoding || encoding
    chunk = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, encoding)

    while (chunk.length > 0) {
      const packetSize = Math.min(maxPacketSize.toNumber(), chunk.length)
      const packet = chunk.slice(0, packetSize)
      chunk = chunk.slice(packetSize)
      const offset = new Bigint(this.offset)
      this.offset = this.offset.add(packetSize)

      const fiboGen = fibonacci()
      let pending = true

      while (pending) {
        try {
          await requestAsync('write', {
            FileId: this.file.FileId,
            Offset: offset.toBuffer(),
            Buffer: packet
          }, this.connection)

          pending = false
        } catch (error) {
          if (error.code === 'STATUS_PENDING') {
            await new Promise((resolve, reject) => {
              setTimeout(resolve, fiboGen.next().value)
            })
          } else {
            throw error
          }
        }
      }
    }

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
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  request('create', {path}, this, (err, file) => {
    if (err) {
      cb(err)
    } else {
      cb(null, new SmbWritableStream(this, file, options))
    }
  })
}

import {SMB2Request} from '../tools/smb2-forge'
import Bigint from '../tools/bigint'
import Bluebird from 'bluebird'
import {Readable} from 'stream'

const SMB2RequestAsync = Bluebird.promisify(SMB2Request)

const maxPacketSize = 0x00010000

class SmbReadableStream extends Readable {
  constructor (connection, file, options) {
    super(options)
    this.connection = connection
    this.offset = new Bigint(8)
    this.file = file
    this.encoding = options && options.encoding

    let fileLength = 0
    for (let i = 0; i < file.EndOfFile.length; i++) {
      fileLength |= file.EndOfFile[i] << (i * 8)
    }
    this.fileLength = fileLength
  }
  async _read (size) {
    while (this.offset.lt(this.fileLength) && size > 0) {
      const rest = this.offset.sub(this.fileLength).neg()
      let packetSize = rest.gt(maxPacketSize) ? maxPacketSize : rest.toNumber()
      packetSize = Math.min(packetSize, size)

      const content = await SMB2RequestAsync('read', {
        FileId: this.file.FileId,
        Length: packetSize,
        Offset: this.offset.toBuffer()
      }, this.connection)

      this.offset = this.offset.add(packetSize)
      size -= packetSize
      if (this.encoding) {
        content = content.toString(this.encoding)
      }
      if (!this.push(content)) {
        return
      }
    }
    if (this.offset.lt(this.fileLength)) {
      await SMB2RequestAsync('close', this.file, this.connection)
      this.push(null)
    }
  }
}

export default async function (path, options = {}) {
  const file = await SMB2RequestAsync('open', {path}, this)
  options.objectMode = false
  return new SmbReadableStream(this, file, options)
}

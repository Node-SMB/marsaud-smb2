import {SMB2Request} from '../tools/smb2-forge'
import Bigint from '../tools/bigint'
import Bluebird from 'bluebird'
import {Readable} from 'stream'

const SMB2RequestAsync = Bluebird.promisify(SMB2Request)

export default async function (path, options = {}) {
  const connection = this

  const stream = new Readable({objectMode: false})

  const file = await SMB2RequestAsync('open', {path}, this)
  let fileLength = 0
  let offset = new Bigint(8)
  const maxPacketSize = 0x00010000

  for (let i = 0; i < file.EndOfFile.length; i++) {
    fileLength |= file.EndOfFile[i] << (i * 8)
  }

  stream._read = async function (size) {
    while (offset.lt(fileLength) && size > 0) {
      const rest = offset.sub(fileLength).neg()
      let packetSize = rest.gt(maxPacketSize) ? maxPacketSize : rest.toNumber()
      packetSize = Math.min(packetSize, size)
      const content = await SMB2RequestAsync('read', {
        FileId: file.FileId,
        Length: packetSize,
        Offset: offset.toBuffer()
      }, connection)
      offset = offset.add(packetSize)
      size -= packetSize
      if (!this.push(content)) {
        return
      }
    }
    if (offset.lt(fileLength)) {
      await SMB2RequestAsync('close', file, connection)
      this.push(null)
    }
  }

  return stream
}

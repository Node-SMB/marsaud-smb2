import { Readable, Writable } from 'stream';

interface ISMB2Options {
  share: string;
  username: string;
  domain: string;
  password: string;
  port?: number;
  packetConcurrency?: number;
  autoCloseTimeout?: number;
  debug?: boolean;
}

interface ICreateReadStreamOptions {
  autoClose?: boolean;
  end?: number;
  fd?: number;
  flags?: string;
  start?: number;
}

interface ICreateWriteStreamOptions {
  autoClose?: boolean;
  fd?: number;
  flags?: string;
  start?: number;
}

interface SMB2Readable extends Readable {
  fileSize: number;
}

interface SMB2Writable extends Writable {}

interface IEncodingOption {
  encoding?: string | null;
}

interface IStatsOption {
  stats: true;
}

interface IStats {
  name: string,
  birthtime: Date,
  mtime: Date,
  atime: Date,
  ctime: Date,
  isDirectory(): boolean
}

interface IFileStats extends IStats {
  name: string,
}

declare class SMB2 {
  constructor(options: ISMB2Options);
  disconnect(): void;
  exists(path: string): Promise<boolean>;
  exists(path: string, cb: (err?: Error, exists?: boolean) => void): void;

  mkdir(path: string, mode?: number): Promise<void>;
  mkdir(path: string, mode: number, cb: (err?: Error) => void): void;
  mkdir(path: string, cb: (err?: Error) => void): void;

  readdir(path: string, options?: IEncodingOption): Promise<string[]>;
  readdir(path: string, options: IEncodingOption & IStatsOption): Promise<IFileStats[]>;
  readdir(path: string, cb: (err?: Error, files?: string[]) => void): void;
  readdir(path: string, options: IEncodingOption, cb: (err?: Error, files?: string[]) => void): void;
  readdir(path: string, options: IEncodingOption & IStatsOption, cb: (err?: Error, files?: IFileStats[]) => void): void;

  stat(path: string): Promise<IStats>;
  stat(path: string, cb: (err?: Error, stats?: IStats) => void): void;

  readFile(
    path: string,
    options?: { encoding?: null }
  ): Promise<Buffer>;
  readFile(
    path: string,
    options: { encoding: string }
  ): Promise<string>;
  readFile(
    path: string,
    cb: (err?: Error, content?: Buffer) => void
  ): void;
  readFile(
    path: string,
    options: { encoding?: null },
    cb: (err?: Error, content?: Buffer) => void
  ): void;
  readFile(
    path: string,
    options: { encoding: string },
    cb: (err?: Error, content?: string) => void
  ): void;

  rename(
    oldPath: string,
    newPath: string,
    options?: { replace: boolean }
  ): Promise<void>;
  rename(oldPath: string, newPath: string, cb: (err?: Error) => void): void;
  rename(
    oldPath: string,
    newPath: string,
    options: { replace: boolean },
    cb: (err?: Error) => void
  ): void;

  rmdir(path: string): Promise<void>;
  rmdir(path: string, cb: (err?: Error) => void): void;

  unlink(path: string): Promise<void>;
  unlink(path: string, cb: (err?: Error) => void): void;

  writeFile(
    path: string,
    data: string | Buffer,
    options?: IEncodingOption
  ): Promise<void>;
  writeFile(
    path: string,
    data: string | Buffer,
    cb: (err?: Error) => void
  ): void;
  writeFile(
    path: string,
    data: string | Buffer,
    options: IEncodingOption,
    cb: (err?: Error) => void
  ): void;

  truncate(path: string, length?: number): Promise<void>;
  truncate(path: string, length: number, cb: (err?: Error) => void): void;

  createReadStream(
    path: string,
    options?: ICreateReadStreamOptions
  ): Promise<SMB2Readable>;
  createReadStream(
    path: string,
    options: ICreateReadStreamOptions,
    cb: (err?: Error, readable?: SMB2Readable) => void
  ): void;
  createReadStream(
    path: string,
    cb: (err?: Error, readable?: SMB2Readable) => void
  ): void;

  createWriteStream(
    path: string,
    options?: ICreateWriteStreamOptions
  ): Promise<SMB2Writable>;
  createWriteStream(
    path: string,
    options: ICreateWriteStreamOptions,
    cb: (err?: Error, writable?: SMB2Writable) => void
  ): void;
  createWriteStream(
    path: string,
    cb: (err?: Error, writable?: SMB2Writable) => void
  ): void;

  open(
    path: string,
    flags: string,
    cb: (err?: Error, fd?: number) => void
  ): void;
  read(
    fd: number,
    buffer: Buffer,
    bufferOffset: number,
    toRead: number,
    fileOffset: number,
    cb: (err?: Error, read?: number, buffer?: Buffer) => void
  ): void;
  write(
    fd: number,
    buffer: Buffer,
    bufferOffset: number,
    toWrite: number,
    fileOffset: number,
    cb: (err?: Error, written?: number, buffer?: Buffer) => void
  ): void;
  close(fd: number, cb: (err?: Error) => void): void;
}

export default SMB2;

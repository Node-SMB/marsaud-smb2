/* Documentation https://msdn.microsoft.com/en-us/library/cc246497.aspx */

module.exports = {
  /* 2.2.13 SMB2 CREATE Request:
     https://msdn.microsoft.com/en-us/library/cc246502.aspx */
  FILE_SUPERSEDE: 0x00000000,
  FILE_OPEN: 0x00000001,
  FILE_CREATE: 0x00000002,
  FILE_OPEN_IF: 0x00000003,
  FILE_OVERWRITE: 0x00000004,
  FILE_OVERWRITE_IF: 0x00000005,

  // Where do they come from?!
  MAX_READ_LENGTH: 0x00010000,
  MAX_WRITE_LENGTH: 0x00010000 - 0x71,

  /**
   * 2.2.13.1.1 SMB2 File_Pipe_Printer_Access_Mask
   * https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/77b36d0f-6016-458a-a7a0-0f4a72ae1534
   */
  DELETE: 0x00010000,
  FILE_APPEND_DATA: 0x00000004,
  FILE_DELETE_CHILD: 0x00000040,
  FILE_READ_ATTRIBUTES: 0x00000080,
  FILE_READ_DATA: 0x00000001,
  FILE_READ_EA: 0x00000008,
  FILE_WRITE_ATTRIBUTES: 0x00000100,
  FILE_WRITE_DATA: 0x00000002,
  FILE_WRITE_EA: 0x00000010,
  READ_CONTROL: 0x00020000,
  SYNCHRONIZE: 0x00100000,
  WRITE_DAC: 0x00040000,

  /**
   * https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/ca28ec38-f155-4768-81d6-4bfeb8586fc9
   * FileAttributes values
   */

  DIRECTORY: 16,
};

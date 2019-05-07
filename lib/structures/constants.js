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
  FILE_WRITE_DATA: 0x00000002,
};

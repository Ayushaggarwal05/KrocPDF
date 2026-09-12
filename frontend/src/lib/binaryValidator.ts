export async function validatePdfBinary(file: File): Promise<boolean> {
  // 1. Two-Tier Magic Byte (%PDF-) + Trailing Byte Validation
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check minimum size (at least %PDF- and %%EOF)
  if (bytes.length < 10) return false;

  // Validate the first 5 bytes match %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const magicBytes = [0x25, 0x50, 0x44, 0x46, 0x2d];
  for (let i = 0; i < magicBytes.length; i++) {
    if (bytes[i] !== magicBytes[i]) {
      return false;
    }
  }

  // EOF Sanity Check: Ensure the buffer contains %%EOF within the last 1024 bytes.
  // %%EOF is 0x25, 0x25, 0x45, 0x4f, 0x46
  const windowSize = Math.min(1024, bytes.length);
  const tail = bytes.slice(bytes.length - windowSize);
  let foundEof = false;

  for (let i = 0; i < tail.length - 4; i++) {
    if (
      tail[i] === 0x25 &&
      tail[i + 1] === 0x25 &&
      tail[i + 2] === 0x45 &&
      tail[i + 3] === 0x4f &&
      tail[i + 4] === 0x46
    ) {
      foundEof = true;
      break;
    }
  }

  return foundEof;
}

import { describe, it, expect } from 'vitest';
import { validatePdfBinary } from './binaryValidator';

describe('binaryValidator', () => {
  it('should reject files smaller than 10 bytes', async () => {
    const file = new File(['short'], 'short.pdf', { type: 'application/pdf' });
    const isValid = await validatePdfBinary(file);
    expect(isValid).toBe(false);
  });

  it('should validate a correct PDF with %PDF- and %%EOF', async () => {
    // 0x25 0x50 0x44 0x46 0x2d -> %PDF-
    // 0x25 0x25 0x45 0x4f 0x46 -> %%EOF
    const header = [0x25, 0x50, 0x44, 0x46, 0x2d];
    const body = new Array(50).fill(0x00);
    const eof = [0x25, 0x25, 0x45, 0x4f, 0x46];
    
    const buffer = new Uint8Array([...header, ...body, ...eof]);
    const file = new File([buffer], 'valid.pdf', { type: 'application/pdf' });
    
    const isValid = await validatePdfBinary(file);
    expect(isValid).toBe(true);
  });

  it('should reject a PDF missing the %%EOF footer', async () => {
    const header = [0x25, 0x50, 0x44, 0x46, 0x2d];
    const body = new Array(50).fill(0x00);
    
    const buffer = new Uint8Array([...header, ...body]);
    const file = new File([buffer], 'invalid-eof.pdf', { type: 'application/pdf' });
    
    const isValid = await validatePdfBinary(file);
    expect(isValid).toBe(false);
  });

  it('should reject a PDF missing the %PDF- header', async () => {
    const header = [0x00, 0x00, 0x00, 0x00, 0x00];
    const body = new Array(50).fill(0x00);
    const eof = [0x25, 0x25, 0x45, 0x4f, 0x46];
    
    const buffer = new Uint8Array([...header, ...body, ...eof]);
    const file = new File([buffer], 'invalid-header.pdf', { type: 'application/pdf' });
    
    const isValid = await validatePdfBinary(file);
    expect(isValid).toBe(false);
  });
});

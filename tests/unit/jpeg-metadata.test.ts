import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { scanJpegMetadata } from '@/features/export-share/jpeg-metadata';

/** Builds a minimal JPEG: SOI + APP1(Exif, IFD0 with the given tags) + SOS + EOI. */
function jpegWithExif(tags: number[], little = true): Uint8Array {
  const tiff: number[] = [];
  const w16 = (v: number) => (little ? tiff.push(v & 0xff, v >> 8) : tiff.push(v >> 8, v & 0xff));
  const w32 = (v: number) => (little ? tiff.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24) : tiff.push(v >>> 24, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff));
  tiff.push(...(little ? [0x49, 0x49] : [0x4d, 0x4d]));
  w16(42);
  w32(8);
  w16(tags.length);
  for (const t of tags) {
    w16(t);
    w16(4); // LONG
    w32(1);
    w32(0);
  }
  w32(0);
  const payload = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = payload.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 0xff, ...payload, 0xff, 0xda, 0, 2, 0xff, 0xd9]);
}

describe('jpeg metadata scan', () => {
  it('detects EXIF with a GPS IFD pointer (both byte orders)', () => {
    expect(scanJpegMetadata(jpegWithExif([0x010f, 0x8825]))).toEqual({ isJpeg: true, hasExif: true, hasGps: true });
    expect(scanJpegMetadata(jpegWithExif([0x8825], false)).hasGps).toBe(true);
  });

  it('EXIF without GPS', () => {
    expect(scanJpegMetadata(jpegWithExif([0x010f, 0x0112]))).toEqual({ isJpeg: true, hasExif: true, hasGps: false });
  });

  it('bundled samples (re-encoded without metadata) carry no EXIF', () => {
    const bytes = new Uint8Array(readFileSync(join(__dirname, '..', '..', 'assets', 'samples', 'sample-01.jpg')));
    expect(scanJpegMetadata(bytes)).toEqual({ isJpeg: true, hasExif: false, hasGps: false });
  });

  it('non-JPEG input', () => {
    expect(scanJpegMetadata(new Uint8Array([0x89, 0x50, 0x4e, 0x47])).isJpeg).toBe(false);
  });
});

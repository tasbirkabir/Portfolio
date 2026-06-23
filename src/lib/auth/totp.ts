import { generateSecret as _generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

export function generateSecret(): string {
  return _generateSecret();
}

export function buildOtpauthUri(opts: { accountName: string; issuer: string; secret: string }): string {
  return generateURI({ issuer: opts.issuer, label: opts.accountName, secret: opts.secret });
}

export async function generateQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { margin: 1, width: 220, errorCorrectionLevel: "M" });
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token: token.replace(/\s+/g, ""), secret, epochTolerance: 30 });
    return result.valid === true;
  } catch {
    return false;
  }
}

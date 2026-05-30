import QRCode from 'qrcode';

export type PDFContext = 'coloring' | 'worksheet' | 'party' | 'storybook';

const SCAN_BASE = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://createandcolor.aivantageworks.com'}/scan`;

export function getScanUrl(context: PDFContext): string {
  const params: Record<string, string> = {
    utm_source: 'print',
    utm_medium: 'pdf_footer',
  };
  switch (context) {
    case 'worksheet':
      params.from = 'worksheet';
      params.utm_campaign = 'worksheet_qr';
      break;
    case 'party':
      params.from = 'party';
      params.utm_campaign = 'party_qr';
      break;
    case 'storybook':
      params.from = 'storybook';
      params.utm_campaign = 'storybook_qr';
      break;
    default:
      params.from = 'coloring';
      params.utm_campaign = 'coloring_qr';
  }
  return `${SCAN_BASE}?${new URLSearchParams(params).toString()}`;
}

const QR_OPTIONS = {
  width: 200,
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' },
} as const;

export async function generateQRDataUrl(context: PDFContext): Promise<string> {
  return QRCode.toDataURL(getScanUrl(context), QR_OPTIONS);
}

// Works without the native `canvas` package — extracts PNG bytes from the data URL.
export async function generateQRPngBytes(context: PDFContext): Promise<Buffer> {
  const dataUrl = await QRCode.toDataURL(getScanUrl(context), QR_OPTIONS);
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

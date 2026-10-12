import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CirclePay — Reward your X circle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #e8eaed 0%, #f7f8fa 50%, #dce4f5 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            borderRadius: 44,
            background: '#0D5CFF',
            color: 'white',
            fontSize: 42,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#1a1d24', letterSpacing: -1 }}>
          Circle<span style={{ color: '#0D5CFF' }}>Pay</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: '#5c6370' }}>
          Reward your X circle
        </div>
        <div style={{ marginTop: 36, fontSize: 18, color: '#0D5CFF' }}>circlepay.fun</div>
      </div>
    ),
    { ...size }
  );
}

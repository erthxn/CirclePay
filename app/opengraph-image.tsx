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
          background: '#e8eaed',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 96,
            borderRadius: 48,
            background: '#0D5CFF',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, color: '#1a1d24', letterSpacing: -1 }}>
          Circle<span style={{ color: '#0D5CFF' }}>Pay</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 30, color: '#5c6370' }}>Reward your X circle</div>
        <div style={{ marginTop: 32, fontSize: 20, color: '#0D5CFF' }}>circlepay.fun</div>
      </div>
    ),
    { ...size }
  );
}

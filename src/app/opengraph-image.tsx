import { ImageResponse } from 'next/og';
import { EVENTS, getActiveEvent } from '@/data/events';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Momo AI Deep Dive - The Event';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    const activeEvent = getActiveEvent();

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #020617, #0f172a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Abstract Background Orbs */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '600px',
                        height: '600px',
                        background: 'rgba(6,182,212, 0.2)', // Cyan-500
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        background: 'rgba(14,165,233, 0.2)', // Sky-500
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />

                {/* Content Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, gap: '20px' }}>

                    {/* Tagline */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '8px 24px',
                        borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: '#e2e8f0', fontSize: 24, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                            Momo AI Deep Dive
                        </span>
                    </div>

                    {/* Main Title */}
                    <div style={{
                        fontSize: 84,
                        fontWeight: 800,
                        background: 'linear-gradient(to bottom, #ffffff, #94a3b8)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        maxWidth: '900px',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        {activeEvent?.title || 'Surface Calm'}
                    </div>

                    {/* Footer Info */}
                    <div style={{ display: 'flex', gap: '40px', marginTop: '20px', color: '#94a3b8', fontSize: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>📅</span>
                            <span>{new Date(activeEvent?.date || new Date()).toLocaleDateString('de-DE', { month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>📍</span>
                            <span>Penthouse & Online</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}

'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex flex-col
        items-center justify-center px-6 text-center">

            <div className="w-72 h-72 mb-6">
                <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full">

                    <circle cx="150" cy="150" r="120" fill="#F97316"
                        fillOpacity="0.05" />
                    <circle cx="150" cy="150" r="90" fill="#F97316"
                        fillOpacity="0.05" />

                    <g style={{
                        transformOrigin: '150px 145px',
                        animation: 'shake 4s ease-in-out infinite',
                    }}>
                        <path
                            d="M 118 130 L 118 108 Q 118 85 150 85 Q 182 85 182 108 L 182 130"
                            fill="none" stroke="#F97316" strokeWidth="10"
                            strokeLinecap="round"
                        />
                        <rect x="108" y="128" width="84" height="72"
                            rx="10" fill="#F97316" />
                        <circle cx="150" cy="158" r="12"
                            fill="white" fillOpacity="0.9" />
                        <rect x="146" y="162" width="8" height="18"
                            rx="3" fill="white" fillOpacity="0.9" />
                        <rect x="118" y="136" width="20" height="6"
                            rx="3" fill="white" fillOpacity="0.2" />
                    </g>

                    <text x="78" y="108" fontFamily="Helvetica" fontSize="18"
                        fill="#F97316" fillOpacity="0.6"
                        style={{ animation: 'fadeUpA 2.8s ease-in-out infinite' }}>
                        ✕
                    </text>
                    <text x="208" y="125" fontFamily="Helvetica" fontSize="14"
                        fill="#ef4444" fillOpacity="0.5"
                        style={{ animation: 'fadeUpB 2.8s ease-in-out infinite 0.5s' }}>
                        ✕
                    </text>
                    <text x="196" y="90" fontFamily="Helvetica" fontSize="11"
                        fill="#F97316" fillOpacity="0.5"
                        style={{ animation: 'fadeUpA 2.8s ease-in-out infinite 1s' }}>
                        ✕
                    </text>

                    <ellipse cx="150" cy="210" rx="40" ry="6"
                        fill="#F97316" fillOpacity="0.1"
                        style={{ animation: 'shadow 4s ease-in-out infinite' }}
                    />

                    <style>{`
                        @keyframes shake {
                            0%, 100% { transform: rotate(0deg); }
                            20% { transform: rotate(-4deg); }
                            25% { transform: rotate(4deg); }
                            30% { transform: rotate(-3deg); }
                            35% { transform: rotate(3deg); }
                            40% { transform: rotate(0deg); }
                        }
                        @keyframes shadow {
                            0%, 100% { transform: scaleX(1); opacity: 0.1; }
                            20%, 40% { transform: scaleX(0.85); opacity: 0.06; }
                        }
                        @keyframes fadeUpA {
                            0%, 100% { transform: translateY(0px); opacity: 0.6; }
                            50% { transform: translateY(-8px); opacity: 0.15; }
                        }
                        @keyframes fadeUpB {
                            0%, 100% { transform: translateY(0px); opacity: 0.5; }
                            50% { transform: translateY(-6px); opacity: 0.1; }
                        }
                    `}</style>
                </svg>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
                Access Denied
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
                You don't have permission to view this page. Please contact
                your administrator if you think this is a mistake.
            </p>
        </div>
    )
}
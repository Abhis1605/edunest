'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <div className="min-h-screen bg-background flex flex-col items-center
        justify-center px-6 text-center">

            {/* SVG Animation */}
            <div className="w-72 h-72 mb-6">
                <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full">

                    {/* Background circle */}
                    <circle cx="150" cy="150" r="120" fill="#0E9EAD"
                        fillOpacity="0.06" />
                    <circle cx="150" cy="150" r="90" fill="#0E9EAD"
                        fillOpacity="0.06" />

                    {/* Floating book */}
                    <g style={{
                        transformOrigin: '150px 130px',
                        animation: 'float 3s ease-in-out infinite',
                    }}>
                        {/* Book body */}
                        <rect x="100" y="95" width="100" height="75"
                            rx="4" fill="#0E9EAD" />
                        {/* Book spine */}
                        <rect x="100" y="95" width="8" height="75"
                            rx="2" fill="#0c8a98" />
                        {/* Book pages */}
                        <rect x="112" y="107" width="60" height="4"
                            rx="2" fill="white" fillOpacity="0.5" />
                        <rect x="112" y="117" width="50" height="4"
                            rx="2" fill="white" fillOpacity="0.5" />
                        <rect x="112" y="127" width="55" height="4"
                            rx="2" fill="white" fillOpacity="0.5" />
                        <rect x="112" y="137" width="45" height="4"
                            rx="2" fill="white" fillOpacity="0.5" />
                        <rect x="112" y="147" width="52" height="4"
                            rx="2" fill="white" fillOpacity="0.5" />
                    </g>

                    {/* 404 text */}
                    <text x="150" y="218" textAnchor="middle"
                        fontFamily="Helvetica, Arial, sans-serif"
                        fontWeight="bold" fontSize="48"
                        fill="#0E9EAD" fillOpacity="0.15"
                        letterSpacing="4">
                        404
                    </text>

                    {/* Question marks floating */}
                    <text x="80" y="105" fontFamily="Helvetica" fontSize="22"
                        fill="#0E9EAD" fillOpacity="0.7"
                        style={{ animation: 'fadeUpA 2.5s ease-in-out infinite' }}>
                        ?
                    </text>
                    <text x="210" y="120" fontFamily="Helvetica" fontSize="16"
                        fill="#2EAF4D" fillOpacity="0.6"
                        style={{ animation: 'fadeUpB 2.5s ease-in-out infinite 0.4s' }}>
                        ?
                    </text>
                    <text x="195" y="88" fontFamily="Helvetica" fontSize="13"
                        fill="#F97316" fillOpacity="0.6"
                        style={{ animation: 'fadeUpA 2.5s ease-in-out infinite 0.8s' }}>
                        ?
                    </text>

                    {/* Shadow under book */}
                    <ellipse cx="150" cy="185" rx="38" ry="6"
                        fill="#0E9EAD" fillOpacity="0.12"
                        style={{ animation: 'shadow 3s ease-in-out infinite' }}
                    />

                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-12px); }
                        }
                        @keyframes shadow {
                            0%, 100% { transform: scaleX(1); opacity: 0.12; }
                            50% { transform: scaleX(0.75); opacity: 0.06; }
                        }
                        @keyframes fadeUpA {
                            0%, 100% { transform: translateY(0px); opacity: 0.7; }
                            50% { transform: translateY(-8px); opacity: 0.2; }
                        }
                        @keyframes fadeUpB {
                            0%, 100% { transform: translateY(0px); opacity: 0.6; }
                            50% { transform: translateY(-6px); opacity: 0.15; }
                        }
                    `}</style>
                </svg>
            </div>

            {/* Text */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
                Page Not Found
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Looks like this page took a day off. The page you're looking
                for doesn't exist or has been moved.
            </p>

        </div>
    )
}
import React from 'react';

const Logo = ({ className = '' }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Cyan background circle */}
        <circle cx="45" cy="45" r="40" fill="#38BDF8" />

        {/* Pink chat bubble background */}
        <circle cx="55" cy="55" r="40" fill="#EC4899" />
        <path d="M 80 80 L 95 95 L 70 85 Z" fill="#EC4899" />

        {/* Main black circle */}
        <circle cx="50" cy="50" r="40" fill="#0A0A0A" />

        {/* White Stylized 'S' */}
        <text
            x="50"
            y="70"
            fontFamily="Arial, sans-serif"
            fontSize="55"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
        >
            S
        </text>
    </svg>
);

export default Logo;

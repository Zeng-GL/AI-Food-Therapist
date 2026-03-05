'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 128, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="64" cy="64" r="60" fill="#E8F5E9" stroke="#6C9A5D" strokeWidth="2"/>
      
      {/* Tongue Shape - Main Body */}
      <ellipse cx="64" cy="75" rx="35" ry="25" fill="#FF6B9D" opacity="0.9"/>
      
      {/* Tongue Shape - Top Curve */}
      <path
        d="M 29 75 Q 35 65, 45 60 Q 55 55, 64 55 Q 73 55, 83 60 Q 93 65, 99 75"
        stroke="#FF6B9D"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Health Leaf/Herb Symbol */}
      <path
        d="M 64 30 Q 70 25, 75 30 Q 70 35, 64 40 Q 58 35, 53 30 Q 58 25, 64 30 Z"
        fill="#6C9A5D"
        opacity="0.8"
      />
      <path
        d="M 64 30 L 64 40"
        stroke="#6C9A5D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* AI/Technology Symbol - Small Dots */}
      <circle cx="50" cy="50" r="2" fill="#6C9A5D" opacity="0.6"/>
      <circle cx="78" cy="50" r="2" fill="#6C9A5D" opacity="0.6"/>
      <circle cx="64" cy="45" r="2" fill="#6C9A5D" opacity="0.6"/>
      
      {/* Decorative Lines - Health Waves */}
      <path
        d="M 35 85 Q 40 90, 45 85 Q 50 90, 55 85"
        stroke="#6C9A5D"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 73 85 Q 78 90, 83 85 Q 88 90, 93 85"
        stroke="#6C9A5D"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}


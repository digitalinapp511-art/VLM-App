import React from "react";

interface GoldCoinsIconProps {
  className?: string;
  size?: number;
}

export function GoldCoinsIcon({ className = "", size = 24 }: GoldCoinsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <defs>
        {/* Deep background shadow */}
        <filter id="coin-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
        </filter>

        {/* 3D Emboss Shadow for Cap & Text */}
        <filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        {/* Rich multi-stop gold gradient for the main body */}
        <linearGradient id="gold-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDD3" />
          <stop offset="20%" stopColor="#FDE047" />
          <stop offset="45%" stopColor="#EAB308" />
          <stop offset="75%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D08" />
        </linearGradient>

        {/* High-contrast border ring gradient */}
        <linearGradient id="gold-ring" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#713F12" />
        </linearGradient>

        {/* Shiny reflective gradient curve */}
        <linearGradient id="gloss-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="30%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>

      {/* Main outer coin shadow and base */}
      <circle cx="50" cy="50" r="46" fill="url(#gold-body)" filter="url(#coin-shadow)" />

      {/* Double outer metallic rim ridges */}
      <circle cx="50" cy="50" r="45" stroke="url(#gold-ring)" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="43.5" stroke="#CA8A04" strokeWidth="0.5" opacity="0.6" />
      <circle cx="50" cy="50" r="40" stroke="url(#gold-ring)" strokeWidth="0.8" />

      {/* Star markers at 12, 3, 6, 9 o'clock */}
      <g fill="#A16207" opacity="0.85">
        {/* Top Star */}
        <path d="M50 12.5l0.8 1.6 1.8 0.2-1.3 1.3 0.3 1.8-1.6-0.8-1.6 0.8 0.3-1.8-1.3-1.3 1.8-0.2z" />
        {/* Right Star */}
        <path d="M87.5 50l0.8 1.6 1.8 0.2-1.3 1.3 0.3 1.8-1.6-0.8-1.6 0.8 0.3-1.8-1.3-1.3 1.8-0.2z" />
        {/* Bottom Star */}
        <path d="M50 87.5l0.8 1.6 1.8 0.2-1.3 1.3 0.3 1.8-1.6-0.8-1.6 0.8 0.3-1.8-1.3-1.3 1.8-0.2z" />
        {/* Left Star */}
        <path d="M12.5 50l0.8 1.6 1.8 0.2-1.3 1.3 0.3 1.8-1.6-0.8-1.6 0.8 0.3-1.8-1.3-1.3 1.8-0.2z" />
      </g>

      {/* Inner Ring Divider */}
      <circle cx="50" cy="50" r="38.5" stroke="#FEF08A" strokeWidth="0.5" opacity="0.5" />

      {/* Glossy lighting flare reflecting on the top-left side */}
      <path
        d="M10 50c0-22.1 17.9-40 40-40 10.3 0 19.6 3.9 26.7 10.3C66 12 55 17 40 32S12 66 10.3 76.7C10.1 71.3 10 50 10 50z"
        fill="url(#gloss-overlay)"
        opacity="0.6"
        pointerEvents="none"
      />

      {/* 🎓 Graduation Cap in the Center */}
      <g filter="url(#emboss)">
        {/* Top Diamond Rhombus */}
        <path
          d="M50 25.5L75 36.5L50 47.5L25 36.5L50 25.5Z"
          fill="#854D0E"
          stroke="#FEF08A"
          strokeWidth="0.8"
        />
        {/* Under Cap Base Shadow Depth */}
        <path
          d="M34.5 41v6.5c0 4.5 7 7.5 15.5 7.5s15.5-3 15.5-7.5V41l-15.5 5.5L34.5 41Z"
          fill="#713F12"
        />
        <path
          d="M34.5 41.5v6c0 4 7 7 15.5 7s15.5-3 15.5-7v-6"
          stroke="#FEF08A"
          strokeWidth="0.6"
          fill="none"
        />

        {/* Tassel String & Fringe */}
        <path
          d="M51.5 36.2s11.5 1.8 17.5 4v12"
          fill="none"
          stroke="#713F12"
          strokeWidth="1.2"
        />
        <path
          d="M51.5 36.2s11.5 1.8 17.5 4v12"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="0.4"
        />
        <path
          d="M66.5 52.2h5v4.5l-2.5 1.5-2.5-1.5z"
          fill="#713F12"
          stroke="#FEF08A"
          strokeWidth="0.4"
        />
      </g>

      {/* Embossed VLM brand text with shadow */}
      <g filter="url(#emboss)">
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fill="#713F12"
          fontSize="14.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >
          VLM
        </text>
        {/* Subtle inner highlight to give text a 3D metallic feel */}
        <text
          x="50.2"
          y="67.8"
          textAnchor="middle"
          fill="#FDE047"
          fontSize="14.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
          opacity="0.85"
        >
          VLM
        </text>
        {/* Front overlay core */}
        <text
          x="50"
          y="67.5"
          textAnchor="middle"
          fill="#854D0E"
          fontSize="14.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >
          VLM
        </text>
      </g>

      {/* Bottom Laurel Wreath (Leaves) */}
      <g fill="#854D0E" opacity="0.9" filter="url(#emboss)">
        {/* Left Laurel Branch */}
        <path d="M47.5 79.5c-0.2-0.2-0.5-0.2-0.7 0-2.5 2.2-6.5 2-9-0.5-2-2-3-4.8-3.2-7.5l2-0.5c0.2 2.2 1 4.5 2.6 6.1 1.8 1.8 4.8 2 6.8 0.3l1.5 2.1z" />
        <path d="M26 66.5c1-1.5 2.8-2 4.5-1.5 1.5 0.5 2.5 2 2.5 3.5s-1.5 2.5-3 2.5c-1.8 0-3.5-1.5-4-4.5z" />
        <path d="M29.5 71.5c1.2-1.2 3.2-1.5 4.5-0.5s1.8 2.8 1.2 4.2c-0.5 1.5-2 2-3.5 1.5s-2.5-2.2-2.2-5.2z" />
        <path d="M34.5 76c1.5-1 3.5-0.8 4.5 0.5s1 3.5-0.2 4.5c-1.2 1-2.8 0.8-3.8-0.5s-1.2-2.8-0.5-4.5z" />
        <path d="M40 79c1.5-0.8 3.5-0.2 4.2 1.2s0.2 3.5-1.2 4.2c-1.5 0.8-3.2 0.2-4-1.2s-0.2-3.5 1-4.2z" />

        {/* Right Laurel Branch */}
        <path d="M52.5 79.5c0.2-0.2 0.5-0.2 0.7 0 2.5 2.2 6.5 2 9-0.5 2-2 3-4.8 3.2-7.5l-2-0.5c-0.2 2.2-1 4.5-2.6 6.1-1.8 1.8-4.8 2-6.8 0.3l-1.5 2.1z" />
        <path d="M74 66.5c-1-1.5-2.8-2-4.5-1.5-1.5 0.5-2.5 2-2.5 3.5s1.5 2.5 3 2.5c1.8 0 3.5-1.5 4-4.5z" />
        <path d="M70.5 71.5c-1.2-1.2-3.2-1.5-4.5-0.5s-1.8 2.8-1.2 4.2c0.5 1.5 2 2 3.5 1.5s2.5-2.2 2.2-5.2z" />
        <path d="M65.5 76c-1.5-1-3.5-0.8-4.5 0.5s-1 3.5 0.2 4.5c1.2 1 2.8 0.8 3.8-0.5s1.2-2.8 0.5-4.5z" />
        <path d="M60 79c-1.5-0.8-3.5-0.2-4.2 1.2s-0.2 3.5 1.2 4.2c1.5 0.8 3.2 0.2 4-1.2s0.2-3.5-1-4.2z" />
      </g>
    </svg>
  );
}

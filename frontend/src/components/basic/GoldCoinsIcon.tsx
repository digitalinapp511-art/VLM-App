interface GoldCoinsIconProps {
  className?: string;
  size?: number;
}

export function GoldCoinsIcon({ className = "", size = 24 }: GoldCoinsIconProps) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow layer for depth */}
      <ellipse cx="12" cy="18.5" rx="8" ry="2.5" fill="rgba(0,0,0,0.3)" filter="blur(1px)" />

      {/* Bottom Coin Stack Shadow */}
      <path d="M4 14v2c0 1.66 3.58 3 8 3s8-1.34 8-3v-2" fill="#B45309" />
      
      {/* Bottom Coin Stack Body */}
      <path d="M4 13.5v2c0 1.66 3.58 3 8 3s8-1.34 8-3v-2" fill="#D97706" />
      <ellipse cx="12" cy="13.5" rx="8" ry="2.5" fill="#F59E0B" />

      {/* Middle Coin Stack Shadow */}
      <path d="M4 10v2c0 1.66 3.58 3 8 3s8-1.34 8-3v-2" fill="#D97706" />
      
      {/* Middle Coin Stack Body */}
      <path d="M4 9.5v2c0 1.66 3.58 3 8 3s8-1.34 8-3v-2" fill="#F59E0B" />
      <ellipse cx="12" cy="9.5" rx="8" ry="2.5" fill="#FBBF24" />

      {/* Top Coin Stack Shadow */}
      <path d="M4 6v2c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="#F59E0B" />
      
      {/* Top Coin Stack Body */}
      <path d="M4 5.5v2c0 1.66 3.58 3 8 3s8-1.34 8-3v-2" fill="#FBBF24" />
      <ellipse cx="12" cy="5.5" rx="8" ry="2.5" fill="#FDE047" />
      <ellipse cx="12" cy="5.5" rx="6" ry="1.8" fill="#FFF9C4" opacity="0.6" />
    </svg>
  );
}

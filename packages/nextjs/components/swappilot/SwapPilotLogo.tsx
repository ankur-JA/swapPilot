import React from "react";

interface SwapPilotLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export const SwapPilotLogo = ({ 
  className = "", 
  size = "md", 
  showText = true 
}: SwapPilotLogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl", 
    xl: "text-4xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 32 32"
          className={`${sizeClasses[size]} text-primary`}
          fill="currentColor"
        >
          {/* Main circle background */}
          <circle cx="16" cy="16" r="14" fill="url(#gradient)" />
          
          {/* Arrow elements representing swap */}
          <path
            d="M8 12 L16 8 L24 12 L20 16 L12 16 Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M8 20 L16 24 L24 20 L20 16 L12 16 Z"
            fill="white"
            opacity="0.7"
          />
          
          {/* Central dot */}
          <circle cx="16" cy="16" r="2" fill="white" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          SwapPilot
        </span>
      )}
    </div>
  );
};

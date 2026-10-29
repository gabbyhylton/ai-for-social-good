import React from "react";

interface FygsLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "app-icon" | "fig-mark";
  className?: string;
}

/**
 * Custom fygs Logo & App Icon:
 * - "app-icon": Rounded-square deep forest emerald tile (#0F4C35 / #1A531A) with the split
 *   botanical halved terracotta fig (#BD735A) on the left and sprouting cream leaf branch (#F4F0E0) on the right.
 * - "fig-mark": Minimalist whole terracotta fig (#BD735A) with white highlight curve and forest emerald fig leaf (#1A531A).
 */
export const FygsLogo: React.FC<FygsLogoProps> = ({
  size = "md",
  variant = "app-icon",
  className = "",
}) => {
  const dimensions =
    size === "lg"
      ? "w-12 h-12 rounded-[14px]"
      : size === "md"
      ? "w-9 h-9 rounded-[11px]"
      : "w-7 h-7 rounded-[9px]";

  const svgSize =
    size === "lg" ? "w-9 h-9" : size === "md" ? "w-7 h-7" : "w-5 h-5";

  if (variant === "fig-mark") {
    return (
      <div
        className={`${dimensions} bg-[#FAF9F5] border border-[#E6E1D6] flex items-center justify-center shadow-2xs shrink-0 relative overflow-hidden ${className}`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgSize}
        >
          {/* Stem */}
          <path
            d="M15.5 7.5C15.5 9.2 16.3 10.6 16.5 11.8"
            stroke="#1A531A"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Botanical Fig Leaf on Top Right */}
          <path
            d="M18.8 11.8C18.5 9.3 20.1 7.2 21.8 7.5C22.4 6.2 24.4 6.2 24.6 7.9C26.2 7.5 27.5 9.2 26.1 10.5C27.2 11.5 26.2 13.2 24.3 12.8C23.5 14 21.2 13.8 20.5 12.6L18.8 11.8Z"
            fill="#1A531A"
          />
          <path
            d="M19.2 11.6L23.8 9.2"
            stroke="#FAF9F5"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Terracotta Fig Body */}
          <path
            d="M16.5 11.5C14.8 11.5 13.8 13.4 12.2 15.5C9.8 18.6 8.8 21.2 8.8 24.2C8.8 28.5 12.2 31.5 16.5 31.5C20.8 31.5 24.2 28.5 24.2 24.2C24.2 21.2 23.2 18.6 20.8 15.5C19.2 13.4 18.2 11.5 16.5 11.5Z"
            fill="#BD735A"
          />
          {/* Inner Cream Highlight Curve */}
          <path
            d="M12.2 19.5C10.9 21.6 10.8 24.8 12.3 27.4"
            stroke="#FAF9F5"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} bg-[#0F4C35] text-[#F4F0E0] flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden border border-[#1A531A] ${className}`}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgSize}
      >
        {/* Left Half: Cream Fig Rind Outer Silhouette */}
        <path
          d="M17.2 6.8V29.5C11.2 29.5 6.8 25.2 6.8 19.6C6.8 15.4 9.5 12.5 12.6 10.2C14.4 8.9 15.5 7.9 15.8 6.8H17.2Z"
          fill="#F4F0E0"
        />
        {/* Left Half: Terracotta Fig Flesh */}
        <path
          d="M17.2 12.2V27.4C12.5 27.4 9.1 24.1 9.1 19.8C9.1 16.2 11.8 12.8 17.2 12.2Z"
          fill="#D4896E"
        />
        {/* Left Half: Deep Terracotta Core */}
        <path
          d="M17.2 16.2V23.6C14.5 23.6 12.6 21.9 12.6 19.9C12.6 17.9 14.5 16.2 17.2 16.2Z"
          fill="#B36247"
        />
        {/* Fig Seeds / Rays */}
        <circle cx="15.2" cy="18.2" r="0.7" fill="#F4F0E0" />
        <circle cx="14.3" cy="20.0" r="0.7" fill="#F4F0E0" />
        <circle cx="15.3" cy="21.7" r="0.7" fill="#F4F0E0" />
        <circle cx="12.2" cy="16.8" r="0.65" fill="#F4F0E0" />
        <circle cx="11.2" cy="19.6" r="0.65" fill="#F4F0E0" />
        <circle cx="12.3" cy="22.8" r="0.65" fill="#F4F0E0" />

        {/* Right Half Lower Terracotta Bowl Accent */}
        <path
          d="M20.2 29.3C24.8 28.6 28.2 24.8 28.2 19.8H24.2C24.2 23.8 21.8 26.8 20.2 29.3Z"
          fill="#D4896E"
        />

        {/* Right Half: Cream Sprouting Botanical Stem & Leaves */}
        <path
          d="M19.0 29.5C19.0 23.0 20.5 16.8 24.8 11.5"
          stroke="#F4F0E0"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        {/* Top Right Leaf */}
        <path
          d="M23.5 13.2C23.5 9.6 26.5 7.4 29.8 7.4C29.8 11.0 27.2 13.5 23.5 13.2Z"
          fill="#F4F0E0"
        />
        {/* Upper Left Leaf */}
        <path
          d="M20.8 17.5C18.5 14.8 18.8 11.5 20.6 9.5C22.8 11.6 22.8 15.0 20.8 17.5Z"
          fill="#F4F0E0"
        />
        {/* Mid Right Leaf */}
        <path
          d="M21.8 18.5C24.2 15.8 27.6 15.8 30.0 17.8C27.5 20.2 24.2 20.0 21.8 18.5Z"
          fill="#F4F0E0"
        />
        {/* Lower Right Leaf */}
        <path
          d="M19.6 24.5C20.8 21.2 23.5 19.8 26.4 20.2C25.5 23.4 22.8 24.8 19.6 24.5Z"
          fill="#F4F0E0"
        />
      </svg>
    </div>
  );
};

export const GemPrintLogo = FygsLogo;

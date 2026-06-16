import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  rounded?: boolean;
};

export function SafeImage({ src, alt, className = "", fallbackText, rounded }: Props) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    const initials = (fallbackText ?? alt)
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div
        className={`flex items-center justify-center bg-brand text-white font-extrabold ${rounded ? "rounded-full" : "rounded-2xl"} ${className}`}
        aria-label={alt}
      >
        {initials || "🐾"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className={`${rounded ? "rounded-full" : "rounded-2xl"} object-cover ${className}`}
      loading="lazy"
    />
  );
}

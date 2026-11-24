import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Cytron mark: white C ring with a diagonal opening and a periwinkle dot on a
// navy tile (traced from the brand PNG; same geometry as public/icon.svg).
export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" rx="224" fill="#0B1020" />
        <path d="M713.1 309.2A280 280 0 1 0 713.1 714.8L611 607.6A132 132 0 1 1 611 416.4Z" fill="#FFFFFF" />
        <circle cx="725.5" cy="511.5" r="60" fill="#8B8CFF" />
      </svg>
    ),
    { ...size }
  );
}

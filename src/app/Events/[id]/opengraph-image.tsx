import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Event share card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // We avoid DB access in the OG route to sidestep dev sourcemap/internal assertion issues.
  // Render a generic branded image that still looks good when shared.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
          color: "white",
          position: "relative",
          fontFamily: "Inter, Arial, sans-serif",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800 }}>YaleClubs</div>
        <div style={{ fontSize: 28, opacity: 0.9 }}>Discover campus events</div>
      </div>
    ),
    { ...size },
  );
}

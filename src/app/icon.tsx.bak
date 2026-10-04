import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          borderRadius: "8px",
          fontFamily: "sans-serif",
          boxShadow: "inset 0 0 2px rgba(255,255,255,0.4)",
        }}
      >
        ES
      </div>
    ),
    {
      ...size,
    }
  );
}

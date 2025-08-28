import React, { useRef, useState } from "react";

export default function GraphicsAnalyzer() {
  const [image, setImage] = useState(null);
  const [pixel, setPixel] = useState(null);
  const canvasRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const getPixel = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const data = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = data;
    setPixel({ x, y, r, g, b, a });
  };

  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Graphics Analyzer</h2>

      <input type="file" accept="image/*" onChange={handleFile} />

      {image && (
        <div>
          <canvas
            ref={canvasRef}
            onClick={getPixel}
            className="border rounded shadow"
          />
          <img
            src={image}
            alt="uploaded"
            className="hidden"
            onLoad={(e) => {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");
              canvas.width = e.target.width;
              canvas.height = e.target.height;
              ctx.drawImage(e.target, 0, 0);
            }}
          />
        </div>
      )}

      {pixel && (
        <div className="p-2 bg-gray-100 rounded">
          <p><b>Pixel:</b> ({pixel.x}, {pixel.y})</p>
          <p><b>RGB:</b> {pixel.r}, {pixel.g}, {pixel.b}</p>
          <p><b>HEX:</b> {rgbToHex(pixel.r, pixel.g, pixel.b)}</p>
          <p>
            <b>HSV:</b>{" "}
            {(() => {
              const { h, s, v } = rgbToHsv(pixel.r, pixel.g, pixel.b);
              return `${h}°, ${s}%, ${v}%`;
            })()}
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState, useEffect } from "react";

/**
 * Number & Text Representation Lab
 * ------------------------------------------------------
 * A single-file React component for teaching binary/hex/decimal,
 * ASCII/Unicode code points, and UTF‑8 bytes with interactive bits.
 *
 * Styling: TailwindCSS classes (no import required in Canvas preview).
 * No external UI libraries required.
 */

// ---------- helpers ----------
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const padLeft = (s, len, ch = "0") => (s + "").padStart(len, ch);
const groupEvery = (s, n, sep = " ") => s.replace(new RegExp(`(.{${n}})`, "g"), "$1 ").trim();

const toUnsigned = (n, bits) => {
  const max = 2 ** bits - 1;
  n = Number(n);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) {
    // wrap like two's complement
    return ((n % (max + 1)) + (max + 1)) % (max + 1);
  }
  return clamp(n, 0, max);
};

const unsignedToSigned = (u, bits) => {
  const max = 2 ** bits;
  return u >= max / 2 ? u - max : u;
};

const toHex = (u, bits) => padLeft(u.toString(16).toUpperCase(), Math.ceil(bits / 4));
const toBin = (u, bits) => padLeft(u.toString(2), bits);

const parseFromBase = (str, base) => {
  if (str === "" || str == null) return NaN;
  const cleaned = String(str).trim();
  const n = parseInt(cleaned, base);
  return Number.isNaN(n) ? NaN : n;
};

const byteArrayToGroupedBinary = (bytes) => bytes.map(b => groupEvery(padLeft(b.toString(2), 8), 4)).join("  ");

const utf8Bytes = (str) => Array.from(new TextEncoder().encode(str || ""));

const codePoints = (str) => Array.from(str || "", ch => ch.codePointAt(0));

const copy = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
};

// ---------- main component ----------
export default function NumberTextLab() {
  // app state
  const [tab, setTab] = useState("number"); // 'number' | 'text'

  // Number tab state
  const [bits, setBits] = useState(8); // 8 | 16 | 32
  const [unsignedValue, setUnsignedValue] = useState(65);
  const [challenge, setChallenge] = useState(null); // {target, bits}
  const maxVal = 2 ** bits - 1;

  // Text tab state
  const [text, setText] = useState("Hello 👋");

  // keep number fields in sync
  const signedValue = useMemo(() => unsignedToSigned(unsignedValue, bits), [unsignedValue, bits]);
  const hexValue = useMemo(() => toHex(unsignedValue, bits), [unsignedValue, bits]);
  const binValue = useMemo(() => toBin(unsignedValue, bits), [unsignedValue, bits]);

  const bytesBE = useMemo(() => {
    const bytes = [];
    let val = unsignedValue >>> 0;
    const totalBytes = Math.ceil(bits / 8);
    for (let i = totalBytes - 1; i >= 0; i--) {
      bytes.push((val >>> (i * 8)) & 0xff);
    }
    return bytes;
  }, [unsignedValue, bits]);

  const bytesLE = useMemo(() => [...bytesBE].reverse(), [bytesBE]);

  const setFromDecimal = (str) => {
    const n = Number(str);
    if (Number.isFinite(n)) setUnsignedValue(toUnsigned(n, bits));
  };
  const setFromHex = (str) => {
    const n = parseFromBase(str, 16);
    if (Number.isFinite(n)) setUnsignedValue(toUnsigned(n, bits));
  };
  const setFromBinary = (str) => {
    const n = parseFromBase(str.replace(/\s+/g, ""), 2);
    if (Number.isFinite(n)) setUnsignedValue(toUnsigned(n, bits));
  };

  const toggleBit = (i) => {
    // i: bit index from MSB=bits-1 to LSB=0 in UI mapping
    const mask = 1 << (bits - 1 - i);
    const next = unsignedValue ^ mask;
    setUnsignedValue(toUnsigned(next, bits));
  };

  const makeChallenge = () => {
    const t = Math.floor(Math.random() * (2 ** bits));
    setChallenge({ target: t, bits });
  };

  const challengeCorrect = challenge && unsignedValue === challenge.target && bits === challenge.bits;

  useEffect(() => {
    // Reset challenge if bit-width changes to avoid confusion
    setChallenge(null);
  }, [bits]);

  // Text derived data
  const cps = useMemo(() => codePoints(text), [text]);
  const utf8 = useMemo(() => utf8Bytes(text), [text]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Number & Text Representation Lab</h1>
          <div className="inline-flex rounded-2xl bg-white shadow-sm p-1">
            {[
              { id: "number", label: "Numbers" },
              { id: "text", label: "Text & Unicode" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                  tab === t.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {tab === "number" ? (
          <section className="space-y-6">
            {/* Controls */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <h2 className="font-semibold mb-3">Bit Width</h2>
                <div className="flex gap-2">
                  {[8, 16, 32].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBits(b)}
                      className={`px-3 py-1.5 rounded-xl border text-sm ${
                        bits === b
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {b}‑bit
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Range: 0 … {maxVal.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <h2 className="font-semibold mb-3">Enter a Value</h2>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-xs uppercase tracking-wide text-slate-500">Decimal</label>
                  <input
                    type="number"
                    className="col-span-2 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    min={0}
                    max={maxVal}
                    value={unsignedValue}
                    onChange={(e) => setFromDecimal(e.target.value)}
                  />

                  <label className="text-xs uppercase tracking-wide text-slate-500">Hex</label>
                  <input
                    type="text"
                    className="col-span-2 w-full rounded-xl border border-slate-300 px-3 py-2 uppercase"
                    value={hexValue}
                    onChange={(e) => setFromHex(e.target.value)}
                  />

                  <label className="text-xs uppercase tracking-wide text-slate-500">Binary</label>
                  <input
                    type="text"
                    className="col-span-2 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                    value={groupEvery(binValue, 4)}
                    onChange={(e) => setFromBinary(e.target.value)}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxVal}
                  step={1}
                  value={unsignedValue}
                  onChange={(e) => setUnsignedValue(Number(e.target.value))}
                  className="w-full mt-4"
                />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <h2 className="font-semibold mb-3">Views</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Unsigned</div>
                    <div className="text-xl font-semibold">{unsignedValue}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Signed (two's complement)</div>
                    <div className="text-xl font-semibold">{signedValue}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                    <div className="text-xs text-slate-500">Hex</div>
                    <div className="text-xl font-semibold font-mono">0x{groupEvery(hexValue, 2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bits panel */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Flip the Bits</h2>
                <div className="text-xs text-slate-500">MSB → LSB</div>
              </div>
              <div className="grid grid-cols-8 gap-2 text-center">
                {Array.from({ length: bits }).map((_, i) => {
                  const bitIndex = bits - 1 - i; // actual bit position
                  const mask = 1 << bitIndex;
                  const on = (unsignedValue & mask) !== 0;
                  const weight = 1 << bitIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => toggleBit(i)}
                      className={`rounded-xl p-3 border text-sm font-semibold transition select-none ${
                        on
                          ? "bg-slate-900 text-white border-slate-900 shadow"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-normal opacity-70">{weight}</div>
                      <div className="text-lg font-mono">{on ? 1 : 0}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Binary (grouped): <span className="font-mono">{groupEvery(binValue, 4)}</span>
              </div>
            </div>

            {/* Endianness & bytes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-semibold mb-2">Big‑Endian Bytes</h3>
                <div className="flex gap-2 flex-wrap">
                  {bytesBE.map((b, idx) => (
                    <div key={idx} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">byte {idx}</div>
                      <div className="font-mono">0x{padLeft(b.toString(16).toUpperCase(), 2)}</div>
                      <div className="font-mono text-xs">{groupEvery(padLeft(b.toString(2), 8), 4)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <h3 className="font-semibold mb-2">Little‑Endian Bytes</h3>
                <div className="flex gap-2 flex-wrap">
                  {bytesLE.map((b, idx) => (
                    <div key={idx} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">byte {idx}</div>
                      <div className="font-mono">0x{padLeft(b.toString(16).toUpperCase(), 2)}</div>
                      <div className="font-mono text-xs">{groupEvery(padLeft(b.toString(2), 8), 4)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Challenge game */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Class Challenge</h3>
                <button
                  onClick={makeChallenge}
                  className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50"
                >New Target</button>
              </div>
              {challenge ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-slate-700">
                    Target ({challenge.bits}-bit):
                    <span className="ml-2 font-mono">dec {challenge.target}</span>
                    <span className="ml-2 font-mono">hex 0x{padLeft(challenge.target.toString(16).toUpperCase(), Math.ceil(challenge.bits/4))}</span>
                    <span className="ml-2 font-mono">bin {groupEvery(padLeft(challenge.target.toString(2), challenge.bits), 4)}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    challengeCorrect ? "bg-green-600 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                    {challengeCorrect ? "✔ Correct!" : "Flip bits or type until it matches."}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Click “New Target” and have students race to match it using sliders or bit buttons.</p>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            {/* Text input */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h2 className="font-semibold mb-3">Type Text (ASCII, Unicode, Emojis)</h2>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[96px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type here…"
              />
              <div className="mt-3 text-sm text-slate-600">Characters: {Array.from(text || "").length}</div>
            </div>

            {/* Code points table */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 overflow-x-auto">
              <h3 className="font-semibold mb-3">Code Points</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2 pr-4">Char</th>
                    <th className="py-2 pr-4">Name (approx)</th>
                    <th className="py-2 pr-4">U+ (hex)</th>
                    <th className="py-2 pr-4">Decimal</th>
                    <th className="py-2 pr-4">Binary</th>
                    <th className="py-2 pr-4">Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {cps.length === 0 ? (
                    <tr><td colSpan={6} className="py-3 text-slate-500">(No characters)</td></tr>
                  ) : (
                    cps.map((cp, idx) => {
                      const ch = Array.from(text)[idx];
                      const hex = cp.toString(16).toUpperCase();
                      const dec = cp;
                      const bin = groupEvery(padLeft(cp.toString(2), Math.max(8, Math.ceil(Math.log2(cp + 1)))) , 4);
                      const approxName = /[A-Za-z\d]/.test(ch)
                        ? "Basic Latin"
                        : ch === " "
                        ? "Space"
                        : cp >= 0x1f600 && cp <= 0x1f64f
                        ? "Emoji (Emoticons)"
                        : cp >= 0x1F300 && cp <= 0x1F5FF
                        ? "Emoji (Misc Symbols & Pictographs)"
                        : "Unicode";
                      return (
                        <tr key={idx} className="border-t border-slate-200">
                          <td className="py-2 pr-4 text-lg">{ch}</td>
                          <td className="py-2 pr-4 text-slate-600">{approxName}</td>
                          <td className="py-2 pr-4 font-mono">U+{hex}</td>
                          <td className="py-2 pr-4 font-mono">{dec}</td>
                          <td className="py-2 pr-4 font-mono">{bin}</td>
                          <td className="py-2 pr-4">
                            <button
                              onClick={() => copy(`U+${hex}`)}
                              className="px-2 py-1 rounded-lg text-xs border hover:bg-slate-50"
                            >copy U+</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* UTF‑8 bytes view */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">UTF‑8 Bytes</h3>
                <button
                  onClick={() => copy(utf8.map(b => "0x" + padLeft(b.toString(16).toUpperCase(), 2)).join(" "))}
                  className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 text-sm"
                >Copy as hex</button>
              </div>
              {utf8.length === 0 ? (
                <p className="text-sm text-slate-600">(No bytes)</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {utf8.map((b, i) => (
                    <div key={i} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500">byte {i}</div>
                      <div className="font-mono">0x{padLeft(b.toString(16).toUpperCase(), 2)}</div>
                      <div className="font-mono text-xs">{groupEvery(padLeft(b.toString(2), 8), 4)}</div>
                      <div className="text-xs text-slate-600">{b}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">UTF‑8 encodes each Unicode code point into 1–4 bytes. ASCII characters fit in one byte.</p>
            </div>

            {/* Decoder mini‑tool */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-2">Mini Decoder</h3>
              <p className="text-sm text-slate-600 mb-2">Paste hex bytes (e.g., <span className="font-mono">48 65 6C 6C 6F F0 9F 91 8B</span>) and decode as UTF‑8.</p>
              <DecoderTool />
            </div>
          </section>
        )}

        <footer className="mt-8 text-xs text-slate-500">
          Built for classroom demos: sliders, bit flips, endianness, code points, and UTF‑8 bytes. Try switching to 16/32‑bit and typing emojis.
        </footer>
      </div>
    </div>
  );
}

function DecoderTool() {
  const [hexInput, setHexInput] = useState("48 65 6C 6C 6F 20 F0 9F 91 8B");
  const [decoded, setDecoded] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const bytes = hexInput
        .replace(/0x/gi, " ")
        .replace(/[^0-9a-fA-F]/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((h) => parseInt(h, 16));
      const arr = new Uint8Array(bytes);
      const text = new TextDecoder().decode(arr);
      setDecoded(text);
      setError("");
    } catch (e) {
      setDecoded("");
      setError("Invalid UTF‑8 or hex format");
    }
  }, [hexInput]);

  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <textarea
        className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[96px] font-mono"
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
      />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 min-h-[96px]">
        <div className="text-xs text-slate-500 mb-1">Decoded text</div>
        <div className="text-slate-900 whitespace-pre-wrap break-words">{decoded}</div>
        {error && <div className="text-rose-600 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
}

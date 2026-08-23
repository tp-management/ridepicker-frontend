export default function QRPlaceholder({ seed = "ridepicker" }) {
  const N = 21;

  // Deterministic PRNG seeded by the QR id, so each QR looks distinct and
  // visibly changes when the backend rotates it.
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  if (s === 0) s = 12345;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const inFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);

  const finderOn = (x, y) => {
    const ox = x >= N - 7 ? N - 7 : 0;
    const oy = y >= N - 7 ? N - 7 : 0;
    const lx = x - ox;
    const ly = y - oy;
    const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6;
    const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
    return edge || core;
  };

  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const on = inFinder(x, y) ? finderOn(x, y) : rand() > 0.52;
      cells.push(on);
    }
  }

  return (
    <div
      className="grid rounded-lg border border-slate-200 bg-white p-3"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, width: 208, height: 208 }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}
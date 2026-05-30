/* Homework Intel — Tweaks Panel */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ff6a1f",
  "theme": "light",
  "threeD": "med",
  "rotSpeed": 24,
  "gridDensity": 64
}/*EDITMODE-END*/;

function HiTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  React.useEffect(() => {
    root.style.setProperty('--accent', t.accent);
    // Derive a darker variant for the gradient/hover
    root.style.setProperty('--accent-deep', shade(t.accent, -0.25));
    root.style.setProperty('--accent-soft', hexToRgba(t.accent, 0.12));
  }, [t.accent]);

  React.useEffect(() => {
    root.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  React.useEffect(() => {
    root.setAttribute('data-3d', t.threeD);
  }, [t.threeD]);

  React.useEffect(() => {
    root.style.setProperty('--rot-speed', t.rotSpeed + 's');
  }, [t.rotSpeed]);

  React.useEffect(() => {
    root.style.setProperty('--grid-size', t.gridDensity + 'px');
  }, [t.gridDensity]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakRadio
        label="Mode"
        value={t.theme}
        options={['dark', 'light']}
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakColor
        label="Accent"
        value={t.accent}
        options={['#ff6a1f', '#b8702a', '#39d18d', '#4aa8ff', '#e84a5f', '#f0eee8']}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Motion · 3D" />
      <TweakRadio
        label="3D intensity"
        value={t.threeD}
        options={['low', 'med', 'high']}
        onChange={(v) => setTweak('threeD', v)}
      />
      <TweakSlider
        label="Drone rotation"
        value={t.rotSpeed}
        min={6} max={60} step={1} unit="s"
        onChange={(v) => setTweak('rotSpeed', v)}
      />
      <TweakSlider
        label="Grid density"
        value={t.gridDensity}
        min={24} max={120} step={4} unit="px"
        onChange={(v) => setTweak('gridDensity', v)}
      />
    </TweaksPanel>
  );
}

/* ---------- helpers ---------- */
function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  let r = parseInt(n.slice(0, 2), 16);
  let g = parseInt(n.slice(2, 4), 16);
  let b = parseInt(n.slice(4, 6), 16);
  r = Math.max(0, Math.min(255, Math.round(r + r * amt)));
  g = Math.max(0, Math.min(255, Math.round(g + g * amt)));
  b = Math.max(0, Math.min(255, Math.round(b + b * amt)));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/* ---------- Mount ---------- */
const tweaksMount = document.createElement('div');
tweaksMount.id = '__tweaks_mount';
document.body.appendChild(tweaksMount);
ReactDOM.createRoot(tweaksMount).render(<HiTweaks />);

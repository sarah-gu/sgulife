// app.jsx
// Hero brain landing — the brain IS the page. A large, luminous,
// detailed top-down brain centered in the canvas, with five glowing hub
// neurons placed on anatomical regions. Synapses arc between them and fire.
// A small wordmark, a tiny status, and a single ask-bar — nothing else
// competes with the brain.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showCaption": true,
  "synthesisStyle": "patterns"
}/*EDITMODE-END*/;

const ICE = {
  bg1: '#050810',
  hi:  '#e6f4ff',
  mid: 'rgba(190, 220, 255, 0.78)',
  low: 'rgba(190, 220, 255, 0.45)',
  hairline: 'rgba(140, 200, 255, 0.18)',
  accent: '#9cd5ff',
};

function BrainPage({ showCaption, mode = '2d' }) {
  const [hover, setHover] = React.useState(null);
  const [expanded, setExpanded] = React.useState(null);
  const [anchor, setAnchor] = React.useState({ x: 0.5, y: 0.5 });
  const [route, setRoute] = React.useState('brain');
  const [askValue, setAskValue] = React.useState('');
  const wrapRef = React.useRef(null);

  // Convert the clicked hub's screen position into a 0..1 anchor for the
  // panel "grow from neuron" animation.
  const onHubClick = (idx) => {
    const r = wrapRef.current.getBoundingClientRect();
    const labelEl = wrapRef.current.querySelector(`[data-hub-idx="${idx}"]`);
    if (labelEl) {
      const lr = labelEl.getBoundingClientRect();
      setAnchor({
        x: ((lr.left + lr.width / 2) - r.left) / r.width,
        y: ((lr.top + lr.height / 2) - r.top) / r.height,
      });
    }
    setExpanded(idx);
  };

  return (
    <div ref={wrapRef} style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `radial-gradient(ellipse at 50% 45%, #0d1830 0%, ${ICE.bg1} 65%, #02040a 100%)`,
      color: ICE.mid,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {route === 'brain' ? (
        <>
          {/* Vignette — pulls the eye to center */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
            zIndex: 2,
          }} />
          <Grain />

          {/* THE BRAIN — full-bleed, the visual hero */}
          {mode === '3d' ? (
            <Brain3D
              onHubHover={setHover}
              onHubClick={onHubClick}
              activeHub={hover}
              expandedHub={expanded}
            />
          ) : (
            <Brain
              onHubHover={setHover}
              onHubClick={onHubClick}
              activeHub={hover}
              expandedHub={expanded}
            />
          )}

          {/* Top-left wordmark */}
          <div style={{
            position: 'absolute', top: 28, left: 36, zIndex: 5,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: 3,
              background: ICE.accent,
              boxShadow: `0 0 12px ${ICE.accent}`,
            }} />
            <div style={{
              fontSize: 11, letterSpacing: 2.6, textTransform: 'lowercase',
              color: ICE.low, fontWeight: 400,
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            }}>brain</div>
          </div>

          {/* Top-right — date + sync status */}
          <div style={{
            position: 'absolute', top: 28, right: 36, zIndex: 5,
            textAlign: 'right',
            fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
            color: ICE.low,
          }}>
            <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            <div style={{ marginTop: 4, opacity: 0.65 }}>
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: 3,
                background: ICE.accent, marginRight: 6, verticalAlign: 'middle',
                boxShadow: `0 0 8px ${ICE.accent}`,
              }} />
              all sources synced
            </div>
          </div>

          {/* Hero caption — beneath the brain, sets the metaphor */}
          {showCaption && expanded === null && (
            <div style={{
              position: 'absolute', left: '50%', top: 64,
              transform: 'translateX(-50%)',
              zIndex: 4, textAlign: 'center', pointerEvents: 'none',
              opacity: hover === null ? 1 : 0.4,
              transition: 'opacity 0.4s ease',
            }}>
              <div style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 26, lineHeight: 1.15, fontWeight: 300,
                color: ICE.hi, letterSpacing: 0.3, fontStyle: 'italic',
                textWrap: 'balance', maxWidth: 540, margin: '0 auto',
              }}>
                your second mind
              </div>
              <div style={{
                fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase',
                color: ICE.low, marginTop: 10, fontWeight: 400,
              }}>traverse a region · ask anything</div>
            </div>
          )}

          {/* Bottom hint — "click a glowing region" */}
          {expanded === null && hover === null && (
            <div style={{
              position: 'absolute', left: '50%', bottom: 134,
              transform: 'translateX(-50%)',
              zIndex: 3, pointerEvents: 'none',
              fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase',
              color: ICE.low, fontWeight: 400,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'caption-fade 0.6s ease',
            }}>
              <style>{`@keyframes caption-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
              <span style={{ width: 30, height: 0.5, background: ICE.hairline }} />
              {mode === '3d' ? 'drag to rotate · click a hub' : 'click a glowing region'}
              <span style={{ width: 30, height: 0.5, background: ICE.hairline }} />
            </div>
          )}

          {hover !== null && expanded === null && <HoverChip catIdx={hover} />}

          {expanded === null && <FloatingThoughts />}

          {expanded !== null && (
            <NeuronPanel
              catIdx={expanded}
              anchor={anchor}
              onClose={() => setExpanded(null)}
              onOpenDetail={(catId) => { if (catId === 'health') setRoute('health'); }}
            />
          )}

          <AskBar value={askValue} onChange={setAskValue} disabled={expanded !== null} />
        </>
      ) : (
        <HealthDetail onBack={() => { setRoute('brain'); setExpanded(null); }} />
      )}
    </div>
  );
}

function HoverChip({ catIdx }) {
  const cat = BRAIN_CATEGORIES[catIdx];
  return (
    <div style={{
      position: 'absolute', bottom: 112, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 4, pointerEvents: 'none',
      padding: '10px 18px',
      background: 'rgba(12, 20, 36, 0.65)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      border: `0.5px solid ${ICE.hairline}`,
      borderRadius: 999,
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'chip-in 0.3s ease',
    }}>
      <style>{`@keyframes chip-in { from { opacity: 0; transform: translate(-50%, 6px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: ICE.accent, boxShadow: `0 0 10px ${ICE.accent}` }} />
      <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16, color: ICE.hi, letterSpacing: 0.3 }}>{cat.label}</span>
      <span style={{ fontSize: 10, color: ICE.accent, opacity: 0.65, letterSpacing: 1.4, textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>{cat.region}</span>
      <span style={{ fontSize: 11, color: ICE.accent, opacity: 0.85, letterSpacing: 0.8 }}>{cat.stat}</span>
      <span style={{ fontSize: 11, color: ICE.low, fontStyle: 'italic' }}>· {cat.recent}</span>
    </div>
  );
}

function AskBar({ value, onChange, disabled }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 5, width: 'min(560px, 80%)',
      opacity: disabled ? 0 : 1,
      transition: 'opacity 0.4s ease',
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px',
        background: focused ? 'rgba(16, 24, 44, 0.82)' : 'rgba(12, 20, 36, 0.62)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: focused ? `0.5px solid ${ICE.accent}` : `0.5px solid ${ICE.hairline}`,
        borderRadius: 999,
        boxShadow: focused
          ? `0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(156,213,255,0.18), inset 0 1px 0 rgba(220,238,255,0.08)`
          : '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220,238,255,0.05)',
        transition: 'all 0.3s ease',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={ICE.accent} strokeWidth="1" opacity="0.8" />
          <circle cx="7" cy="7" r="1.5" fill={ICE.accent} />
        </svg>
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Ask your brain anything…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: ICE.hi, fontFamily: 'inherit',
            fontSize: 14, letterSpacing: 0.2,
            fontStyle: value ? 'normal' : 'italic',
          }}
        />
        <span style={{
          padding: '2px 6px', borderRadius: 3,
          background: 'rgba(156,213,255,0.1)',
          fontFamily: 'ui-monospace, monospace', fontSize: 10,
          letterSpacing: 0.4, color: ICE.accent, opacity: 0.8,
        }}>⌘K</span>
      </div>
    </div>
  );
}

function Grain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      mixBlendMode: 'overlay', opacity: 0.12, zIndex: 3,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
    }} />
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <DesignCanvas>
        <DCSection id="brain" title="brain" subtitle="A digital brain you can traverse.">
          <DCArtboard id="hero" label="Landing — top-down anatomical brain" width={1280} height={820}>
            <BrainPage showCaption={t.showCaption} mode="2d" />
          </DCArtboard>
          <DCArtboard id="hero-3d" label="Landing — 3D particle cloud (drag to rotate)" width={1280} height={820}>
            <BrainPage showCaption={t.showCaption} mode="3d" />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="brain · tweaks">
        <TweakSection label="Hero" />
        <TweakToggle label="Show caption" value={t.showCaption}
          onChange={(v) => setTweak('showCaption', v)} />
        <TweakSection label="Neuron synthesis" />
        <TweakRadio label="Style" value={t.synthesisStyle}
          options={[
            { value: 'patterns', label: 'Patterns' },
            { value: 'recent',   label: 'Recent' },
            { value: 'summary',  label: 'Summary' },
          ]}
          onChange={(v) => setTweak('synthesisStyle', v)} />
        <div style={{ fontSize: 10, color: 'rgba(41,38,27,0.55)', lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
          Click any glowing region of the brain to expand its synthesis. Health opens a full detail page.
        </div>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

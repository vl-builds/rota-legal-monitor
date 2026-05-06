// ===== SCENE COMPONENTS — one per question kind =====

// Generic option card with hover/selected state
function OptionCard({ selected, onClick, children, height, span }) {
  return (
    <button onClick={onClick} style={{
      gridColumn: span ? `span ${span}` : "auto",
      background: selected ? "linear-gradient(180deg, rgba(251,191,36,0.14), rgba(251,191,36,0.04))" : "var(--bg-2)",
      border: `1px solid ${selected ? "var(--gold)" : "var(--line)"}`,
      borderRadius: 14,
      padding: 0,
      minHeight: height || 140,
      cursor: "pointer", textAlign: "left", color: "var(--ink)",
      transition: "all 220ms cubic-bezier(0.22, 1, 0.36, 1)",
      transform: selected ? "translateY(-2px)" : "translateY(0)",
      boxShadow: selected ? "0 12px 36px rgba(251,191,36,0.18), 0 0 0 1px var(--gold) inset" : "0 1px 0 rgba(255,255,255,0.02) inset",
      animation: selected ? "selectedPop 320ms ease" : "none",
      position: "relative", overflow: "hidden"
    }}
    onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--line-2)"; }}
    onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--line)"; }}>
      {children}
    </button>
  );
}

// =========================================================================
// SCENE 1 — SHAPES (situation): 4 cards 2x2, each with a geometric glyph
// =========================================================================
function Scene_Shapes({ q, value, onChange, sceneStyle }) {
  const glyphs = {
    employed:  <ShapeBox />,
    freelance: <ShapeDisc />,
    founder:   <ShapeTriangle />,
    student:   <ShapeRing />
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 820 }}>
      {q.options.map(opt => {
        const selected = value === opt.id;
        return (
          <OptionCard key={opt.id} selected={selected} onClick={() => onChange(opt.id)} height={180}>
            <div style={{ padding: "22px 22px 20px", height: "100%",
              display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ width: 48, height: 48, color: selected ? "var(--gold)" : "var(--ink-dim)" }}>
                {glyphs[opt.id]}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{opt.label}</div>
                <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 4 }}>{opt.hint}</div>
              </div>
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

// SVG shape primitives — kept dead simple
function ShapeBox() {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M6 16 L42 16" /><path d="M16 6 L16 42" />
  </svg>;
}
function ShapeDisc() {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="24" cy="24" r="18" />
    <circle cx="24" cy="24" r="10" />
    <circle cx="24" cy="24" r="2.5" fill="currentColor" />
  </svg>;
}
function ShapeTriangle() {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M24 6 L42 40 L6 40 Z" /><path d="M24 18 L24 32" />
  </svg>;
}
function ShapeRing() {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 8 L34 8 L34 22 C34 30 30 36 24 40 C18 36 14 30 14 22 Z" />
  </svg>;
}

// =========================================================================
// SCENE 2 — SECTORS (field): 6 chips with monospace glyph + label
// =========================================================================
function Scene_Sectors({ q, value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 900 }}>
      {q.options.map(opt => {
        const selected = value === opt.id;
        return (
          <OptionCard key={opt.id} selected={selected} onClick={() => onChange(opt.id)} height={150}>
            <div style={{ padding: 20, height: "100%",
              display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="mono" style={{
                fontSize: 32, fontWeight: 500,
                color: selected ? "var(--gold)" : "var(--ink-dim)",
                letterSpacing: "-0.02em"
              }}>{opt.glyph}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{opt.label}</div>
              </div>
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

// =========================================================================
// SCENE 3 — FLUENCY (english): horizontal level meter, 4 stops
// =========================================================================
function Scene_Fluency({ q, value, onChange }) {
  const sel = q.options.find(o => o.id === value);
  const level = sel ? sel.level : 0;
  return (
    <div style={{ maxWidth: 760 }}>
      {/* Level meter */}
      <div style={{
        position: "relative", height: 56, marginTop: 8, marginBottom: 28,
        background: "var(--bg-2)", border: "1px solid var(--line)",
        borderRadius: 14, padding: 8, display: "flex", gap: 8
      }}>
        {[1, 2, 3, 4].map(n => {
          const active = n <= level;
          return (
            <div key={n} style={{
              flex: 1, borderRadius: 8,
              background: active ? "linear-gradient(180deg, var(--gold), var(--gold-deep))" : "rgba(255,255,255,0.03)",
              transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: active ? "0 0 18px rgba(251,191,36,0.25)" : "none"
            }} />
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {q.options.map(opt => {
          const selected = value === opt.id;
          return (
            <button key={opt.id} onClick={() => onChange(opt.id)} style={{
              background: selected ? "rgba(251,191,36,0.10)" : "transparent",
              border: `1px solid ${selected ? "var(--gold)" : "var(--line)"}`,
              borderRadius: 10, padding: "16px 14px",
              cursor: "pointer", color: "var(--ink)",
              transition: "all 200ms ease", textAlign: "left"
            }}>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: "0.12em",
                color: selected ? "var(--gold)" : "var(--ink-faint)",
                marginBottom: 6
              }}>NÍVEL 0{opt.level}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// SCENE 4 — HORIZON (goal): wide cards with arrow pointing at horizon line
// =========================================================================
function Scene_Horizon({ q, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 820 }}>
      {q.options.map((opt, i) => {
        const selected = value === opt.id;
        return (
          <OptionCard key={opt.id} selected={selected} onClick={() => onChange(opt.id)} height={92}>
            <div style={{
              display: "flex", alignItems: "center", height: "100%",
              padding: "0 24px", gap: 24
            }}>
              <div className="mono" style={{
                fontSize: 12, color: "var(--ink-faint)", width: 32,
                letterSpacing: "0.12em"
              }}>{`0${i + 1}`}</div>
              <div style={{
                fontSize: 18, fontWeight: 600, flex: 1, letterSpacing: "-0.01em"
              }}>{opt.label}</div>
              <div style={{
                fontSize: 28, fontWeight: 300, fontFamily: "ui-serif, serif",
                color: selected ? "var(--gold)" : "var(--ink-faint)",
                transition: "all 240ms ease",
                transform: selected ? "translateX(6px)" : "translateX(0)"
              }}>{opt.arrow}</div>
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

// =========================================================================
// SCENE 5 — COMPANY (family): grouped circles representing people
// =========================================================================
function Scene_Company({ q, value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 780 }}>
      {q.options.map(opt => {
        const selected = value === opt.id;
        return (
          <OptionCard key={opt.id} selected={selected} onClick={() => onChange(opt.id)} height={200}>
            <div style={{ padding: 22, height: "100%",
              display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ height: 64, display: "flex", alignItems: "center", gap: 6 }}>
                {Array.from({ length: opt.people }).map((_, i) => (
                  <div key={i} style={{
                    width: opt.people === 3 && i === 2 ? 18 : 24,
                    height: opt.people === 3 && i === 2 ? 18 : 24,
                    borderRadius: "50%",
                    background: selected ? "var(--gold)" : "var(--ink-dim)",
                    transition: "background 240ms ease"
                  }} />
                ))}
                {opt.people === 3 && (
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: selected ? "var(--gold)" : "var(--ink-dim)",
                    opacity: 0.7, transition: "background 240ms ease"
                  }} />
                )}
              </div>
              <div>
                <div className="mono" style={{
                  fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.12em",
                  marginBottom: 6
                }}>0{opt.people} {opt.people === 1 ? "PESSOA" : "PESSOAS"}+</div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{opt.label}</div>
              </div>
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

// =========================================================================
// SCENE 6 — BALANCE (money): big horizontal scale toggle
// =========================================================================
function Scene_Balance({ q, value, onChange }) {
  const idx = q.options.findIndex(o => o.id === value);
  return (
    <div style={{ maxWidth: 820 }}>
      {/* Scale visual */}
      <div style={{
        position: "relative", height: 80, marginTop: 8, marginBottom: 24
      }}>
        <div style={{
          position: "absolute", left: 0, right: 0, top: "50%",
          height: 1, background: "var(--line-2)"
        }} />
        {/* labels at ends */}
        <div className="mono" style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-faint)",
          background: "var(--bg)", paddingRight: 12
        }}>← CUSTO BAIXO</div>
        <div className="mono" style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-faint)",
          background: "var(--bg)", paddingLeft: 12
        }}>SALÁRIO ALTO →</div>
        {/* knob */}
        {idx >= 0 && (
          <div style={{
            position: "absolute", top: "50%",
            left: `${(idx / (q.options.length - 1)) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--gold)", boxShadow: "0 0 32px rgba(251,191,36,0.4)",
            transition: "left 480ms cubic-bezier(0.22, 1, 0.36, 1)"
          }} />
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {q.options.map(opt => {
          const selected = value === opt.id;
          return (
            <OptionCard key={opt.id} selected={selected} onClick={() => onChange(opt.id)} height={120}>
              <div style={{ padding: 18, height: "100%",
                display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{opt.label}</div>
              </div>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}

const SCENES = {
  shapes: Scene_Shapes,
  sectors: Scene_Sectors,
  fluency: Scene_Fluency,
  horizon: Scene_Horizon,
  company: Scene_Company,
  balance: Scene_Balance
};

window.QUIZ_SCENES = SCENES;

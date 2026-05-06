// ===== SHARED COMPONENTS =====

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Top progress bar — minimal, gold accent
function ProgressBar({ step, total }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 3,
      background: "rgba(255,255,255,0.04)", zIndex: 50
    }}>
      <div style={{
        height: "100%",
        width: `${(step / total) * 100}%`,
        background: "linear-gradient(90deg, var(--gold-deep), var(--gold))",
        transition: "width 600ms cubic-bezier(0.65, 0, 0.35, 1)",
        boxShadow: "0 0 18px rgba(251, 191, 36, 0.4)"
      }} />
    </div>
  );
}

// Top chrome / nav placeholder (mimics existing site nav)
function TopNav({ step, total, onExit }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
      padding: "20px 32px", display: "flex", alignItems: "center",
      justifyContent: "space-between",
      background: "linear-gradient(180deg, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0) 100%)",
      backdropFilter: "blur(8px)", pointerEvents: "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--gold)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0a0908", fontWeight: 800, fontSize: 14
        }}>
          ◐
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>Rota Legal</span>
      </div>
      <div className="mono" style={{
        fontSize: 11, color: "var(--ink-faint)",
        letterSpacing: "0.12em", pointerEvents: "auto"
      }}>
        {step > 0 && step <= total ? `0${step} / 0${total}` : "QUAL PAÍS?"}
      </div>
      <div style={{ pointerEvents: "auto" }}>
        {step > 0 && (
          <button onClick={onExit} style={{
            background: "transparent", border: "1px solid var(--line-2)",
            color: "var(--ink-dim)", padding: "8px 14px",
            borderRadius: 999, fontSize: 12, cursor: "pointer",
            fontWeight: 500
          }}>
            Sair ✕
          </button>
        )}
      </div>
    </nav>
  );
}

// Eyebrow label (PERGUNTA 01 etc) with mono font
function Eyebrow({ children, color }) {
  return (
    <div className="mono" style={{
      fontSize: 11, letterSpacing: "0.18em",
      color: color || "var(--gold)",
      textTransform: "uppercase", fontWeight: 500,
      marginBottom: 18,
      display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{
        width: 24, height: 1, background: "currentColor", display: "inline-block"
      }} />
      {children}
    </div>
  );
}

// Big display title
function SceneTitle({ children }) {
  return (
    <h1 style={{
      fontSize: "clamp(40px, 5.4vw, 72px)",
      lineHeight: 1.02, letterSpacing: "-0.03em",
      fontWeight: 800, margin: 0,
      color: "var(--ink)", textWrap: "balance", maxWidth: 900
    }}>{children}</h1>
  );
}
function SceneSubtitle({ children }) {
  return (
    <p style={{
      fontSize: 17, color: "var(--ink-dim)", marginTop: 18,
      maxWidth: 560, lineHeight: 1.5, fontWeight: 400
    }}>{children}</p>
  );
}

// Footer — back/next + auto-advance hint
function SceneFooter({ onBack, onNext, canNext, autoHint }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginTop: 48, gap: 16
    }}>
      <button onClick={onBack} style={{
        background: "transparent", border: "none",
        color: "var(--ink-dim)", padding: "10px 0",
        fontSize: 14, cursor: "pointer", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 8
      }}>
        ← Voltar
      </button>
      {autoHint && (
        <div className="mono" style={{
          fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em",
          textTransform: "uppercase"
        }}>
          {autoHint}
        </div>
      )}
      <button onClick={onNext} disabled={!canNext}
        style={{
          background: canNext ? "var(--gold)" : "transparent",
          border: canNext ? "none" : "1px solid var(--line-2)",
          color: canNext ? "#0a0908" : "var(--ink-faint)",
          padding: "12px 24px", borderRadius: 999,
          fontSize: 14, fontWeight: 600, cursor: canNext ? "pointer" : "not-allowed",
          transition: "all 200ms ease",
          boxShadow: canNext ? "0 4px 24px rgba(251, 191, 36, 0.25)" : "none"
        }}>
        Próxima →
      </button>
    </div>
  );
}

// Live preview rail — 3 flag chips on the side
function LivePreviewRail({ ranking, visible }) {
  if (!visible) return null;
  return (
    <aside style={{
      position: "fixed", right: 28, top: "50%", transform: "translateY(-50%)",
      display: "flex", flexDirection: "column", gap: 14, zIndex: 30
    }}>
      <div className="mono" style={{
        fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-faint)",
        writingMode: "vertical-rl", textOrientation: "mixed",
        textTransform: "uppercase", marginBottom: 6, alignSelf: "center"
      }}>
        Match parcial ↓
      </div>
      {ranking.map((c, i) => (
        <FlagChip key={c.code} country={c} rank={i + 1} />
      ))}
    </aside>
  );
}

function FlagChip({ country, rank }) {
  const stripes = country.flag;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      animation: "flagIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      animationDelay: `${rank * 80}ms`, animationFillMode: "both"
    }}>
      <div style={{
        width: 44, height: 56, borderRadius: 4, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
        position: "relative"
      }}>
        {stripes.map((color, i) => (
          <div key={i} style={{ flex: 1, background: color }} />
        ))}
        <div className="mono" style={{
          position: "absolute", top: -8, right: -8, width: 18, height: 18,
          borderRadius: "50%", background: "var(--gold)",
          color: "#0a0908", fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--bg)"
        }}>{rank}</div>
      </div>
      <div className="mono" style={{
        fontSize: 9, letterSpacing: "0.1em", color: "var(--ink-faint)"
      }}>{country.code}{country.match != null ? ` · ${country.match}` : ""}</div>
    </div>
  );
}

// Decorative atmosphere — soft radial gradient that varies per scene
function SceneAtmosphere({ tint }) {
  const map = {
    a: "radial-gradient(900px 600px at 12% 18%, rgba(251,191,36,0.10), transparent 60%)",
    b: "radial-gradient(800px 600px at 92% 24%, rgba(251,191,36,0.08), transparent 60%)",
    c: "radial-gradient(900px 700px at 50% 100%, rgba(251,191,36,0.10), transparent 55%)",
    d: "radial-gradient(900px 600px at 88% 88%, rgba(251,191,36,0.09), transparent 60%)",
    e: "radial-gradient(900px 600px at 8% 88%, rgba(251,191,36,0.10), transparent 60%)",
    f: "radial-gradient(1100px 800px at 50% 50%, rgba(251,191,36,0.07), transparent 60%)",
    hero: "radial-gradient(1200px 800px at 80% 30%, rgba(251,191,36,0.12), transparent 65%), radial-gradient(900px 700px at 10% 90%, rgba(251,191,36,0.08), transparent 60%)"
  };
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      background: map[tint] || map.a, transition: "background 1200ms ease"
    }} />
  );
}

// keyframes
const sharedKeyframes = `
@keyframes flagIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sceneIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glyphPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes selectedPop {
  0% { transform: scale(1); }
  35% { transform: scale(1.04); }
  100% { transform: scale(1.02); }
}
@keyframes stampDrop {
  0% { opacity: 0; transform: rotate(-8deg) scale(2); }
  60% { opacity: 1; transform: rotate(-12deg) scale(0.98); }
  100% { opacity: 0.92; transform: rotate(-12deg) scale(1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.scene-in { animation: sceneIn 700ms cubic-bezier(0.22, 1, 0.36, 1); }
`;

Object.assign(window, {
  ProgressBar, TopNav, Eyebrow, SceneTitle, SceneSubtitle,
  SceneFooter, LivePreviewRail, FlagChip, SceneAtmosphere, sharedKeyframes
});

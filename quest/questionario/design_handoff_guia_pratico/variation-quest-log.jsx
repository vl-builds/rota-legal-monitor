// VARIAÇÃO 1 — Quest Log
// Estilo: grimório/livro de missões. Layout vertical, fases como capítulos.
// Bordas ornamentadas, tipografia serif para títulos de quest, XP visível, recompensas.

const { useState, useEffect, useRef } = React;

const ql_styles = {
  root: {
    width: "100%", minHeight: "100%",
    background: "radial-gradient(1100px 700px at 80% -10%, rgba(245,180,37,0.08), transparent 60%), radial-gradient(900px 500px at -10% 100%, rgba(74,222,128,0.04), transparent 60%), #07070a",
    color: "#f3f3f4",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "40px 56px 64px",
    overflow: "hidden",
    position: "relative",
  },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#a0a0a8", letterSpacing: 0.4, textTransform: "uppercase" },
  brandDot: { width: 8, height: 8, borderRadius: 999, background: "#f5b425", boxShadow: "0 0 12px #f5b425" },
  tabs: { display: "flex", gap: 28, fontSize: 13, color: "#6c6c75" },
  tabActive: { color: "#fff", borderBottom: "1px solid #f5b425", paddingBottom: 4 },
};

function QL_FlagPT({ size = 56 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 56 40" style={{ display: "block", borderRadius: 6, boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.4)" }}>
      <rect width="22" height="40" fill="#046a38"/>
      <rect x="22" width="34" height="40" fill="#da291c"/>
      <circle cx="22" cy="20" r="6" fill="#ffd83b" stroke="#fff" strokeWidth="0.6"/>
      <circle cx="22" cy="20" r="3.5" fill="#fff"/>
    </svg>
  );
}

function QL_Header({ data }) {
  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: "#f5b425", fontWeight: 600 }}>
        Capítulo I — Quest Log
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: 14 }}>
        <QL_FlagPT size={84} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 72, lineHeight: 1.1, fontWeight: 400, letterSpacing: -1, paddingBottom: 6 }}>
              Como se legalizar em <em style={{ color: "#f5b425", fontStyle: "italic" }}>{data.country}</em>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            <QL_Pill tone="green">● {data.trust}</QL_Pill>
            <QL_Pill>Schengen</QL_Pill>
            <QL_Pill tone="gold">Atualizado {data.updated}</QL_Pill>
          </div>
        </div>
      </div>

      {/* Quest meta — XP, dificuldade, tempo */}
      <div style={{ marginTop: 28, padding: "20px 24px", border: "1px solid rgba(245,180,37,0.18)", background: "linear-gradient(180deg, rgba(245,180,37,0.04), rgba(245,180,37,0.01))", borderRadius: 12, display: "flex", gap: 40, alignItems: "center" }}>
        <QL_Stat icon="trophy" label="Recompensa total" value={`${data.totalXP} XP`} accent />
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
        <QL_Stat icon="clock" label="Tempo estimado" value={data.estimatedTime} />
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
        <QL_Stat icon="flame" label="Dificuldade" value={<QL_Difficulty level={data.difficulty} />} />
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
        <QL_Stat icon="map" label="Fases" value={`${data.phases.length}`} />
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#f5b425", color: "#0a0a0b", border: 0, padding: "12px 20px", borderRadius: 999,
          fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 6px 24px rgba(245,180,37,0.35)",
        }}>
          <window.Icon name="play" size={16} stroke={2.5} /> Iniciar jornada
        </button>
      </div>
    </div>
  );
}

function QL_Pill({ children, tone }) {
  const tones = {
    green: { bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)", color: "#4ade80" },
    gold: { bg: "rgba(245,180,37,0.12)", border: "rgba(245,180,37,0.3)", color: "#f5b425" },
    default: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", color: "#c0c0c8" },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
      background: t.bg, border: `1px solid ${t.border}`, color: t.color,
    }}>{children}</span>
  );
}

function QL_Stat({ icon, label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6c6c75", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>
        <window.Icon name={icon} size={12} /> {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent ? "#f5b425" : "#fff", fontFamily: "'Instrument Serif', serif" }}>{value}</div>
    </div>
  );
}

function QL_Difficulty({ level = 3, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{
          width: 10, height: 10, borderRadius: 2, transform: "rotate(45deg)",
          background: i < level ? "#f5b425" : "rgba(255,255,255,0.1)",
          boxShadow: i < level ? "0 0 8px rgba(245,180,37,0.4)" : "none",
        }} />
      ))}
    </span>
  );
}

// ───── PHASE / OBJECTIVES ─────
function QL_Phase({ phase, isFirst, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [done, setDone] = useState({});
  const completedCount = Object.values(done).filter(Boolean).length;
  const total = phase.objectives.length;
  const pct = Math.round((completedCount / total) * 100);

  // Confetti when phase complete
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (completedCount === total && total > 0) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(t);
    }
  }, [completedCount, total]);

  return (
    <div style={{
      position: "relative",
      marginTop: isFirst ? 40 : 24,
      borderRadius: 16,
      background: "linear-gradient(180deg, #15151a 0%, #111114 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.4)",
    }}>
      {/* Decorative corner ornament */}
      <svg style={{ position: "absolute", top: 0, right: 0, opacity: 0.15, pointerEvents: "none" }} width="180" height="180" viewBox="0 0 180 180" fill="none">
        <circle cx="160" cy="20" r="120" stroke="#f5b425" strokeWidth="0.5" />
        <circle cx="160" cy="20" r="80" stroke="#f5b425" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle cx="160" cy="20" r="40" stroke="#f5b425" strokeWidth="0.5" />
      </svg>

      {showConfetti && <QL_Confetti />}

      {/* Phase header */}
      <button onClick={() => setOpen(!open)} style={{
        all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 24,
        padding: "24px 28px", width: "calc(100% - 56px)",
      }}>
        {/* Phase emblem */}
        <div style={{
          width: 72, height: 72, position: "relative", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: "absolute", inset: 0 }}>
            <polygon points="36,4 64,18 64,54 36,68 8,54 8,18" fill="rgba(245,180,37,0.06)" stroke="#f5b425" strokeWidth="1.2" />
            <polygon points="36,10 58,21 58,51 36,62 14,51 14,21" fill="none" stroke="rgba(245,180,37,0.3)" strokeWidth="0.6" />
          </svg>
          <div style={{ position: "relative", textAlign: "center" }}>
            <window.Icon name={phase.icon} size={28} stroke={1.5} style={{ color: "#f5b425" }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#f5b425", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              FASE {String(phase.number).padStart(2, "0")} / {String(window.QUEST_DATA.phases.length).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, color: "#6c6c75" }}>•</span>
            <span style={{ fontSize: 11, color: "#a0a0a8", display: "flex", alignItems: "center", gap: 4 }}>
              <window.Icon name="clock" size={11} /> {phase.duration}
            </span>
            <span style={{ fontSize: 11, color: "#6c6c75" }}>•</span>
            <span style={{ fontSize: 11, color: "#a0a0a8", display: "flex", alignItems: "center", gap: 4 }}>
              <window.Icon name="trophy" size={11} /> +{phase.xp} XP
            </span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 38, fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {phase.title}
          </h2>
          <div style={{ marginTop: 6, fontSize: 14, color: "#a0a0a8", fontStyle: "italic" }}>
            "{phase.subtitle}"
          </div>
        </div>

        {/* Progress dial */}
        <div style={{ width: 64, height: 64, position: "relative", flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#f5b425" strokeWidth="3"
              strokeDasharray={`${(pct/100)*163.4} 163.4`} strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ transition: "stroke-dasharray 0.4s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: pct === 100 ? "#4ade80" : "#fff" }}>
            {pct === 100 ? <window.Icon name="check" size={20} stroke={2.5} /> : `${pct}%`}
          </div>
        </div>

        <div style={{ marginLeft: 12, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", color: "#6c6c75" }}>
          <window.Icon name="chevron-down" size={20} />
        </div>
      </button>

      {/* Objectives */}
      <div style={{
        maxHeight: open ? 9999 : 0,
        opacity: open ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.5s ease, opacity 0.3s",
      }}>
        <div style={{ padding: "0 28px 28px", borderTop: "1px dashed rgba(255,255,255,0.06)", marginTop: 4 }}>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {phase.objectives.map((o, idx) => (
              <QL_Objective
                key={o.id}
                obj={o}
                idx={idx}
                done={!!done[o.id]}
                onToggle={() => setDone(d => ({ ...d, [o.id]: !d[o.id] }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QL_Objective({ obj, idx, done, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.06)",
      background: done ? "linear-gradient(180deg, rgba(74,222,128,0.04), transparent)" : "rgba(255,255,255,0.015)",
      transition: "all 0.25s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 20px" }}>
        {/* Custom checkbox */}
        <button onClick={onToggle} style={{
          all: "unset", cursor: "pointer", flexShrink: 0, marginTop: 2,
          width: 28, height: 28, borderRadius: 8,
          border: `1.5px solid ${done ? "#4ade80" : "rgba(245,180,37,0.4)"}`,
          background: done ? "rgba(74,222,128,0.15)" : "rgba(245,180,37,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: done ? "#4ade80" : "#f5b425",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, fontWeight: 600,
          transition: "all 0.2s",
        }}>
          {done ? <window.Icon name="check" size={16} stroke={3} /> : String(idx + 1).padStart(2, "0")}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              all: "unset", cursor: "pointer", fontSize: 16, fontWeight: 600,
              color: done ? "#4ade80" : "#f5b425",
              textDecoration: done ? "line-through" : "none",
              textDecorationColor: "rgba(74,222,128,0.5)",
            }}>
              {obj.title}
            </button>
            {obj.tags?.map((t, i) => (
              <span key={i} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 4,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#a0a0a8", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5,
              }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 14, color: "#c0c0c8", lineHeight: 1.55 }}>{obj.summary}</div>

          <div style={{
            maxHeight: expanded ? 200 : 0,
            opacity: expanded ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s, opacity 0.2s, margin 0.2s",
            marginTop: expanded ? 12 : 0,
          }}>
            <div style={{ fontSize: 13, color: "#a0a0a8", lineHeight: 1.6, paddingLeft: 12, borderLeft: "2px solid rgba(245,180,37,0.3)" }}>
              {obj.detail}
              {obj.tip && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 8, color: "#f5b425", fontSize: 12 }}>
                  <window.Icon name="info" size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span><b style={{ fontWeight: 600 }}>Dica:</b> {obj.tip}</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setExpanded(!expanded)} style={{
            all: "unset", cursor: "pointer", marginTop: 8,
            fontSize: 11, color: "#6c6c75", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            {expanded ? "← Recolher" : "Detalhes →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QL_Confetti() {
  const pieces = Array.from({ length: 30 });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10 }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const dur = 1 + Math.random() * 0.8;
        const colors = ["#f5b425", "#4ade80", "#60a5fa", "#a78bfa", "#fff"];
        const c = colors[i % colors.length];
        const rot = Math.random() * 360;
        return (
          <span key={i} style={{
            position: "absolute", left: `${left}%`, top: "20%",
            width: 6, height: 10, background: c, borderRadius: 1,
            transform: `rotate(${rot}deg)`,
            animation: `ql-fall ${dur}s ${delay}s forwards`,
          }} />
        );
      })}
      <style>{`
        @keyframes ql-fall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(800px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ────── ROOT COMPONENT ──────
function QuestLog() {
  const data = window.QUEST_DATA;
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div style={ql_styles.root}>
      {/* Subtle grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at top, black 30%, transparent 80%)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Topbar */}
        <div style={ql_styles.topbar}>
          <div style={ql_styles.brand}>
            <span style={ql_styles.brandDot} />
            <span style={{ fontWeight: 600, color: "#f3f3f4", textTransform: "none", letterSpacing: 0 }}>Rota Legal</span>
          </div>
          <div style={ql_styles.tabs}>
            <span>Vistos</span>
            <span>Para Brasileiros</span>
            <span>Requisitos</span>
            <span>Mudanças</span>
            <span>Fontes</span>
            <span style={ql_styles.tabActive}>Guia Prático</span>
          </div>
        </div>

        <QL_Header data={data} />

        {/* Phase tabs (chip nav) */}
        <div style={{ marginTop: 36, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#6c6c75", textTransform: "uppercase", letterSpacing: 1.5, marginRight: 8, fontFamily: "'JetBrains Mono', monospace" }}>Jornada</span>
          {data.phases.map((p, i) => (
            <React.Fragment key={p.id}>
              <button onClick={() => setActivePhase(i)} style={{
                all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 999,
                background: activePhase === i ? "rgba(245,180,37,0.1)" : "transparent",
                border: `1px solid ${activePhase === i ? "rgba(245,180,37,0.4)" : "rgba(255,255,255,0.08)"}`,
                fontSize: 13, color: activePhase === i ? "#f5b425" : "#a0a0a8",
                transition: "all 0.2s",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.7 }}>
                  {String(p.number).padStart(2, "0")}
                </span>
                {p.title}
              </button>
              {i < data.phases.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Phases — only active one expanded */}
        <div>
          {data.phases.map((p, i) => (
            <QL_Phase key={p.id} phase={p} isFirst={i === 0} defaultOpen={i === activePhase} />
          ))}
        </div>

        {/* Footer disclaimer */}
        <div style={{
          marginTop: 32, padding: "16px 20px",
          border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12,
          fontSize: 12, color: "#6c6c75", display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <window.Icon name="alert" size={14} style={{ marginTop: 2, flexShrink: 0, color: "#f5b425" }} />
          <span>Guia gerado automaticamente a partir de dados de {data.updated}. Requisitos e prazos mudam com frequência por regulamentação do governo de {data.country}. Sempre confirme nas fontes oficiais antes de iniciar o processo.</span>
        </div>
      </div>
    </div>
  );
}

window.QuestLog = QuestLog;

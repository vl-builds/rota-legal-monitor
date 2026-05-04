// VARIAÇÃO 2 — Mission Briefing
// Estilo: terminal/dossiê tático, sci-fi sóbrio. Layout em duas colunas (sidebar de fases + briefing principal).
// Tipografia mono mais presente. Sensação de "interface de operação".

const { useState: useStateMB, useEffect: useEffectMB } = React;

const mb_styles = {
  root: {
    width: "100%", minHeight: "100%",
    background: "#07070a",
    color: "#e8e8ec",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "32px 48px 56px",
    position: "relative",
    overflow: "hidden",
  },
  panel: {
    background: "#0d0d10",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 4,
    position: "relative",
  },
  mono: { fontFamily: "'JetBrains Mono', monospace" },
};

function MB_FlagPT({ size = 40 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 56 40" style={{ display: "block", borderRadius: 2 }}>
      <rect width="22" height="40" fill="#046a38"/>
      <rect x="22" width="34" height="40" fill="#da291c"/>
      <circle cx="22" cy="20" r="6" fill="#ffd83b"/>
      <circle cx="22" cy="20" r="3.5" fill="#fff"/>
    </svg>
  );
}

// Corner brackets — terminal aesthetic
function MB_Bracket({ size = 12, color = "#f5b425" }) {
  return (
    <span style={{
      position: "absolute", width: size, height: size,
      borderColor: color, borderStyle: "solid", borderWidth: 0,
    }} />
  );
}
function MB_Frame({ children, color = "rgba(245,180,37,0.4)", style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <span style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <span style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      {children}
    </div>
  );
}

// ─── SIDEBAR — list of phases as mission deck ───
function MB_Sidebar({ phases, active, setActive, completedByPhase }) {
  return (
    <div style={{ ...mb_styles.panel, padding: 0, height: "fit-content", position: "sticky", top: 0 }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
        <span style={{ ...mb_styles.mono, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#a0a0a8" }}>Mission Deck</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...mb_styles.mono, fontSize: 10, color: "#6c6c75" }}>{phases.length} OPS</span>
      </div>

      {phases.map((p, i) => {
        const isActive = i === active;
        const completed = completedByPhase[p.id] || 0;
        const total = p.objectives.length;
        const done = completed === total;
        return (
          <button key={p.id} onClick={() => setActive(i)} style={{
            all: "unset", cursor: "pointer", display: "block", width: "100%",
            padding: "16px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: isActive ? "linear-gradient(90deg, rgba(245,180,37,0.06), transparent)" : "transparent",
            borderLeft: `2px solid ${isActive ? "#f5b425" : "transparent"}`,
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ ...mb_styles.mono, fontSize: 10, color: isActive ? "#f5b425" : "#6c6c75", letterSpacing: 1 }}>
                OP-{String(p.number).padStart(3, "0")}
              </span>
              <span style={{ flex: 1 }} />
              {done ? (
                <span style={{ ...mb_styles.mono, fontSize: 9, color: "#4ade80", padding: "2px 6px", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 2 }}>CLEARED</span>
              ) : isActive ? (
                <span style={{ ...mb_styles.mono, fontSize: 9, color: "#f5b425", padding: "2px 6px", border: "1px solid rgba(245,180,37,0.3)", borderRadius: 2 }}>ACTIVE</span>
              ) : (
                <span style={{ ...mb_styles.mono, fontSize: 9, color: "#6c6c75", padding: "2px 6px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>STANDBY</span>
              )}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "#fff" : "#c0c0c8", marginBottom: 2 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 11, color: "#6c6c75", display: "flex", gap: 10, ...mb_styles.mono }}>
              <span>{p.duration}</span>
              <span>•</span>
              <span>{p.xp} XP</span>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 10, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 0, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(completed/total)*100}%`, background: done ? "#4ade80" : "#f5b425", transition: "width 0.3s" }} />
            </div>
          </button>
        );
      })}

      {/* Total telemetry */}
      <div style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ ...mb_styles.mono, fontSize: 10, letterSpacing: 1, color: "#6c6c75", marginBottom: 10 }}>TELEMETRIA</div>
        {[
          { l: "Sucesso", v: "Confiança média", c: "#4ade80" },
          { l: "Schengen", v: "TRUE", c: "#fff" },
          { l: "Build", v: "mai/2026", c: "#f5b425" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, ...mb_styles.mono, fontSize: 11 }}>
            <span style={{ color: "#6c6c75" }}>{r.l}</span>
            <span style={{ color: r.c }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BRIEFING — current phase detail ───
function MB_Briefing({ phase, completed, onToggle }) {
  return (
    <MB_Frame style={{ padding: 0 }}>
      <div style={{ ...mb_styles.panel, padding: 0, border: 0 }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(245,180,37,0.18)", background: "linear-gradient(180deg, rgba(245,180,37,0.04), transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ ...mb_styles.mono, fontSize: 10, letterSpacing: 2, color: "#f5b425", textTransform: "uppercase" }}>
              ▶ BRIEFING // OP-{String(phase.number).padStart(3, "0")}
            </span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#f5b425", animation: "mb-pulse 1.4s infinite" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>{phase.title}</h2>
          <div style={{ marginTop: 4, fontSize: 14, color: "#a0a0a8" }}>{phase.subtitle}</div>

          {/* Stats row */}
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { l: "DURAÇÃO", v: phase.duration },
              { l: "DIFICULDADE", v: "★".repeat(phase.difficulty) + "☆".repeat(5-phase.difficulty), c: "#f5b425" },
              { l: "XP", v: `+${phase.xp}`, c: "#f5b425" },
              { l: "OBJETIVOS", v: `${completed} / ${phase.objectives.length}`, c: completed === phase.objectives.length ? "#4ade80" : "#fff" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ ...mb_styles.mono, fontSize: 9, letterSpacing: 1.5, color: "#6c6c75" }}>{s.l}</div>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: s.c || "#fff", ...mb_styles.mono }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives list */}
        <div style={{ padding: "8px 0" }}>
          {phase.objectives.map((o, idx) => (
            <MB_Objective key={o.id} obj={o} idx={idx} done={!!completed?.[o.id]}
              completed={completed.has?.(o.id)} onToggle={onToggle} />
          ))}
        </div>
      </div>

      <style>{`@keyframes mb-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </MB_Frame>
  );
}

function MB_Objective({ obj, idx, completed, onToggle }) {
  const [open, setOpen] = useStateMB(idx === 0);
  return (
    <div style={{
      borderTop: idx === 0 ? "0" : "1px solid rgba(255,255,255,0.04)",
      padding: "16px 24px",
      transition: "background 0.2s",
      background: completed ? "rgba(74,222,128,0.025)" : "transparent",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Ordinal */}
        <button onClick={() => onToggle(obj.id)} style={{
          all: "unset", cursor: "pointer", flexShrink: 0,
          width: 28, height: 28, marginTop: 1,
          border: `1px solid ${completed ? "#4ade80" : "rgba(245,180,37,0.4)"}`,
          background: completed ? "rgba(74,222,128,0.12)" : "transparent",
          color: completed ? "#4ade80" : "#f5b425",
          ...mb_styles.mono, fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {completed ? <window.Icon name="check" size={14} stroke={3} /> : `0${idx + 1}`}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={() => setOpen(!open)} style={{
            all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: completed ? "#4ade80" : "#fff", textDecoration: completed ? "line-through" : "none" }}>
              {obj.title}
            </span>
            {obj.tags?.map((t, i) => (
              <span key={i} style={{
                ...mb_styles.mono, fontSize: 9, padding: "1px 6px",
                border: "1px solid rgba(255,255,255,0.08)", color: "#a0a0a8",
                letterSpacing: 0.8, textTransform: "uppercase",
              }}>{t}</span>
            ))}
          </button>
          <div style={{ fontSize: 13, color: "#a0a0a8", lineHeight: 1.55 }}>{obj.summary}</div>

          <div style={{
            maxHeight: open ? 240 : 0,
            opacity: open ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.3s",
            marginTop: open ? 10 : 0,
          }}>
            <div style={{
              padding: "10px 12px",
              background: "rgba(245,180,37,0.04)",
              borderLeft: "2px solid rgba(245,180,37,0.4)",
              fontSize: 12, color: "#c0c0c8", lineHeight: 1.6,
            }}>
              <div style={{ ...mb_styles.mono, fontSize: 9, letterSpacing: 1, color: "#f5b425", marginBottom: 6 }}>// INTEL</div>
              {obj.detail}
              {obj.tip && (
                <div style={{ marginTop: 8, ...mb_styles.mono, fontSize: 11, color: "#f5b425" }}>
                  &gt; tip: {obj.tip}
                </div>
              )}
            </div>
          </div>
        </div>

        <button onClick={() => setOpen(!open)} style={{
          all: "unset", cursor: "pointer", color: "#6c6c75", padding: 4,
          transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s",
        }}>
          <window.Icon name="chevron-down" size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ───
function MissionBrief() {
  const data = window.QUEST_DATA;
  const [active, setActive] = useStateMB(0);
  const [completedSet, setCompletedSet] = useStateMB({}); // { phaseId: Set of ids }

  const phase = data.phases[active];
  const phaseDone = completedSet[phase.id] || new Set();
  const completedCount = phaseDone.size || 0;

  const completedByPhase = {};
  data.phases.forEach(p => completedByPhase[p.id] = (completedSet[p.id]?.size) || 0);

  const onToggle = (objId) => {
    setCompletedSet(prev => {
      const next = { ...prev };
      const cur = new Set(next[phase.id] || []);
      if (cur.has(objId)) cur.delete(objId); else cur.add(objId);
      next[phase.id] = cur;
      return next;
    });
  };

  // Build a "completed" map for current phase (id -> boolean)
  const completedMap = { has: (id) => phaseDone.has(id) };
  data.phases.forEach(p => {
    const s = completedSet[p.id] || new Set();
    p.objectives.forEach(o => { completedMap[o.id] = s.has(o.id); });
  });

  return (
    <div style={mb_styles.root}>
      {/* Scanline overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
      }} />

      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...mb_styles.mono, fontSize: 11, color: "#a0a0a8" }}>
          <span style={{ width: 6, height: 6, background: "#f5b425", boxShadow: "0 0 8px #f5b425" }} />
          ROTA-LEGAL // CONSOLE v2.6
        </div>
        <div style={{ ...mb_styles.mono, fontSize: 11, color: "#6c6c75", display: "flex", gap: 24 }}>
          <span>UTC 14:32:08</span>
          <span style={{ color: "#4ade80" }}>● LINK ESTÁVEL</span>
        </div>
      </div>

      {/* Country header banner */}
      <div style={{ marginTop: 28, padding: "24px 28px", border: "1px solid rgba(245,180,37,0.2)", borderRadius: 4, background: "linear-gradient(135deg, rgba(245,180,37,0.04), rgba(74,222,128,0.02))", position: "relative", overflow: "hidden" }}>
        <span style={{ ...mb_styles.mono, fontSize: 10, letterSpacing: 2, color: "#f5b425" }}>// MISSÃO DE LEGALIZAÇÃO</span>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 12 }}>
          <MB_FlagPT size={64} />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
              {data.country.toUpperCase()}
            </h1>
            <div style={{ marginTop: 8, ...mb_styles.mono, fontSize: 12, color: "#a0a0a8", letterSpacing: 0.5 }}>
              CODE: PT • SCHENGEN: TRUE • TRUST: MEDIUM • DATA: {data.updated.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...mb_styles.mono, fontSize: 10, letterSpacing: 1.5, color: "#6c6c75" }}>RECOMPENSA TOTAL</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#f5b425", ...mb_styles.mono, lineHeight: 1 }}>{data.totalXP}</div>
            <div style={{ ...mb_styles.mono, fontSize: 11, color: "#f5b425" }}>XP</div>
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, position: "relative", zIndex: 1 }}>
        <MB_Sidebar phases={data.phases} active={active} setActive={setActive} completedByPhase={completedByPhase} />
        <MB_Briefing phase={phase} completed={completedMap} onToggle={onToggle} />
      </div>

      {/* Footer disclaimer */}
      <div style={{
        marginTop: 24, padding: "12px 16px",
        ...mb_styles.mono, fontSize: 11, color: "#6c6c75",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <span style={{ color: "#f5b425" }}>// AVISO</span>
        Dados extraídos automaticamente em {data.updated}. Sempre confirme nas fontes oficiais antes de iniciar o processo.
      </div>
    </div>
  );
}

window.MissionBrief = MissionBrief;

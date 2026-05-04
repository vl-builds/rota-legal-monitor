// VARIAÇÃO 3 — Skill Tree
// Estilo: trilha visual com nós conectados (estilo Path of Exile / Civilization tech tree).
// Fases como ramos, objetivos como skill nodes. Layout horizontal/diagonal com SVG paths.

const { useState: useStateST } = React;

const st_styles = {
  root: {
    width: "100%", minHeight: "100%",
    background: "radial-gradient(1400px 800px at 50% -10%, rgba(245,180,37,0.06), transparent 60%), #050507",
    color: "#f3f3f4",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "32px 48px 48px",
    position: "relative",
    overflow: "hidden",
  },
};

function ST_FlagPT({ size = 40 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 56 40" style={{ display: "block", borderRadius: 3 }}>
      <rect width="22" height="40" fill="#046a38"/>
      <rect x="22" width="34" height="40" fill="#da291c"/>
      <circle cx="22" cy="20" r="6" fill="#ffd83b"/>
      <circle cx="22" cy="20" r="3.5" fill="#fff"/>
    </svg>
  );
}

// SKILL NODE
function ST_Node({ obj, x, y, unlocked, completed, onToggle, onSelect, isSelected }) {
  const r = 26;
  const colorMain = completed ? "#4ade80" : unlocked ? "#f5b425" : "#3a3a42";
  return (
    <g style={{ cursor: "pointer" }} onClick={() => { onToggle(obj.id); onSelect(obj.id); }}>
      {/* Glow */}
      {(unlocked || completed) && (
        <circle cx={x} cy={y} r={r + 8} fill={colorMain} opacity={isSelected ? 0.25 : 0.1} />
      )}
      {/* Outer ring */}
      <circle cx={x} cy={y} r={r} fill="#0a0a0d" stroke={colorMain} strokeWidth={isSelected ? 2.5 : 1.5} />
      {/* Inner */}
      <circle cx={x} cy={y} r={r - 6} fill={completed ? "rgba(74,222,128,0.15)" : unlocked ? "rgba(245,180,37,0.08)" : "transparent"} />
      {/* Symbol */}
      {completed ? (
        <g transform={`translate(${x-7}, ${y-7})`} stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="0 7 5 12 14 3" />
        </g>
      ) : !unlocked ? (
        <g transform={`translate(${x-6}, ${y-7})`} stroke="#6c6c75" strokeWidth="1.5" fill="none">
          <rect x="0" y="5" width="12" height="9" rx="1" />
          <path d="M2.5 5V3a3.5 3.5 0 0 1 7 0v2" />
        </g>
      ) : (
        <text x={x} y={y + 4} textAnchor="middle" fill="#f5b425" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
          {obj.idx}
        </text>
      )}
    </g>
  );
}

function ST_PhaseBranch({ phase, baseY, completedSet, onToggle, selectedId, setSelected }) {
  // Layout: trunk on the left, objectives spread on a curve to the right
  const trunkX = 80;
  const phaseLabelY = baseY + 30;
  const stepY = 78;
  const objs = phase.objectives.map((o, i) => ({
    ...o, idx: i + 1,
    x: 230 + (i % 2) * 0,
    y: baseY + 80 + i * stepY,
  }));

  const allDone = phase.objectives.every(o => completedSet.has(o.id));
  const phaseColor = allDone ? "#4ade80" : "#f5b425";

  return (
    <g>
      {/* Phase trunk */}
      <line x1={trunkX} y1={baseY} x2={trunkX} y2={objs[objs.length-1].y + 20} stroke="rgba(245,180,37,0.2)" strokeWidth="2" strokeDasharray="3 5" />

      {/* Phase node — big diamond */}
      <g transform={`translate(${trunkX}, ${phaseLabelY})`}>
        <polygon points="0,-22 22,0 0,22 -22,0" fill="#0a0a0d" stroke={phaseColor} strokeWidth="1.8" />
        <polygon points="0,-12 12,0 0,12 -12,0" fill={`${phaseColor}22`} />
        <text textAnchor="middle" y="4" fill={phaseColor} fontSize="11" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
          {String(phase.number).padStart(2,"0")}
        </text>
      </g>

      {/* Phase label to the left of trunk */}
      <foreignObject x={trunkX + 36} y={phaseLabelY - 24} width="140" height="60">
        <div style={{ fontSize: 11, letterSpacing: 1.5, color: phaseColor, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", fontWeight: 600 }}>
          FASE {String(phase.number).padStart(2,"0")}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 2, lineHeight: 1.15 }}>
          {phase.title}
        </div>
        <div style={{ fontSize: 11, color: "#6c6c75", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          +{phase.xp} XP • {phase.duration}
        </div>
      </foreignObject>

      {/* Connector from trunk to nodes (and between nodes vertically) */}
      {objs.map((o, i) => {
        const prevObj = i > 0 ? objs[i-1] : null;
        const prevUnlocked = i === 0 || completedSet.has(prevObj.id);
        return (
          <g key={"conn-" + o.id}>
            {/* horizontal stub from trunk */}
            <path d={`M ${trunkX} ${o.y} Q ${(trunkX+o.x)/2} ${o.y}, ${o.x - 28} ${o.y}`}
              fill="none" stroke={prevUnlocked ? "rgba(245,180,37,0.3)" : "rgba(255,255,255,0.06)"} strokeWidth="1.5" />
            {/* vertical between consecutive */}
            {prevObj && (
              <line x1={prevObj.x} y1={prevObj.y + 26} x2={o.x} y2={o.y - 26}
                stroke={completedSet.has(prevObj.id) ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.06)"}
                strokeWidth="1.5" strokeDasharray={completedSet.has(prevObj.id) ? "0" : "3 4"} />
            )}
          </g>
        );
      })}

      {/* Nodes + labels */}
      {objs.map((o, i) => {
        const prevObj = i > 0 ? objs[i-1] : null;
        const unlocked = i === 0 || completedSet.has(prevObj.id);
        const completed = completedSet.has(o.id);
        return (
          <g key={o.id}>
            <ST_Node obj={o} x={o.x} y={o.y} unlocked={unlocked} completed={completed}
              onToggle={onToggle} onSelect={setSelected} isSelected={selectedId === o.id} />
            <foreignObject x={o.x + 38} y={o.y - 22} width="280" height="60" style={{ pointerEvents: "none" }}>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: completed ? "#4ade80" : unlocked ? "#fff" : "#6c6c75",
                textDecoration: completed ? "line-through" : "none",
                lineHeight: 1.2,
              }}>{o.title}</div>
              <div style={{ fontSize: 11, color: "#a0a0a8", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", display: "flex", gap: 6 }}>
                {o.tags?.slice(0,2).map((t, ti) => (
                  <span key={ti} style={{ padding: "1px 6px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}>{t}</span>
                ))}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

function ST_Detail({ obj, completed }) {
  if (!obj) return (
    <div style={{ padding: "32px 28px", color: "#6c6c75", fontSize: 13, textAlign: "center", fontStyle: "italic" }}>
      Clique em qualquer nó da árvore para ver os detalhes da habilidade.
    </div>
  );
  return (
    <div style={{ padding: "24px 24px 28px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: "#f5b425", textTransform: "uppercase", marginBottom: 8 }}>
        ◇ Skill Detail
      </div>
      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: completed ? "#4ade80" : "#fff" }}>
        {obj.title}
      </h3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {obj.tags?.map((t, i) => (
          <span key={i} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "2px 8px",
            border: "1px solid rgba(245,180,37,0.3)", color: "#f5b425", borderRadius: 2, textTransform: "uppercase", letterSpacing: 0.5,
          }}>{t}</span>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 14, color: "#c0c0c8", lineHeight: 1.6 }}>{obj.summary}</div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#a0a0a8", lineHeight: 1.65 }}>{obj.detail}</div>
      {obj.tip && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(245,180,37,0.06)", border: "1px solid rgba(245,180,37,0.2)", borderRadius: 6, fontSize: 12, color: "#f5b425", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <window.Icon name="info" size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span><b>Dica:</b> {obj.tip}</span>
        </div>
      )}
    </div>
  );
}

function SkillTree() {
  const data = window.QUEST_DATA;
  const [completedSet, setCompletedSet] = useStateST(new Set());
  const [selectedId, setSelectedId] = useStateST(null);

  const onToggle = (id) => {
    setCompletedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Compute layout — phases stacked vertically
  const phaseHeights = data.phases.map(p => 80 + p.objectives.length * 78 + 40);
  const yOffsets = phaseHeights.reduce((acc, h, i) => {
    acc.push(i === 0 ? 80 : acc[i-1] + phaseHeights[i-1]);
    return acc;
  }, []);
  const totalHeight = yOffsets[yOffsets.length - 1] + phaseHeights[phaseHeights.length - 1];

  const allObjectives = data.phases.flatMap(p => p.objectives);
  const totalDone = allObjectives.filter(o => completedSet.has(o.id)).length;
  const pct = Math.round((totalDone / allObjectives.length) * 100);

  const selectedObj = allObjectives.find(o => o.id === selectedId);

  return (
    <div style={st_styles.root}>
      {/* Subtle hex pattern bg */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />

      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#f5b425", boxShadow: "0 0 12px #f5b425" }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Rota Legal</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#6c6c75" }}>
          <span>Vistos</span>
          <span>Para Brasileiros</span>
          <span>Requisitos</span>
          <span>Mudanças</span>
          <span>Fontes</span>
          <span style={{ color: "#fff", borderBottom: "1px solid #f5b425", paddingBottom: 4 }}>Guia Prático</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
        <ST_FlagPT size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "#f5b425", textTransform: "uppercase", marginBottom: 4 }}>
            Skill Tree • Legalização
          </div>
          <h1 style={{ margin: 0, fontSize: 48, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
            Como se legalizar em <span style={{ color: "#f5b425" }}>{data.country}</span>
          </h1>
          <div style={{ marginTop: 10, fontSize: 14, color: "#a0a0a8", maxWidth: 640 }}>
            Cada nó é uma habilidade que você desbloqueia. Complete uma para abrir a próxima da árvore.
          </div>
        </div>

        {/* Progress card */}
        <div style={{
          padding: "16px 20px", border: "1px solid rgba(245,180,37,0.25)", borderRadius: 12,
          background: "linear-gradient(180deg, rgba(245,180,37,0.06), rgba(245,180,37,0.01))",
          minWidth: 220,
        }}>
          <div style={{ fontSize: 11, color: "#a0a0a8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Progresso geral
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#f5b425", lineHeight: 1 }}>{pct}<span style={{ fontSize: 18, opacity: 0.7 }}>%</span></span>
            <span style={{ fontSize: 12, color: "#6c6c75", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
              {totalDone}/{allObjectives.length} skills
            </span>
          </div>
          <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #f5b425, #4ade80)", transition: "width 0.4s" }} />
          </div>
        </div>
      </div>

      {/* Main: tree + detail panel */}
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, position: "relative", zIndex: 1 }}>
        {/* Tree canvas */}
        <div style={{
          background: "linear-gradient(180deg, #0c0c10, #08080b)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
          padding: "20px 24px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Frame label */}
          <div style={{ position: "absolute", top: 10, left: 16, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, color: "#6c6c75", textTransform: "uppercase" }}>
            ◇ JOURNEY TREE • {allObjectives.length} NODES
          </div>

          <svg width="100%" height={totalHeight} viewBox={`0 0 760 ${totalHeight}`} style={{ marginTop: 18 }}>
            <defs>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stopColor="#f5b425" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#f5b425" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {data.phases.map((p, i) => (
              <ST_PhaseBranch key={p.id} phase={p} baseY={yOffsets[i]}
                completedSet={completedSet} onToggle={onToggle}
                selectedId={selectedId} setSelected={setSelectedId} />
            ))}
            {/* Final reward — trophy at bottom */}
            <g transform={`translate(80, ${totalHeight - 30})`}>
              <circle r="20" fill="#0a0a0d" stroke={pct === 100 ? "#4ade80" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={pct === 100 ? "0" : "3 4"} />
              <g transform="translate(-9, -9)" stroke={pct === 100 ? "#4ade80" : "#6c6c75"} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6H1.5A1.5 1.5 0 0 1 1.5 3H3"/><path d="M15 6h1.5A1.5 1.5 0 0 0 16.5 3H15"/>
                <path d="M2 19h14"/><path d="M9 12.66V14a.97.97 0 0 1-.79 1C7.21 15.6 6 16.86 6 18"/>
                <path d="M9 12.66V14c0 .47.39.86.79 1 1 .51 2.21 1.86 2.21 3"/>
                <path d="M15 2H3v6a4 4 0 0 0 12 0V2Z"/>
              </g>
            </g>
            <foreignObject x="118" y={totalHeight - 50} width="280" height="40">
              <div style={{ fontSize: 13, fontWeight: 600, color: pct === 100 ? "#4ade80" : "#a0a0a8" }}>
                Cidadania PT (após 5 anos)
              </div>
              <div style={{ fontSize: 11, color: "#6c6c75", fontFamily: "'JetBrains Mono', monospace" }}>
                Recompensa final • Passaporte UE
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Detail panel */}
        <div style={{ position: "sticky", top: 0, alignSelf: "start" }}>
          <div style={{
            background: "linear-gradient(180deg, #0d0d11, #0a0a0d)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
            overflow: "hidden",
          }}>
            <ST_Detail obj={selectedObj} completed={selectedId && completedSet.has(selectedId)} />
          </div>

          {/* Legend */}
          <div style={{
            marginTop: 12, padding: "14px 16px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: "#6c6c75", textTransform: "uppercase", marginBottom: 10 }}>
              Legenda
            </div>
            {[
              { c: "#f5b425", l: "Disponível para desbloquear" },
              { c: "#4ade80", l: "Concluído" },
              { c: "#3a3a42", l: "Bloqueado — complete o anterior" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, border: `1.5px solid ${row.c}`, background: `${row.c}22` }} />
                <span style={{ fontSize: 12, color: "#c0c0c8" }}>{row.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 20, padding: "12px 16px",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6c6c75",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8,
      }}>
        // Dados extraídos em {data.updated}. Confirme nas fontes oficiais antes de iniciar.
      </div>
    </div>
  );
}

window.SkillTree = SkillTree;

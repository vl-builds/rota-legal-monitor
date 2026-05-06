// ===== PASSPORT RESULT CARD =====

function PassportResult({ ranking, answers, onRestart }) {
  const winner = ranking[0];
  const runners = ranking.slice(1, 3);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="scene-in" style={{
      maxWidth: 1180, margin: "0 auto", padding: "100px 32px 80px"
    }}>
      <Eyebrow>Resultado · Match {winner.match}%</Eyebrow>
      <h1 style={{
        fontSize: "clamp(40px, 5vw, 64px)",
        lineHeight: 1.02, letterSpacing: "-0.03em",
        fontWeight: 800, margin: 0, marginBottom: 12
      }}>
        Seu destino é<br/>
        <span style={{ color: "var(--gold)" }}>{winner.name}.</span>
      </h1>
      <p style={{ fontSize: 17, color: "var(--ink-dim)", maxWidth: 540, marginBottom: 56 }}>
        {winner.tagline}
      </p>

      {/* Passport card */}
      <Passport country={winner} opened={opened} answers={answers} />

      {/* Runners-up */}
      <div style={{ marginTop: 64 }}>
        <Eyebrow color="var(--ink-faint)">Outros bons matches</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {runners.map(c => <RunnerUpCard key={c.code} country={c} />)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 56, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <button onClick={onRestart} style={{
          background: "var(--gold)", border: "none", color: "#0a0908",
          padding: "14px 28px", borderRadius: 999, fontSize: 14, fontWeight: 600,
          cursor: "pointer", boxShadow: "0 4px 24px rgba(251,191,36,0.25)"
        }}>Refazer o teste →</button>
        <button style={{
          background: "transparent", border: "1px solid var(--line-2)",
          color: "var(--ink)", padding: "14px 28px", borderRadius: 999,
          fontSize: 14, fontWeight: 500, cursor: "pointer"
        }}>Ver guia prático {winner.code} →</button>
        <button style={{
          background: "transparent", border: "1px solid var(--line-2)",
          color: "var(--ink)", padding: "14px 28px", borderRadius: 999,
          fontSize: 14, fontWeight: 500, cursor: "pointer"
        }}>Comparar com outros</button>
      </div>
    </div>
  );
}

function Passport({ country, opened, answers }) {
  return (
    <div style={{
      perspective: 1600, height: 460, position: "relative"
    }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transform: opened ? "rotateY(0deg)" : "rotateY(0deg)",
        transition: "transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)"
      }}>
        {/* Open passport (two-page spread) */}
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 0,
          borderRadius: 8, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
        }}>
          {/* Left page — flag + emblem */}
          <PassportLeft country={country} />
          {/* Right page — data */}
          <PassportRight country={country} opened={opened} answers={answers} />
        </div>
      </div>
    </div>
  );
}

function PassportLeft({ country }) {
  const stripes = country.flag;
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1816 0%, #0f0e0c 100%)",
      borderRight: "1px solid rgba(255,255,255,0.04)",
      padding: 36, position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
      {/* security pattern */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.04,
        background: "repeating-linear-gradient(45deg, var(--gold) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, var(--gold) 0 1px, transparent 1px 14px)",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative" }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: "0.2em",
          color: "var(--gold)", marginBottom: 14
        }}>· PASSAPORTE / PASSPORT ·</div>
        <div style={{
          fontSize: 11, letterSpacing: "0.16em",
          color: "var(--ink-faint)", textTransform: "uppercase",
          fontWeight: 500
        }}>República de Oportunidades</div>
      </div>

      {/* Big flag */}
      <div style={{
        width: "100%", aspectRatio: "3 / 2", maxHeight: 200,
        borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        margin: "16px 0"
      }}>
        {stripes.map((color, i) => (
          <div key={i} style={{ flex: 1, background: color }} />
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: "0.16em",
          color: "var(--ink-faint)", marginBottom: 4
        }}>CÓDIGO ISO</div>
        <div style={{
          fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em",
          color: "var(--ink)", lineHeight: 1
        }}>{country.code}</div>
      </div>
    </div>
  );
}

function PassportRight({ country, opened, answers }) {
  const lines = [
    ["NOME / SURNAME", country.name.toUpperCase()],
    ["CAPITAL",         country.capital.toUpperCase()],
    ["VISTO RECOM.",    country.visa.toUpperCase()],
    ["CIDADANIA",       country.citizenship.toUpperCase()],
    ["MATCH",           `${country.match}%`],
    ["EMITIDO",         new Date().toLocaleDateString("pt-BR").toUpperCase()]
  ];
  return (
    <div style={{
      background: "linear-gradient(135deg, #f4f1eb 0%, #e8e4dc 100%)",
      color: "#1a1816", padding: 36,
      display: "flex", flexDirection: "column", position: "relative",
      overflow: "hidden"
    }}>
      {/* paper grain */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.03,
        background: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)"
      }} />

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div className="mono" style={{
          fontSize: 9, letterSpacing: "0.2em",
          color: "rgba(26,24,22,0.5)"
        }}>P&lt;{country.code}{country.name.replace(/ /g, "").toUpperCase().slice(0, 8)}</div>
        <div className="mono" style={{
          fontSize: 9, letterSpacing: "0.16em",
          color: "rgba(26,24,22,0.5)"
        }}>N° RL-{Math.floor(Math.random() * 9000 + 1000)}</div>
      </div>

      <div style={{ position: "relative", flex: 1 }}>
        {lines.map(([k, v], i) => (
          <div key={k} style={{
            display: "grid", gridTemplateColumns: "120px 1fr",
            gap: 12, padding: "12px 0",
            borderBottom: i < lines.length - 1 ? "1px solid rgba(26,24,22,0.08)" : "none",
            opacity: opened ? 1 : 0,
            transform: opened ? "translateY(0)" : "translateY(8px)",
            transition: `all 420ms cubic-bezier(0.22, 1, 0.36, 1) ${300 + i * 80}ms`
          }}>
            <div className="mono" style={{
              fontSize: 9, letterSpacing: "0.14em",
              color: "rgba(26,24,22,0.45)", paddingTop: 4
            }}>{k}</div>
            <div className="mono" style={{
              fontSize: 13, fontWeight: 500, letterSpacing: "0.02em"
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Stamp */}
      {opened && (
        <div style={{
          position: "absolute", bottom: 28, right: 28,
          border: `2.5px solid ${country.accent}`,
          color: country.accent,
          padding: "8px 14px",
          borderRadius: 4, animation: "stampDrop 700ms cubic-bezier(0.22, 1, 0.36, 1) 1100ms both"
        }}>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: "0.18em", fontWeight: 600,
            textTransform: "uppercase", lineHeight: 1.1
          }}>Aprovado<br/>· {country.match}% ·</div>
        </div>
      )}
    </div>
  );
}

function RunnerUpCard({ country }) {
  return (
    <div style={{
      background: "var(--bg-2)", border: "1px solid var(--line)",
      borderRadius: 14, padding: 22, display: "flex", gap: 18, alignItems: "center"
    }}>
      <div style={{
        width: 52, height: 68, borderRadius: 4, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 8px 18px rgba(0,0,0,0.4)"
      }}>
        {country.flag.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ flex: 1 }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: "0.14em",
          color: "var(--gold)", marginBottom: 4
        }}>{country.match}% MATCH</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{country.name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-dim)" }}>{country.tagline}</div>
      </div>
    </div>
  );
}

window.PassportResult = PassportResult;

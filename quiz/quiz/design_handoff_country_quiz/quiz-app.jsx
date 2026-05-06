// ===== MAIN APP =====

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showLivePreview": true,
  "autoAdvance": true,
  "atmosphere": "warm",
  "sceneDensity": "spacious",
  "passportTone": "cream"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [step, setStep] = useState(0); // 0 = hero, 1..6 = questions, 7 = result
  const [answers, setAnswers] = useState({});
  const total = QUIZ_QUESTIONS.length;

  const currentQ = step >= 1 && step <= total ? QUIZ_QUESTIONS[step - 1] : null;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  const ranking = useMemo(() => partialRanking(answers), [answers]);
  const finalRanking = useMemo(() => scoreCountries(answers), [answers]);

  const handleAnswer = useCallback((qid, val) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    if (t.autoAdvance) {
      setTimeout(() => {
        setStep(s => s < total + 1 ? s + 1 : s);
      }, 420);
    }
  }, [t.autoAdvance, total]);

  const handleNext = () => setStep(s => Math.min(total + 1, s + 1));
  const handleBack = () => setStep(s => Math.max(0, s - 1));
  const handleStart = () => setStep(1);
  const handleRestart = () => { setAnswers({}); setStep(0); };
  const handleExit = () => { setStep(0); };

  const atmosphereTints = ["a", "b", "c", "d", "e", "f"];
  const sceneTint = currentQ ? atmosphereTints[step - 1] : "hero";

  return (
    <>
      <style>{sharedKeyframes}</style>
      <SceneAtmosphere tint={sceneTint} />
      {step > 0 && step <= total && <ProgressBar step={step} total={total} />}
      <TopNav step={step} total={total} onExit={handleExit} />

      {step > 0 && step <= total && t.showLivePreview && (
        <LivePreviewRail ranking={ranking} visible={true} />
      )}

      <main style={{ position: "relative", zIndex: 10 }}>
        {step === 0 && <Hero onStart={handleStart} />}
        {currentQ && (
          <QuestionScene
            key={currentQ.id}
            q={currentQ}
            value={currentAnswer}
            onChange={(v) => handleAnswer(currentQ.id, v)}
            onBack={step === 1 ? handleExit : handleBack}
            onNext={handleNext}
            canNext={!!currentAnswer}
            step={step}
            total={total}
            autoAdvance={t.autoAdvance}
            density={t.sceneDensity}
          />
        )}
        {step === total + 1 && (
          <PassportResult
            ranking={finalRanking}
            answers={answers}
            onRestart={handleRestart}
          />
        )}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Comportamento">
          <TweakToggle label="Avançar automático" value={t.autoAdvance}
            onChange={(v) => setTweak("autoAdvance", v)} />
          <TweakToggle label="Mostrar 3 bandeiras live" value={t.showLivePreview}
            onChange={(v) => setTweak("showLivePreview", v)} />
        </TweakSection>
        <TweakSection title="Atmosfera">
          <TweakRadio label="Tom de fundo" value={t.atmosphere}
            onChange={(v) => setTweak("atmosphere", v)}
            options={[
              { label: "Quente", value: "warm" },
              { label: "Neutro", value: "neutral" },
              { label: "Frio", value: "cool" }
            ]} />
          <TweakRadio label="Densidade" value={t.sceneDensity}
            onChange={(v) => setTweak("sceneDensity", v)}
            options={[
              { label: "Compacto", value: "compact" },
              { label: "Espaçado", value: "spacious" }
            ]} />
        </TweakSection>
        <TweakSection title="Resultado">
          <TweakRadio label="Tom da página" value={t.passportTone}
            onChange={(v) => setTweak("passportTone", v)}
            options={[
              { label: "Creme", value: "cream" },
              { label: "Escuro", value: "dark" }
            ]} />
        </TweakSection>
      </TweaksPanel>

      {/* Tweak: atmosphere overrides body bg */}
      <style>{`
        body {
          background: ${t.atmosphere === "cool" ? "#080a0d" : t.atmosphere === "neutral" ? "#0c0c0c" : "#0a0908"};
        }
      `}</style>
    </>
  );
}

// =========================================================================
// HERO
// =========================================================================
function Hero({ onStart }) {
  return (
    <div className="scene-in" style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "1fr 1fr", gap: 40,
      alignItems: "center",
      padding: "120px 64px 60px",
      maxWidth: 1280, margin: "0 auto"
    }}>
      <div>
        <Eyebrow>Descubra · 6 perguntas · 2 minutos</Eyebrow>
        <h1 style={{
          fontSize: "clamp(48px, 6vw, 88px)",
          lineHeight: 1.0, letterSpacing: "-0.035em",
          fontWeight: 800, margin: 0, marginBottom: 24
        }}>
          Qual país<br/>
          combina com<br/>
          <span style={{ color: "var(--gold)" }}>você?</span>
        </h1>
        <p style={{
          fontSize: 17, color: "var(--ink-dim)", maxWidth: 480,
          lineHeight: 1.55, marginBottom: 36
        }}>
          Uma jornada visual em 6 cenas. Cada resposta cruza com dados reais de
          10 países e atualiza seu ranking ao vivo. No fim, você recebe um passaporte
          com seu match.
        </p>
        <button onClick={onStart} style={{
          background: "var(--gold)", border: "none", color: "#0a0908",
          padding: "16px 32px", borderRadius: 999, fontSize: 15,
          fontWeight: 600, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(251,191,36,0.3)",
          transition: "transform 200ms ease"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
          Começar a jornada →
        </button>
        <div style={{
          display: "flex", gap: 28, marginTop: 36,
          color: "var(--ink-faint)"
        }}>
          {[
            ["10", "países"],
            ["6", "perguntas"],
            ["3", "matches"]
          ].map(([n, l]) => (
            <div key={l}>
              <div className="mono" style={{
                fontSize: 28, fontWeight: 600, color: "var(--ink)",
                letterSpacing: "-0.02em"
              }}>{n}</div>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: "0.14em",
                textTransform: "uppercase"
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <HeroVisual />
    </div>
  );
}

// Decorative right side: orbiting flag chips around a gold circle
function HeroVisual() {
  const visibleCountries = QUIZ_COUNTRIES.slice(0, 10);
  return (
    <div style={{
      position: "relative", height: 540, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      {/* Central gold disc */}
      <div style={{
        width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, var(--gold) 0%, var(--gold-deep) 100%)",
        boxShadow: "0 0 80px rgba(251,191,36,0.35), inset 0 -20px 40px rgba(0,0,0,0.2)",
        position: "relative", zIndex: 2,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div className="mono" style={{
          fontSize: 11, color: "rgba(10,9,8,0.7)",
          letterSpacing: "0.16em", textAlign: "center", lineHeight: 1.6,
          textTransform: "uppercase", fontWeight: 600
        }}>
          Match<br/>
          <span style={{ fontSize: 32, color: "#0a0908", letterSpacing: "-0.02em", fontWeight: 800 }}>?%</span><br/>
          aguardando
        </div>
      </div>

      {/* Orbital ring with flags */}
      <div style={{
        position: "absolute", inset: 0,
        animation: "orbit 60s linear infinite"
      }}>
        {visibleCountries.map((c, i) => {
          const angle = (i / visibleCountries.length) * Math.PI * 2;
          const r = 230;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          return (
            <div key={c.code} style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              animation: "orbit 60s linear infinite reverse"
            }}>
              <div style={{
                width: 36, height: 48, borderRadius: 3, overflow: "hidden",
                display: "flex", flexDirection: "column",
                boxShadow: "0 6px 18px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)"
              }}>
                {c.flag.map((color, j) => <div key={j} style={{ flex: 1, background: color }} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Orbit ring guides */}
      <div style={{
        position: "absolute", width: 460, height: 460, borderRadius: "50%",
        border: "1px dashed rgba(251,191,36,0.18)"
      }} />
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.04)"
      }} />
    </div>
  );
}

// =========================================================================
// QUESTION SCENE WRAPPER
// =========================================================================
function QuestionScene({ q, value, onChange, onBack, onNext, canNext, step, total, autoAdvance, density }) {
  const SceneComp = QUIZ_SCENES[q.sceneKind];
  const padTop = density === "compact" ? 110 : 140;
  const padBottom = density === "compact" ? 60 : 100;
  return (
    <div className="scene-in" key={q.id} style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center",
      padding: `${padTop}px 64px ${padBottom}px`,
      maxWidth: 1100, margin: "0 auto"
    }}>
      <div style={{ maxWidth: 940 }}>
        <Eyebrow>{`Pergunta 0${step} de 0${total}`}</Eyebrow>
        <SceneTitle>{q.title}</SceneTitle>
        <SceneSubtitle>{q.subtitle}</SceneSubtitle>

        <div style={{ marginTop: 44 }}>
          <SceneComp q={q} value={value} onChange={onChange} />
        </div>

        <SceneFooter
          onBack={onBack}
          onNext={onNext}
          canNext={canNext}
          autoHint={autoAdvance ? "Selecionar avança automaticamente" : null}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

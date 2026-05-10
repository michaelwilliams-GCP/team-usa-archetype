// Team USA Athlete Archetype Finder
// Google Cloud x Team USA Hackathon – Challenge 4
// Powered by Gemini API
// License: Apache 2.0

import { useState } from "react";
import { useOlympicData, buildDataContext } from "./useOlympicData";
import ShareCard from "./ShareCard";

// ─── Gemini API ───────────────────────────────────────────────────────────────
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

function buildPrompt(p, dataContext = "") {
  const heightCm = Math.round(p.height * 2.54);
  const weightKg = Math.round(p.weight * 0.4536);
  const bmi      = (weightKg / ((heightCm / 100) ** 2)).toFixed(1);
  const feet     = Math.floor(p.height / 12);
  const inches   = p.height % 12;

  return `You are the most sophisticated Team USA athlete analytics engine ever built — a fusion of 120 years of Olympic and Paralympic biomechanics data, sports science research, and the storytelling instincts of a world-class ESPN documentary director.

Your job: make this fan feel genuinely seen. Not generic. Not vague. IMPOSSIBLY SPECIFIC. When they read their result they should think "how did it know that?" That specificity is the wow.

═══════════════════════════════════════
FAN BIOMETRIC PROFILE (PRE-COMPUTED FOR PRECISION)
═══════════════════════════════════════
Height:  ${feet}ft ${inches}in (${heightCm}cm exactly)
Weight:  ${p.weight}lbs (${weightKg}kg exactly)
BMI:     ${bmi} (calculated precisely)
Age:     ${p.age} years old
Strength: ${p.primaryStrength}
Environment: ${p.environment}
Physical considerations: ${p.physicalConsiderations || "None"}

${dataContext}

═══════════════════════════════════════
YOUR MISSION: CREATE THE "HOW DID IT KNOW THAT?" MOMENT
═══════════════════════════════════════
Identify 3 Team USA Athlete Archetypes. Make each one feel like it was written specifically for THIS person's exact numbers — not a generic body type category.

For EACH archetype you must deliver:

1. BIOMETRIC PRECISION — Reference the fan's ACTUAL numbers with surgical specificity:
   "At ${heightCm}cm, your frame sits exactly 3cm above the historical average for Team USA swimmers"
   "Your ${weightKg}kg build falls within the top 12% of USA track athletes historically"
   "With a BMI of ${bmi}, you align with the optimal range for 87% of successful Team USA ${sport} competitors"
   Use real data averages from the context above. Make it feel like their exact measurements were destiny.

2. GOLDEN ERA MOMENT — ONE specific Olympic/Paralympic Games (real city + year) where athletes with THIS EXACT PROFILE had a defining Team USA moment:
   "At the 1996 Atlanta Games, athletes averaging your exact ${heightCm}cm/${weightKg}kg build contributed to Team USA's most dominant swimming performance ever recorded"
   "During the 2012 London Paralympics, competitors with your precise biometric profile led the most successful wheelchair basketball campaign in USA history"
   This must feel like a real historical anchor, not generic — name the city, year, and specific achievement.

3. AGE ARC ANALYSIS — Where does ${p.age} sit in the typical athlete development timeline for this sport?
   "At ${p.age}, you're entering the prime developmental window when most Team USA ${sport} athletes hit their breakthrough performances"
   "Your ${p.age} age marks you as a late bloomer in ${sport}, following the path of champions who peaked after their 25th birthday"
   "At ${p.age}, you align with the average age of Team USA ${sport} athletes during their most medal-dominant phase"

4. FUN FACT BANNER — One impossible-to-ignore stat about their body profile in Team USA history:
   "Only 3% of Team USA athletes in history have matched your exact ${heightCm}cm/${weightKg}kg build ratio"
   "Athletes with your BMI of ${bmi} have won 67% of all Team USA ${sport} gold medals since 1980"
   "Your biometric profile appears in just 1.2% of the 120-year Team USA athlete database"

5. CONDITIONAL LANGUAGE — Always use: "could align with," "profiles like yours have historically," "your biometrics suggest affinity for," "this build has often found success in." NEVER guarantee results.

6. PARALYMPIC PARITY — The 3rd archetype MUST be a Paralympic sport. Give it the same analytical depth, the same golden era moment, the same excitement. Do not treat it as a footnote.

7. ARCHETYPE NAMES — Invent bold, original names that feel like superhero classifications:
   "The Structural Powerhouse," "The Aerodynamic Ghost," "The Coiled Spring," "The Iron Meridian," "The Kinetic Architect," "The Silent Accelerator," "The Quantum Frame," "The Velocity Matrix," "The Precision Forge"

═══════════════════════════════════════
CRITICAL OUTPUT RULES
═══════════════════════════════════════
- Return ONLY valid JSON. Zero markdown. Zero preamble. No backticks.
- Every string field must be complete — no "..." or placeholders
- why field: 4 sentences minimum, reference actual cm/kg/BMI numbers with precision
- goldenEra field: must name a real Games city and year with specific achievement
- historicalNote: must include a specific pattern or trend with real percentages/numbers
- funFact: must be a surprising, specific stat about this exact body profile
- lateBloomer: must reference their exact age ${p.age} and position it in the development arc

{
  "overallArchetype": "bold single archetype name for this fan",
  "tagline": "one punchy sentence — their athletic DNA in plain english",
  "funFact": "one surprising, specific stat about this exact body profile in Team USA history",
  "archetypes": [
    {
      "rank": 1,
      "archetypeName": "bold creative name",
      "sport": "sport name",
      "paralympic": false,
      "matchScore": 94,
      "tagline": "punchy one-liner — make it feel impossibly personal",
      "why": "4+ sentences referencing actual ${heightCm}cm/${weightKg}kg/BMI ${bmi} numbers and how they compare to historical USA averages. Use conditional language. Make it feel like their exact measurements were destiny.",
      "goldenEra": "One cinematic sentence about a specific Games year+city and what athletes with this EXACT profile achieved for Team USA",
      "historicalNote": "2-3 sentences on a specific pattern or trend in Team USA history for this sport with similar biometrics, including real percentages or numbers",
      "lateBloomer": "One sentence about where age ${p.age} sits in the development arc for this sport, with specific context",
      "traits": ["specific trait 1", "specific trait 2", "specific trait 3", "specific trait 4"]
    },
    {
      "rank": 2,
      "archetypeName": "bold creative name",
      "sport": "sport name",
      "paralympic": false,
      "matchScore": 89,
      "tagline": "punchy one-liner with biometric specificity",
      "why": "4+ sentences with real numbers and conditional language — same depth as rank 1",
      "goldenEra": "specific Games year+city cinematic moment with exact profile reference",
      "historicalNote": "specific pattern or trend with real data points",
      "lateBloomer": "age arc sentence with ${p.age} specificity",
      "traits": ["trait 1", "trait 2", "trait 3", "trait 4"]
    },
    {
      "rank": 3,
      "archetypeName": "bold creative name",
      "sport": "Paralympic sport name",
      "paralympic": true,
      "matchScore": 83,
      "tagline": "punchy one-liner with same depth as others",
      "why": "4+ sentences with real numbers and conditional language — same analytical depth as ranks 1 and 2",
      "goldenEra": "specific Paralympic Games year+city cinematic moment with exact profile reference",
      "historicalNote": "specific Paralympic Team USA pattern or trend with real data points",
      "lateBloomer": "age arc sentence with ${p.age} specificity",
      "traits": ["trait 1", "trait 2", "trait 3", "trait 4"]
    }
  ]
}`;
}

async function analyzeProfile(apiKey, profile, dataContext) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(profile, dataContext) }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1500 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini error (${res.status})`);
  }
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Empty Gemini response");
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const STRENGTHS = [
  { value: "power", emoji: "💪", label: "Power & Strength", desc: "Raw force, lifting, explosive moves" },
  { value: "speed", emoji: "⚡", label: "Speed & Explosiveness", desc: "Sprints, quick bursts of energy" },
  { value: "endurance", emoji: "🫀", label: "Endurance & Stamina", desc: "Long efforts, sustained performance" },
  { value: "precision", emoji: "🎯", label: "Precision & Skill", desc: "Technical mastery, coordination" },
  { value: "agility", emoji: "🤸", label: "Agility & Flexibility", desc: "Movement, balance, body control" },
];

const ENVIRONMENTS = [
  { value: "team", emoji: "👥", label: "Team Sports" },
  { value: "individual", emoji: "🏃", label: "Individual" },
  { value: "combat", emoji: "🥊", label: "Combat / Contact" },
  { value: "water", emoji: "🌊", label: "Water Sports" },
  { value: "winter", emoji: "❄️", label: "Winter Sports" },
  { value: "precision_sport", emoji: "🎯", label: "Precision Sports" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06080F; }

  .app { background: #06080F; min-height: 100vh; color: #E2E8F7; font-family: 'Barlow', sans-serif; }
  .df  { font-family: 'Bebas Neue', sans-serif; letter-spacing: .05em; }
  .cf  { font-family: 'Barlow Condensed', sans-serif; }

  .hero-bg {
    background:
      radial-gradient(ellipse at 15% 50%, rgba(200,16,46,.18) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 50%, rgba(0,40,104,.22) 0%, transparent 55%),
      #06080F;
  }

  .card { background: rgba(11,17,33,.97); border: 1px solid rgba(70,120,185,.18); border-radius: 12px; }

  .scard {
    background: rgba(11,17,33,.8);
    border: 1.5px solid rgba(70,120,185,.14);
    border-radius: 10px;
    padding: 16px 12px;
    cursor: pointer;
    text-align: center;
    transition: all .18s;
  }
  .scard:hover  { border-color: rgba(200,16,46,.45); background: rgba(200,16,46,.06); }
  .scard.active { border-color: #C8102E; background: rgba(200,16,46,.12); box-shadow: 0 0 18px rgba(200,16,46,.14); }

  .btn-r {
    background: #C8102E; color: #fff; border: none;
    padding: 14px 36px;
    font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 17px;
    letter-spacing: .1em; text-transform: uppercase; border-radius: 6px; cursor: pointer;
    transition: all .18s;
  }
  .btn-r:hover:not(:disabled) { background: #A50D25; transform: translateY(-1px); }
  .btn-r:disabled { opacity: .45; cursor: not-allowed; }

  .btn-g {
    background: transparent; color: #E2E8F7;
    border: 1px solid rgba(70,120,185,.35);
    padding: 12px 28px;
    font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 15px;
    letter-spacing: .08em; text-transform: uppercase; border-radius: 6px; cursor: pointer;
    transition: all .18s;
  }
  .btn-g:hover { border-color: rgba(70,120,185,.75); }

  .inp {
    background: rgba(11,17,33,.9);
    border: 1.5px solid rgba(70,120,185,.2);
    border-radius: 8px; color: #E2E8F7;
    padding: 12px 16px;
    font-family: 'Barlow', sans-serif; font-size: 16px;
    width: 100%; outline: none;
    transition: border-color .18s;
  }
  .inp:focus { border-color: rgba(200,16,46,.5); }

  .lbl {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; color: #5A6A88;
    letter-spacing: .15em; text-transform: uppercase;
    margin-bottom: 7px;
  }

  .stripe {
    background: linear-gradient(135deg,#C8102E,#8B0B1F);
    padding: 9px 0; text-align: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; letter-spacing: .3em; font-size: 11px; color: #fff;
  }

  .rank-badge {
    background: linear-gradient(135deg,#C8102E,#8B0B1F);
    color: #fff; width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 17px;
    flex-shrink: 0;
  }

  .para-badge {
    background: rgba(70,120,185,.18);
    border: 1px solid rgba(70,120,185,.45);
    color: #7EB3F0; padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  }

  .bar-bg { height: 4px; background: rgba(70,120,185,.1); border-radius: 2px; }
  .bar-fill { height: 4px; background: linear-gradient(90deg,#C8102E,#FF4D6D); border-radius: 2px; transition: width 1s ease-out; }

  .trait {
    background: rgba(200,16,46,.08);
    border: 1px solid rgba(200,16,46,.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; color: #D4607A;
    font-family: 'Barlow Condensed', sans-serif; font-weight: 600; letter-spacing: .05em;
  }

  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.75)} }
  .dot { animation: pulse 1.4s infinite; width:12px; height:12px; border-radius:50%; background:#C8102E; }

  @keyframes rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .rise { animation: rise .55s ease-out forwards; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("intro");
  const [apiKey, setApiKey]     = useState("");
  const [results, setResults]   = useState(null);
  const [error, setError]       = useState("");
  const [showShare, setShowShare] = useState(false);
  const [profile, setProfile]   = useState({
    height: "", weight: "", age: "",
    primaryStrength: "", environment: "",
    physicalConsiderations: "",
  });

  // Load and parse the Olympic CSV in the background
  const { sportStats, loading: dataLoading } = useOlympicData();

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const canGo = profile.height && profile.weight && profile.age &&
                profile.primaryStrength && profile.environment;

  const run = async () => {
    setError(""); setScreen("loading");
    try {
      const dataContext = buildDataContext(sportStats, profile);
      const data = await analyzeProfile(apiKey, profile, dataContext);
      setResults(data); setScreen("results");
    } catch (e) {
      setError(e.message); setScreen("form");
    }
  };

  const reset = () => {
    setResults(null);
    setProfile({ height:"", weight:"", age:"", primaryStrength:"", environment:"", physicalConsiderations:"" });
    setScreen("form");
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === "intro") return (
    <>
      <style>{css}</style>
      <div className="app hero-bg" style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <div className="stripe">⭐ TEAM USA ⭐ GOOGLE CLOUD HACKATHON ⭐ GEMINI AI ⭐</div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 24px", textAlign:"center" }}>
          <p className="cf" style={{ fontSize:13, color:"#4A7FBF", letterSpacing:".28em", textTransform:"uppercase", marginBottom:14, fontWeight:600 }}>
            120 Years of Team USA Data
          </p>
          <h1 className="df" style={{ fontSize:"clamp(58px,10vw,104px)", lineHeight:.92, marginBottom:12 }}>
            FIND YOUR<br/>
            <span style={{ color:"#C8102E" }}>TEAM USA</span><br/>
            SPORT
          </h1>
          <p style={{ fontSize:17, color:"#7A8DAD", maxWidth:460, lineHeight:1.65, marginBottom:44, fontWeight:300 }}>
            Discover which Olympic and Paralympic Team USA sports your body profile could historically align with — powered by Gemini AI.
          </p>
          <button className="btn-r" style={{ fontSize:19, padding:"16px 52px" }} onClick={() => setScreen("setup")}>
            Start My Analysis →
          </button>
          <div style={{ marginTop:48, display:"flex", gap:36, color:"#2E3D58", fontSize:13 }} className="cf">
            <span>🏅 Olympic Sports</span>
            <span>♿ Paralympic Sports</span>
            <span>🤖 Gemini AI</span>
          </div>
        </div>
      </div>
    </>
  );

  // ── SETUP (API KEY) ────────────────────────────────────────────────────────
  if (screen === "setup") return (
    <>
      <style>{css}</style>
      <div className="app" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div className="card" style={{ maxWidth:460, width:"100%", padding:"40px 36px" }}>
          <p className="cf" style={{ fontSize:12, color:"#4A7FBF", letterSpacing:".25em", textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Step 1 of 2</p>
          <h2 className="df" style={{ fontSize:38, marginBottom:10 }}>CONNECT GEMINI</h2>
          <p style={{ color:"#5A6A88", fontSize:15, lineHeight:1.65, marginBottom:24 }}>
            Enter your Google AI Studio API key. Get one free at{" "}
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color:"#4A7FBF" }}>aistudio.google.com</a>
          </p>
          <label className="lbl">Gemini API Key</label>
          <input className="inp" type="password" placeholder="AIza..." value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ marginBottom:16 }} />
          <div style={{ background:"rgba(70,120,185,.07)", border:"1px solid rgba(70,120,185,.18)", borderRadius:8, padding:"12px 16px", marginBottom:28, fontSize:13, color:"#5A6A88", lineHeight:1.55 }}>
            🔒 Used only for this session. For Cloud Run deployment, move to a server-side env variable.
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-g" onClick={() => setScreen("intro")}>Back</button>
            <button className="btn-r" style={{ flex:1 }} disabled={!apiKey.trim()} onClick={() => setScreen("form")}>Continue →</button>
          </div>
        </div>
      </div>
    </>
  );

  // ── FORM ───────────────────────────────────────────────────────────────────
  if (screen === "form") return (
    <>
      <style>{css}</style>
      <div className="app" style={{ minHeight:"100vh", padding:"40px 24px 60px" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <p className="cf" style={{ fontSize:12, color:"#4A7FBF", letterSpacing:".25em", textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Step 2 of 2</p>
            <h2 className="df" style={{ fontSize:42 }}>YOUR PROFILE</h2>
            <p style={{ color:"#5A6A88", fontSize:15 }}>Tell us about yourself for a personalized archetype analysis</p>
          </div>

          {/* Data status */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <span className="cf" style={{ fontSize:12, padding:"4px 14px", borderRadius:20, letterSpacing:".1em",
              background: dataLoading ? "rgba(70,120,185,.1)" : "rgba(40,160,80,.1)",
              border: `1px solid ${dataLoading ? "rgba(70,120,185,.2)" : "rgba(40,160,80,.25)"}`,
              color: dataLoading ? "#4A7FBF" : "#4CAF7D"
            }}>
              {dataLoading ? "⏳ Loading 120yr dataset..." : "✅ 271K athlete records loaded"}
            </span>
          </div>

          {error && (
            <div style={{ background:"rgba(200,16,46,.1)", border:"1px solid rgba(200,16,46,.3)", borderRadius:8, padding:"12px 16px", marginBottom:20, color:"#FF6B7A", fontSize:14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Biometrics */}
          <div className="card" style={{ padding:24, marginBottom:18 }}>
            <p className="cf" style={{ fontSize:13, color:"#4A7FBF", letterSpacing:".2em", textTransform:"uppercase", marginBottom:16, fontWeight:600 }}>Biometrics</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { key:"height", label:"Height (in)", placeholder:"70" },
                { key:"weight", label:"Weight (lbs)", placeholder:"165" },
                { key:"age",    label:"Age",          placeholder:"26" },
              ].map(f => (
                <div key={f.key}>
                  <label className="lbl">{f.label}</label>
                  <input className="inp" type="number" placeholder={f.placeholder} value={profile[f.key]} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Primary Strength */}
          <div className="card" style={{ padding:24, marginBottom:18 }}>
            <p className="cf" style={{ fontSize:13, color:"#4A7FBF", letterSpacing:".2em", textTransform:"uppercase", marginBottom:4, fontWeight:600 }}>Primary Athletic Strength</p>
            <p style={{ fontSize:13, color:"#3E4F6A", marginBottom:16 }}>What's your natural edge?</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {STRENGTHS.map(s => (
                <div key={s.value} className={`scard${profile.primaryStrength===s.value?" active":""}`} onClick={() => set("primaryStrength", s.value)}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{s.emoji}</div>
                  <div className="cf" style={{ fontWeight:600, fontSize:15, marginBottom:4, color:"#E2E8F7" }}>{s.label}</div>
                  <div style={{ fontSize:12, color:"#3E4F6A" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div className="card" style={{ padding:24, marginBottom:18 }}>
            <p className="cf" style={{ fontSize:13, color:"#4A7FBF", letterSpacing:".2em", textTransform:"uppercase", marginBottom:4, fontWeight:600 }}>Sport Environment</p>
            <p style={{ fontSize:13, color:"#3E4F6A", marginBottom:16 }}>Where do you see yourself competing?</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {ENVIRONMENTS.map(e => (
                <div key={e.value} className={`scard${profile.environment===e.value?" active":""}`} onClick={() => set("environment", e.value)} style={{ padding:"14px 8px" }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{e.emoji}</div>
                  <div className="cf" style={{ fontWeight:600, fontSize:13, color:"#E2E8F7" }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Considerations */}
          <div className="card" style={{ padding:24, marginBottom:28 }}>
            <p className="cf" style={{ fontSize:13, color:"#4A7FBF", letterSpacing:".2em", textTransform:"uppercase", marginBottom:4, fontWeight:600 }}>Physical Considerations <span style={{ color:"#2E3D58" }}>(Optional)</span></p>
            <p style={{ fontSize:13, color:"#3E4F6A", marginBottom:12 }}>Share any considerations to unlock the full Team USA picture, including Paralympic pathways.</p>
            <textarea className="inp" rows={3} placeholder="e.g., missing limb, visual impairment, wheelchair user — or leave blank..." value={profile.physicalConsiderations} onChange={e => set("physicalConsiderations", e.target.value)} style={{ resize:"vertical" }} />
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-g" onClick={() => setScreen("setup")}>Back</button>
            <button className="btn-r" style={{ flex:1 }} disabled={!canGo} onClick={run}>Analyze My Archetype →</button>
          </div>
        </div>
      </div>
    </>
  );

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (screen === "loading") return (
    <>
      <style>{css}</style>
      <div className="app" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ display:"flex", gap:10, marginBottom:32 }}>
          {[0,1,2].map(i => <div key={i} className="dot" style={{ animationDelay:`${i*.28}s` }} />)}
        </div>
        <h2 className="df" style={{ fontSize:44, marginBottom:12 }}>ANALYZING YOUR PROFILE</h2>
        <p style={{ color:"#5A6A88", fontSize:16 }}>Gemini is searching 120 years of Team USA data…</p>
        <div className="cf" style={{ marginTop:44, display:"flex", gap:24, color:"#1E2C42", fontSize:13 }}>
          <span>⏳ Biometric Analysis</span>
          <span>📊 Archetype Clustering</span>
          <span>🏅 Olympic & Paralympic Match</span>
        </div>
      </div>
    </>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (screen === "results" && results) return (
    <>
      <style>{css}</style>
      <div className="app" style={{ paddingBottom:64 }}>
        <div className="stripe">⭐ YOUR TEAM USA ANALYSIS ⭐ POWERED BY GEMINI ⭐</div>

        {/* Hero */}
        <div className="hero-bg" style={{ padding:"52px 24px", textAlign:"center", borderBottom:"1px solid rgba(70,120,185,.13)" }}>
          <p className="cf" style={{ fontSize:12, color:"#4A7FBF", letterSpacing:".28em", textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>Your Team USA Archetype</p>
          <h1 className="df" style={{ fontSize:"clamp(42px,8vw,78px)", color:"#C8102E", marginBottom:14 }}>{results.overallArchetype}</h1>
          <p style={{ fontSize:18, color:"#7A8DAD", maxWidth:520, margin:"0 auto", lineHeight:1.65, fontWeight:300 }}>{results.tagline}</p>
          {results.funFact && (
            <div style={{ marginTop:24, display:"inline-block", background:"rgba(200,16,46,.1)", border:"1px solid rgba(200,16,46,.25)", borderRadius:8, padding:"10px 20px", fontSize:14, color:"#E2A0AA", maxWidth:480 }}>
              ⚡ {results.funFact}
            </div>
          )}
        </div>

        {/* Cards */}
        <div style={{ maxWidth:620, margin:"0 auto", padding:"36px 24px 0" }}>
          <p className="cf" style={{ fontSize:12, color:"#4A7FBF", letterSpacing:".25em", textTransform:"uppercase", marginBottom:22, fontWeight:600 }}>Your Sport Matches</p>

          {results.archetypes?.map((a, i) => (
            <div key={i} className="card rise" style={{ padding:24, marginBottom:16, animationDelay:`${i*.15}s` }}>

              <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
                <div className="rank-badge">{a.rank}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                    <span className="cf" style={{ fontSize:21, fontWeight:700, color:"#E2E8F7" }}>{a.sport}</span>
                    {a.paralympic && <span className="para-badge">Paralympic</span>}
                  </div>
                  <span className="cf" style={{ fontSize:13, color:"#C8102E", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" }}>{a.archetypeName}</span>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div className="df" style={{ fontSize:30 }}>{a.matchScore}%</div>
                  <div className="cf" style={{ fontSize:11, color:"#3E4F6A", letterSpacing:".1em", textTransform:"uppercase" }}>Match</div>
                </div>
              </div>

              {/* Tagline */}
              <p className="cf" style={{ fontSize:15, color:"#C8102E", fontWeight:600, marginBottom:12, letterSpacing:".02em" }}>{a.tagline}</p>

              <div className="bar-bg" style={{ marginBottom:18 }}>
                <div className="bar-fill" style={{ width:`${a.matchScore}%` }} />
              </div>

              {/* Why — biometric analysis */}
              <p style={{ fontSize:14, color:"#7A8DAD", lineHeight:1.75, marginBottom:14 }}>{a.why}</p>

              {/* Golden Era moment */}
              {a.goldenEra && (
                <div style={{ background:"rgba(200,16,46,.07)", border:"1px solid rgba(200,16,46,.25)", borderLeft:"3px solid #C8102E", borderRadius:8, padding:"12px 14px", marginBottom:12, fontSize:14, color:"#E2A0AA", lineHeight:1.65, fontStyle:"italic" }}>
                  🏅 {a.goldenEra}
                </div>
              )}

              {/* Historical note */}
              <div style={{ background:"rgba(70,120,185,.06)", border:"1px solid rgba(70,120,185,.15)", borderLeft:"3px solid rgba(70,120,185,.35)", borderRadius:8, padding:"12px 14px", marginBottom:12, fontSize:13, color:"#5A6A88", lineHeight:1.6 }}>
                📚 {a.historicalNote}
              </div>

              {/* Late bloomer / age arc */}
              {a.lateBloomer && (
                <div style={{ background:"rgba(70,185,120,.05)", border:"1px solid rgba(70,185,120,.18)", borderLeft:"3px solid rgba(70,185,120,.4)", borderRadius:8, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#4CAF7D", lineHeight:1.6 }}>
                  🕐 {a.lateBloomer}
                </div>
              )}

              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {a.traits?.map((t, ti) => <span key={ti} className="trait">{t}</span>)}
              </div>
            </div>
          ))}

          <div style={{ display:"flex", gap:12, marginTop:28 }}>
            <button className="btn-g" style={{ flex:1 }} onClick={reset}>Try Another Profile</button>
            <button className="btn-r" onClick={() => setShowShare(true)}>🔗 Share My Archetype</button>
          </div>

          {showShare && (
            <ShareCard
              results={results}
              profile={profile}
              onClose={() => setShowShare(false)}
            />
          )}

          <p style={{ marginTop:28, fontSize:12, color:"#1E2C42", textAlign:"center", lineHeight:1.65, borderTop:"1px solid rgba(70,120,185,.1)", paddingTop:20 }}>
            Built for the Team USA × Google Cloud Hackathon · Powered by Gemini AI<br/>
            Results reflect historical patterns and use conditional language. Individual outcomes will vary.
          </p>
        </div>
      </div>
    </>
  );

  return null;
}

"use client";
import { useState, useMemo } from "react";

// ── Data ──
const LOANS = [
  { id: "j1", bank: "J은행 1", amount: 10000, type: "신용", loanType: "마통", rate: 5.83, maturity: "2026.06.22", payDay: 6, monthly: Math.round(10000 * 0.0583 / 12), note: "만기 임박 — 연장 필요" },
  { id: "j2", bank: "J은행 2", amount: 196, type: "신용", loanType: "원리금분할", rate: 8.0, maturity: "2031.02.19", payDay: 25, monthly: 4.8, note: "" },
  { id: "j3", bank: "J은행 3", amount: 300, type: "신용", loanType: "마통", rate: 6.2, maturity: "2026.11.15", payDay: 25, monthly: Math.round(300 * 0.062 / 12 * 10) / 10, note: "" },
  { id: "k1", bank: "K은행 1", amount: 300, type: "신용", loanType: "마통", rate: 5.74, maturity: "2027.01.31", payDay: 31, monthly: Math.round(300 * 0.0574 / 12 * 10) / 10, note: "" },
  { id: "k2", bank: "K은행 2", amount: 300, type: "신용", loanType: "마통", rate: 6.22, maturity: "2026.08.19", payDay: 19, monthly: Math.round(300 * 0.0622 / 12 * 10) / 10, note: "만기 임박" },
  { id: "s1", bank: "S은행", amount: 1150, type: "신용", loanType: "마통(예담대)", rate: 3.96, maturity: "2027.10.10", payDay: 4, monthly: Math.round(1150 * 0.0396 / 12 * 10) / 10, note: "최저 금리" },
  { id: "n1", bank: "N은행", amount: 4000, type: "신용", loanType: "마통", rate: 5.71, maturity: "2026.08.25", payDay: 24, monthly: Math.round(4000 * 0.0571 / 12 * 10) / 10, note: "만기 임박 — 연장 필요" },
  { id: "jb1", bank: "JB은행 1", amount: 544, type: "신용", loanType: "원리금균등분할", rate: 7.67, maturity: "2031.01.26", payDay: 26, monthly: 11.3, note: "" },
  { id: "jb2", bank: "JB은행 2", amount: 236, type: "신용", loanType: "원리금균등분할", rate: 7.63, maturity: "2031.02.05", payDay: 5, monthly: 4.8, note: "" },
  { id: "h1", bank: "H은행 (주담대)", amount: 33700, type: "주담대", loanType: "원리금균등분할", rate: 3.0, maturity: "장기", payDay: 29, monthly: 129, note: "아파트 6.5억 담보" },
];

const SCENARIOS = [
  { id: "safe", name: "안전 우선", emoji: "🛡️", alloc: "S&P 500 (VOO)", rate: 0.10, label: "연 10%", color: "#3d7a50" },
  { id: "balanced", name: "균형 성장", emoji: "⚖️", alloc: "QQQ 70% + VOO 30%", rate: 0.13, label: "연 13%", color: "#3a6aab" },
  { id: "aggro", name: "공격 성장", emoji: "🚀", alloc: "QQQ 100%", rate: 0.15, label: "연 15%", color: "#a0714a" },
  { id: "ultra", name: "최대 공격", emoji: "⚡", alloc: "QQQ + 소형성장(VBK)", rate: 0.18, label: "연 18%", color: "#b94444" },
];

const REJECT_REASONS = [
  { name: "코인 선물", reason: "전면 금지. 어떤 레버리지든 나에게는 독." },
  { name: "코인 현물", reason: "역사 15년, -70% 가능. 차트를 보게 되고 매매로 이어진다." },
  { name: "코스피/코스닥", reason: "20년 평균 연 5-6%. 같은 기간 S&P 500은 11%." },
  { name: "개별주 (삼성전자 등)", reason: "판단이 필요. 차트를 보게 하는 문이다." },
];

const SECTIONS_DATA = {
  principles: [
    { n: 1, t: "몸 안의 나와 몸 밖의 나를 함께 운영한다.", s: "감정 속에 있되 지배당하지 않는다. 관찰자이되 온기를 잃지 않는다." },
    { n: 2, t: "큰 방향성을 믿되 오늘을 함부로 살지 않는다.", s: "북극성이 있다고 수면, 건강, 재무, 업무를 흐트러뜨리지 않는다." },
    { n: 3, t: "확신은 크게, 판단은 작게 검증한다.", s: "장기 방향은 맞아도 개별 선택은 틀릴 수 있다." },
    { n: 4, t: "실패는 데이터다. 그러나 반복 실패는 끊는다.", s: "'데이터 수집'이라는 이름으로 같은 파괴를 반복하지 않는다." },
    { n: 5, t: "행복을 미래의 보상으로 미루지 않는다.", s: "행복은 보상이 아니라 능력이다. 지금 이 순간에도 충만할 수 있다." },
    { n: 6, t: "포지션의 안개와 존재의 안개를 혼동하지 않는다.", s: "자리가 아직 없는 것이 내 존재가 애매한 것은 아니다." },
    { n: 7, t: "운명감은 엔진으로 쓰고 면죄부로 쓰지 않는다.", s: "'나는 결국 된다'가 무모한 판단을 정당화하지 않게 한다." },
    { n: 8, t: "고통을 미화하지 않는다.", s: "반복되는 소모는 낭만이 아니라 교정 대상이다." },
    { n: 9, t: "'의미 도파민'도 도파민이다.", s: "방향을 찾았다는 흥분도 중독의 변형이 될 수 있다." },
    { n: 10, t: "분석은 충분하다. 이제 필요한 건 실행이다.", s: "원칙이 행동이 되는 건 날짜가 붙었을 때다." },
    { n: 11, t: "크게 믿되, 작게 증명한다.", s: "꿈은 북극성이다. 매일의 기준은 '오늘 하나를 검증했는가'이다. 시대를 바꾸겠다는 야망이 매일의 조급함이 되면, 그건 선물판과 같은 구조다." },
  ],
  sentences: [
    "거대한 방향성은 유지하되, 일상의 행복을 죄책감 없이 누릴 수 있는 사람.",
    "역사를 바꾸려는 의지는 가지되, 오늘의 바람과 가족의 온기도 함께 살아낼 수 있는 사람.",
    "캐릭터를 운영하는 플레이어이면서도, 동시에 그 캐릭터의 눈물과 기쁨을 실제로 느낄 수 있는 사람.",
    "운명감은 가져도 되지만, 면죄부로 쓰면 안 된다.",
    "서사는 크게, 운영은 촘촘하게.",
    "확신은 크게, 판단은 작게 검증.",
    "행복은 보상이 아니라 능력이다.",
    "포지션의 안개가 존재의 안개는 아니다.",
    "나는 벌어도 청산당할 사람이다. 그것을 아는 것이 나의 힘이다.",
    "느린 길이 실제로는 빠른 길이었다.",
    "난 다 이룬다. 그것이 나를 위한 게 아니라 우리를 위해.",
    "작은 것들의 신. 작게 작게 하나씩 위닝해나간다.",
    "크게 믿되, 작게 증명한다.",
    "끝난 건 지옥이다. 나는 시작이다.",
  ],
};

// ── Helpers ──
function fKRW(n) {
  if (n >= 10000) { const e = Math.floor(n / 10000); const m = Math.round(n % 10000); return m > 0 ? `${e}억 ${m.toLocaleString()}만원` : `${e}억원`; }
  return `${n.toLocaleString()}만원`;
}
function fKRWShort(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}억`;
  return `${n.toLocaleString()}만`;
}

function simulate(monthly, rate, years, esc) {
  const mr = rate / 12;
  let bal = 0, cm = monthly, ti = 0;
  const yd = [];
  for (let m = 1; m <= years * 12; m++) {
    if (m > 1 && (m - 1) % 12 === 0) cm = cm * (1 + esc / 100);
    ti += cm;
    bal = (bal + cm) * (1 + mr);
    if (m % 12 === 0) yd.push({ y: m / 12, b: Math.round(bal / 10000), i: Math.round(ti / 10000) });
  }
  return { final: Math.round(bal / 10000), invested: Math.round(ti / 10000), data: yd };
}

// ── Styles ──
const C = {
  bg: "#faf8f5", surface: "#fff", surface2: "#f5f2ed", border: "#ddd8d0",
  text: "#1a1a1a", mid: "#3a3a3a", dim: "#5c5c5c", muted: "#8a8a8e",
  accent: "#a0714a", accentSoft: "rgba(160,113,74,0.08)",
  danger: "#b94444", dangerSoft: "rgba(185,68,68,0.07)",
  green: "#3d7a50", greenSoft: "rgba(61,122,80,0.07)",
  blue: "#3a6aab", blueSoft: "rgba(58,106,171,0.07)",
  purple: "#7a5aab", purpleSoft: "rgba(122,90,171,0.07)",
};

const s = {
  page: { fontFamily: "'Noto Sans KR', -apple-system, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", lineHeight: 1.8 },
  container: { maxWidth: 700, margin: "0 auto", padding: "40px 20px 120px" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  label: { fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 },
  h3: { fontSize: 17, fontWeight: 700, marginBottom: 10, color: C.text },
  p: { fontSize: 14, color: C.mid, lineHeight: 1.85, margin: 0 },
  sectionNum: { fontSize: 11, letterSpacing: 4, color: C.accent, marginBottom: 6 },
  sectionTitle: { fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 },
  sectionSub: { fontSize: 14, color: C.dim, marginBottom: 24 },
  divider: { height: 1, background: C.border, margin: "48px 0" },
  sentence: { padding: "20px 24px", background: C.surface, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 8px 8px 0", marginBottom: 10, fontSize: 15, fontWeight: 500, color: C.text, lineHeight: 1.8 },
};

// ── Components ──
function Section({ num, title, sub, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={s.sectionNum}>{num}</div>
      <h2 style={s.sectionTitle}>{title}</h2>
      {sub && <div style={s.sectionSub}>{sub}</div>}
      {children}
    </div>
  );
}

function Card({ label, labelColor, title, children }) {
  return (
    <div style={s.card}>
      {label && <div style={{ ...s.label, color: labelColor || C.accent }}>{label}</div>}
      {title && <h3 style={s.h3}>{title}</h3>}
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix, note }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.mid }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
      {note && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{note}</div>}
    </div>
  );
}

// ── Futures Simulator ──
function FuturesSimulator() {
  const [startCapital, setStartCapital] = useState(50);
  const [dailyRate, setDailyRate] = useState(2);
  const [simYears, setSimYears] = useState(3);
  const [tick, setTick] = useState(0);

  const TRADING_DAYS = 250;

  const dreamResult = useMemo(() => {
    const days = TRADING_DAYS * simYears;
    return startCapital * Math.pow(1 + dailyRate / 100, days);
  }, [startCapital, dailyRate, simYears]);

  const realityResult = useMemo(() => {
    const days = TRADING_DAYS * simYears;
    const results = [];
    for (let sim = 0; sim < 100; sim++) {
      let cap = startCapital;
      for (let d = 0; d < days && cap > 0; d++) {
        cap *= Math.random() < 0.5 ? (1 + dailyRate / 100) : (1 - (dailyRate / 100) * 1.2);
        if ((d + 1) % 22 === 0) cap *= (1 - (0.15 + Math.random() * 0.15));
        if ((d + 1) % 63 === 0 && Math.random() < 0.3) cap *= (1 - (0.5 + Math.random() * 0.3));
        if (cap < 0) cap = 0;
      }
      results.push(Math.max(0, cap));
    }
    results.sort((a, b) => a - b);
    const median = results[49];
    const billionCount = results.filter(r => r >= 10000).length;
    return { median, billionCount };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCapital, dailyRate, simYears, tick]);

  function fHuge(n) {
    if (n >= 100000000) return `${(n / 100000000).toFixed(0)}조원`;
    if (n >= 10000) return `${(n / 10000).toFixed(1)}억원`;
    if (n >= 1) return `${Math.round(n).toLocaleString()}만원`;
    return "0원";
  }

  const startStr = `${startCapital}만원`;
  const goldGrad = "linear-gradient(135deg, #b8860b, #ffd700, #daa520)";

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ background: "#0e0e0e", borderRadius: 16, padding: "28px", border: `1px solid ${C.danger}`, boxShadow: "0 4px 24px rgba(185,68,68,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🎰 신기루 시뮬레이터</div>
          <div style={{ fontSize: 12, color: "#888", letterSpacing: 1 }}>선물로 10억을 벌 수 있을까?</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          {[
            { label: "시작 자금", value: startCapital, min: 50, max: 1000, step: 50, suffix: "만원", onChange: setStartCapital },
            { label: "일 평균 수익률", value: dailyRate, min: 1, max: 5, step: 0.5, suffix: "%", onChange: setDailyRate },
            { label: "기간", value: simYears, min: 1, max: 10, step: 1, suffix: "년", onChange: setSimYears },
          ].map(({ label, value, min, max, step, suffix, onChange }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#bbb" }}>{label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#ffd700" }}>{value}{suffix}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#ffd700" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
                <span>{min}{suffix}</span><span>{max}{suffix}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "linear-gradient(145deg, #1a1400, #221c00)", border: "1px solid #7a5c00", borderRadius: 12, padding: "20px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#b8860b", marginBottom: 10, fontWeight: 700 }}>꿈의 시나리오</div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 16, lineHeight: 1.6 }}>매일 복리<br />(연 250 거래일)</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{startStr}</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>↓ {simYears}년 후</div>
            <div style={{
              fontSize: dreamResult > 1e8 ? 18 : 22,
              fontWeight: 700,
              background: goldGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.3,
            }}>
              {fHuge(dreamResult)}
            </div>
          </div>

          <div style={{ background: "linear-gradient(145deg, #180000, #200404)", border: `1px solid #6b1a1a`, borderRadius: 12, padding: "20px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: C.danger, marginBottom: 10, fontWeight: 700 }}>현실 시나리오</div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 16, lineHeight: 1.6 }}>100회 몬테카를로<br />중간값(median)</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{startStr}</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>↓ {simYears}년 후</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.danger, lineHeight: 1.3, marginBottom: 10 }}>
              {realityResult.median < 1 ? "0원" : fHuge(realityResult.median)}
            </div>
            <div style={{ fontSize: 11, color: "#a04444", background: "rgba(185,68,68,0.1)", borderRadius: 6, padding: "6px 8px" }}>
              100번 중 10억 달성: <strong style={{ color: C.danger }}>{realityResult.billionCount}회</strong>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>꿈</div>
              <div style={{ fontSize: 13, color: "#ffd700", fontWeight: 700 }}>{startStr} → {fHuge(dreamResult)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>현실</div>
              <div style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>{startStr} → {realityResult.median < 1 ? "0원" : fHuge(realityResult.median)}</div>
              <div style={{ fontSize: 11, color: "#777" }}>(100번 중 {100 - realityResult.billionCount}번은 이쪽)</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, fontSize: 13, lineHeight: 2, color: "#bbb", textAlign: "center" }}>
            <strong style={{ color: "#fff" }}>이것이 닿을 듯 아닐 듯의 정체다.</strong><br />
            꿈의 숫자는 수학적으로 맞다.<br />
            하지만 <strong style={{ color: C.danger }}>단 한 번의 청산이 전부를 지운다.</strong>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button onClick={() => setTick(t => t + 1)} style={{
            padding: "8px 28px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20, color: "#aaa", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s",
          }}>🔄 재시뮬레이션</button>
        </div>

        <div style={{ background: "rgba(185,68,68,0.08)", border: "1px solid rgba(185,68,68,0.25)", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: C.danger, fontWeight: 700, marginBottom: 12 }}>나의 실제 기록</div>
          <div style={{ fontSize: 14, color: "#ccc", lineHeight: 2.1 }}>
            6년간 매매 → 퇴직금 전액 소실 + 대출 5억<br />
            1000만원 → 1억8천 달성 → <strong style={{ color: C.danger }}>전액 청산</strong>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: "#888", fontStyle: "italic" }}>
            나는 이 시뮬레이션의 '현실' 쪽에 있었다.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export default function LifeOS() {
  const [tab, setTab] = useState("overview");
  const [monthly, setMonthly] = useState(50);
  const [years, setYears] = useState(20);
  const [esc, setEsc] = useState(5);

  const creditLoans = LOANS.filter(l => l.type === "신용").sort((a, b) => b.amount - a.amount);
  const totalCredit = creditLoans.reduce((s, l) => s + l.amount, 0);
  const mortgage = LOANS.find(l => l.type === "주담대");

  const investResults = useMemo(() =>
    SCENARIOS.map(sc => ({ ...sc, ...simulate(monthly * 10000, sc.rate, years, esc) })),
    [monthly, years, esc]
  );

  const tabs = [
    { id: "overview", label: "인생 OS" },
    { id: "debt", label: "부채 현황" },
    { id: "invest", label: "딸의 펀드" },
    { id: "deepdive", label: "1년 딥다이브" },
    { id: "action", label: "즉시 실행" },
  ];

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>Life Operating System v4</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", background: `linear-gradient(135deg, ${C.text}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>내 인생의 운영체제</h1>
          <div style={{ fontSize: 13, color: C.dim }}>1988년생 · 39세 · 2026년 봄, 이곳에서 나왔다</div>
        </div>

        {/* ── Core Quote ── */}
        <div style={{ padding: "28px", background: C.accentSoft, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 10px 10px 0", marginBottom: 16, fontSize: 17, lineHeight: 2, color: C.text }}>
          난 감정을 오롯이 느끼고 그것에 오롯이 공감하고<br />
          만물을 사랑하고 취하기도 매혹적이기도<br />
          바람에 공기에 감사함을 느끼기도 하는<br />
          충만한 인생을 살고싶다<br />
          <strong>그것이 나의 전부다.</strong>
        </div>

        {/* ── Second Quote ── */}
        <div style={{ padding: "28px", background: C.accentSoft, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 10px 10px 0", marginBottom: 32, fontSize: 20, lineHeight: 2, color: C.text, fontWeight: 700 }}>
          작은 것들의 신.<br />
          작게 작게 하나씩 위닝해나간다.<br />
          그게 그냥 전부다.
        </div>

        {/* ── Tab Nav ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: `1px solid ${C.border}`, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 16px", fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? C.accent : C.dim, background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB: OVERVIEW */}
        {/* ═══════════════════════════════════════ */}
        {tab === "overview" && (
          <>
            {/* North Star */}
            <div style={{ textAlign: "center", padding: "40px 28px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: 11, letterSpacing: 5, color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>★ 북극성 — 매일 쳐다보지 않는다. 방향만 확인한다</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>시간의 자유, 경제의 구속에서의 해방,<br />가족과 오롯이 함께하는 삶</h2>
              <p style={{ fontSize: 14, color: C.dim, maxWidth: 500, margin: "0 auto 16px", lineHeight: 1.8 }}>나인원한남은 이 무형의 가치를 유형화한 상징이다. 매일 쳐다보면 현재가 초라해지고, "빠르게"를 찾게 되고, 그게 선물판이었다.</p>
              <p style={{ fontSize: 14, color: C.mid, maxWidth: 520, margin: "0 auto", lineHeight: 1.9 }}>나의 꿈은 부자가 되는 것이 아니다. 인간이 자기 도파민을 컨트롤해서 자기주도적으로 살 수 있게 돕는 것이다. 그리고 그 과정에서 나 자신이 가장 충만하게 사는 것이다. 부는 그 결과로 따라오는 것이지 출발점이 아니다.</p>
            </div>

            {/* Who Am I */}
            <Section num="01" title="나는 누구인가" sub="6년의 지옥에서 가져온 데이터로 증명된 나의 본질">
              <Card label="본질" title="경험을 시스템으로 번역하는 사람">
                <p style={s.p}>소비자형 인간이 아니라 구조자형 인간이다. 조직의 병목을 보고, 흐름을 읽고, 혼란을 개념화하고, 그것을 제품과 운영체계로 바꾸는 사람이다.</p>
              </Card>
              <Card label="욕구의 실체" title="부자가 되고 싶었던 게 아니다">
                <p style={s.p}>진짜 원했던 건 <strong>자유, 인정, 안정, 존엄</strong>이었다. 1억8천을 벌었을 때 행복이 아니라 "남들만큼 돌아왔다"는 감각이 먼저 온 것이 그 증거다.</p>
              </Card>
              <Card label="고유 자산" title="6년간 진짜 쌓은 것">
                <p style={s.p}>돈은 다 날렸다. 하지만 인간 심리의 극한을 몸으로 아는 데이터는 안 날아갔다. 이 경험 + 토스 임원 직속. <strong>이 조합을 가진 사람은 드물다.</strong></p>
              </Card>
              <div style={{ ...s.card, borderColor: C.accent, background: C.accentSoft }}>
                <div style={{ ...s.label, color: C.accent }}>변곡점</div>
                <h3 style={s.h3}>나의 세계가 끝났다 — 2026년 3월</h3>
                <p style={s.p}>아팠다. 허리도 다리저림도 두통도 열도. 원인은 하나로 뚜렷하지 않았다. 그러나 난 알았다. 지금이 바로 그 변곡이구나. 선물의 악마가 나간다. 난 더이상 매매를 할 힘이 없다. 꺾였다는 것이 맞다. 나의 힘은 회사의 수익과 부수수익으로 쏠린다. 끝난 건 지옥이다. 나는 시작이다.</p>
              </div>
              <div style={{ ...s.card, borderColor: C.purple, background: C.purpleSoft }}>
                <div style={{ ...s.label, color: C.purple }}>나의 꿈</div>
                <h3 style={s.h3}>도파민에 파괴당하는 사람들을 구하는 것</h3>
                <p style={s.p}>6년간 선물판에서 1000만원을 1억8천으로 만들었다가 전부 잃고, 퇴직금을 날리고, 대출 5억을 만들었다. 감성이 메말랐고, 가족 앞에서 떳떳하지 못했다. 그런데 살아서 나왔다. 너처럼 도파민에 갉아먹히고 있는 사람들이 자기 파괴 직전에 멈출 수 있게 하는 시스템을 만드는 것. 선물 매매 중독자, 충동 쇼핑에 카드값이 감당 안 되는 사람, 새벽 3시에 배달앱을 열고 있는 사람, 인스타를 3시간째 스크롤하면서 자기혐오에 빠진 사람. 파괴적 도파민을 건설적 도파민으로 리다이렉션하는 AI 에이전트. 그리고 그 시스템의 첫 번째 유저이자 첫 번째 증거가 바로 나다.</p>
              </div>
            </Section>

            {/* Three Questions */}
            <Section num="02" title="모든 결정의 세 가지 기준" sub="이 세 질문이 동시에 YES일 때만 실행한다">
              {[
                { q: "20년 뒤 딸이 이걸 보면 어떻게 느낄까?", l: "기준 1 — 가족", c: C.accent, bg: C.accentSoft },
                { q: "이것이 나를 충만하게 하는가?", l: "기준 2 — 충만", c: C.green, bg: C.greenSoft },
                { q: "이 결정은 내 출혈을 실제로 줄이는가?", l: "기준 3 — 출혈", c: C.danger, bg: C.dangerSoft },
              ].map((q, i) => (
                <div key={i} style={{ padding: "20px 24px", borderRadius: 12, border: `1px solid ${q.c}`, background: q.bg, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, color: q.c, marginBottom: 6, textTransform: "uppercase" }}>{q.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{q.q}</div>
                </div>
              ))}
            </Section>

            {/* Closed Game */}
            <Section num="03" title="선물 — 끝난 게임" sub="실력이 있기 때문에 더 위험하다. 50만원도 하지 않는다.">
              <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 12, padding: "16px 20px", textAlign: "center", marginBottom: 16, fontSize: 14, color: C.danger, fontWeight: 700 }}>
                ⛔ 선물 · 코인 선물 · 레버리지 ETF · 마진 거래 — 금액 불문 전면 금지. 50만원도 하지 않는다. 끝났다.
              </div>
              <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 12, padding: "28px", marginBottom: 16 }}>
                <h3 style={{ color: C.danger, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🚨 차트가 보고 싶어질 때의 프로토콜</h3>
                <ol style={{ paddingLeft: 20, fontSize: 14, color: C.mid, margin: 0 }}>
                  {[
                    "멈춘다. 3초간 숨을 쉰다.",
                    '"나는 벌어도 청산당할 사람이다. 그리고 그때는 죽으려 할 것이다."',
                    '"이 결정은 내 출혈을 실제로 줄이는가?"',
                    "딸의 얼굴을 떠올린다.",
                    "차트 대신 Wave OS 노트를 연다.",
                    "그래도 안 되면 — 아내에게 말한다.",
                  ].map((t, i) => <li key={i} style={{ marginBottom: 8, lineHeight: 1.7 }}>{t}</li>)}
                </ol>
              </div>
              <FuturesSimulator />
            </Section>

            {/* Business Path */}
            <Section num="04" title="유일한 경로 — 사업" sub="월급으로는 북극성에 닿지 못한다.">
              <Card label="WAVE OS" labelColor={C.purple} title="자기파괴 루프를 멈추게 하는 시스템">
                <p style={s.p}>매매 도구가 아니다. 인간이 도파민에 의해 자기 파괴적 결정을 반복하는 구조를 인식하고 빠져나오게 돕는 시스템이다. 6년의 지옥이 원재료다. R&D를 인생으로 지불한 것이다.<br /><br /><strong>증명할 건 딱 하나: "이 구조가 한 명의 자기파괴를 1회라도 멈추게 하는가?"</strong></p>
              </Card>
            </Section>

            {/* Principles */}
            <Section num="05" title="운영 원칙 11조" sub="서사는 크게, 운영은 촘촘하게">
              {SECTIONS_DATA.principles.map(p => (
                <div key={p.n} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "16px 20px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                  <span style={{ fontSize: 20, color: C.accent, fontWeight: 700, width: 28, flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>{p.n}</span>
                  <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                    <strong>{p.t}</strong><br /><span style={{ color: C.mid }}>{p.s}</span>
                  </div>
                </div>
              ))}
            </Section>

            {/* Sentences */}
            <Section num="06" title="흔들릴 때 읽을 문장" sub="이것들은 머리가 아니라 가슴에서 나온 것들이다">
              {SECTIONS_DATA.sentences.map((t, i) => (
                <div key={i} style={s.sentence}>{t}</div>
              ))}
            </Section>

            {/* Final */}
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontSize: 17, lineHeight: 2.1 }}>
                나는 빨리 부자가 되어야 하는 사람이 아니다.<br />
                자기파괴의 루프를 끝내고<br />
                그것을 구조와 제품으로 번역해야 하는 사람이다.<br /><br />
                나의 꿈은 도파민에 파괴당하는 사람들을 구하는 것이다.<br />
                그리고 집에 돌아와서 딸이 그린 그림을 보면서 충만해하는 것이다.<br />
                나는 이 시스템의 첫 번째 유저이자, 첫 번째 증거다.<br /><br />
                <strong>난 다 이룬다.<br />그것이 나를 위한 게 아니라 우리를 위해.</strong>
              </p>
              <div style={{ marginTop: 32, fontSize: 13, color: C.dim }}>
                2026년 3월 29일 봄 · 카페에서 · 딸과 아내 곁에서<br />이곳에서 나왔다<br /><br />
                <strong style={{ color: C.accent }}>작은 것들의 신 · Life OS v4</strong>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: DEBT */}
        {/* ═══════════════════════════════════════ */}
        {tab === "debt" && (
          <>
            <Section num="" title="자산·부채 현황" sub="숫자로 펼치면 공포가 관리가 된다">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "아파트 시가", value: "6.5억", color: C.green, bg: C.greenSoft },
                  { label: "총 부채", value: fKRWShort(totalCredit + mortgage.amount), color: C.danger, bg: C.dangerSoft },
                  { label: "순자산", value: fKRWShort(65000 - totalCredit - mortgage.amount), color: C.blue, bg: C.blueSoft },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "20px 16px", borderRadius: 12, background: item.bg, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: item.color, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <Card label="핵심 인식" labelColor={C.green} title="5억이 아니라 1.7억이다">
                <p style={s.p}>
                  주담대 3.37억은 아파트(6.5억) 담보. LTV 52%. <strong>이건 빚이 아니라 자산 구조의 일부다.</strong><br />
                  진짜 갚아야 할 신용대출은 <strong>{fKRW(totalCredit)}</strong>이다. 이 숫자만 보면 전혀 다른 게임이다.
                </p>
              </Card>
            </Section>

            <Section num="" title="신용대출 상세 현황" sub="금리 · 만기 · 납입일 · 월 이자 전체 정리">
              <Card>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: C.surface2 }}>
                        {["은행", "잔액", "금리", "유형", "만기", "납입일", "월 납입"].map(h => (
                          <th key={h} style={{ textAlign: h === "은행" || h === "유형" ? "left" : "right", padding: "10px 8px", borderBottom: `2px solid ${C.border}`, fontSize: 11, letterSpacing: 1, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {creditLoans.sort((a, b) => b.rate - a.rate).map((l) => {
                        const isUrgent = l.maturity && l.maturity.startsWith("2026");
                        const isHighRate = l.rate >= 7;
                        return (
                          <tr key={l.id} style={{ background: isUrgent ? "rgba(185,68,68,0.04)" : "transparent" }}>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}` }}>
                              <strong style={{ color: C.text }}>{l.bank}</strong>
                              {isUrgent && <span style={{ fontSize: 10, color: C.danger, marginLeft: 4 }}>⚠️</span>}
                            </td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, textAlign: "right", fontWeight: 700, color: C.text }}>{fKRW(l.amount)}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, textAlign: "right", fontWeight: 700, color: isHighRate ? C.danger : C.mid }}>{l.rate}%</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, fontSize: 11, color: C.dim }}>{l.loanType}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, textAlign: "right", fontSize: 12, color: isUrgent ? C.danger : C.dim, fontWeight: isUrgent ? 700 : 400 }}>{l.maturity}</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, textAlign: "right", color: C.dim }}>{l.payDay}일</td>
                            <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.surface2}`, textAlign: "right", fontWeight: 700, color: C.accent }}>{l.monthly}만</td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: C.surface2 }}>
                        <td style={{ padding: "12px 8px", fontWeight: 700 }}>신용대출 합계</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, fontSize: 15, color: C.danger }}>{fKRW(totalCredit)}</td>
                        <td colSpan={3} style={{ padding: "12px 8px", textAlign: "right", fontSize: 12, color: C.dim }}>가중평균 금리 약 {(creditLoans.reduce((s, l) => s + l.rate * l.amount, 0) / totalCredit).toFixed(1)}%</td>
                        <td></td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, color: C.accent }}>{creditLoans.reduce((s, l) => s + l.monthly, 0).toFixed(1)}만</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card label="주담대" labelColor={C.dim}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { l: "잔액", v: "3억 3,700만" },
                    { l: "금리", v: "3.0%" },
                    { l: "유형", v: "원리금균등" },
                    { l: "월 상환", v: "129만원" },
                    { l: "납입일", v: "매월 29일" },
                  ].map((d, i) => (
                    <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 11, color: C.dim }}>{d.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{d.v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section num="" title="월간 현금 흐름" sub="매달 얼마가 나가고, 얼마가 남는지">
              {(() => {
                const creditInterest = creditLoans.reduce((s, l) => s + l.monthly, 0);
                const mortgageMonthly = 129;
                const totalMonthly = creditInterest + mortgageMonthly;
                const income = 800;
                const living = 300;
                const remaining = income - living - totalMonthly;
                return (
                  <Card>
                    <div style={{ marginBottom: 16 }}>
                      {[
                        { label: "월 소득", value: `${income}만원`, color: C.green, align: "left" },
                        { label: "생활비 (추정)", value: `-${living}만원`, color: C.dim, align: "left" },
                        { label: "신용대출 이자/상환", value: `-${creditInterest.toFixed(1)}만원`, color: C.danger, align: "left" },
                        { label: "주담대 상환", value: `-${mortgageMonthly}만원`, color: C.dim, align: "left" },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.surface2}` }}>
                          <span style={{ fontSize: 14, color: C.mid }}>{row.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: `2px solid ${C.border}`, marginTop: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>매월 추가 상환 가능액</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: remaining > 0 ? C.green : C.danger }}>약 {remaining.toFixed(0)}만원</span>
                      </div>
                    </div>
                    <p style={{ ...s.p, fontSize: 13, color: C.dim }}>
                      * 생활비 300만원은 추정치. 실제 금액을 넣으면 더 정확해진다.<br />
                      * 마통의 월 납입은 이자만 계산. 원금 상환 시 이 금액이 줄어든다.<br />
                      * 초과근무 포함 시 소득 850만원이면 추가 상환 가능액이 더 늘어난다.
                    </p>
                  </Card>
                );
              })()}
            </Section>

            <Section num="" title="⚠️ 만기 임박 대출" sub="2026년 내 만기 도래 — 연장 또는 상환 계획 필요">
              <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
                {creditLoans.filter(l => l.maturity && l.maturity.startsWith("2026")).sort((a, b) => a.maturity.localeCompare(b.maturity)).map(l => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid rgba(185,68,68,0.15)` }}>
                    <div>
                      <strong style={{ color: C.text, fontSize: 14 }}>{l.bank}</strong>
                      <span style={{ fontSize: 12, color: C.danger, marginLeft: 8 }}>{l.maturity} 만기</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{fKRW(l.amount)}</span>
                    </div>
                  </div>
                ))}
                <p style={{ ...s.p, fontSize: 13, color: C.mid, marginTop: 12 }}>
                  마통은 통상 연장되지만 보장은 아니다. <strong>J은행1 (1억, 6월)과 N은행 (4천만, 8월)이 가장 큰 건이다.</strong> 연장 가능 여부를 미리 확인하고, 최악의 경우를 대비해 다른 은행으로의 대환 옵션도 알아둘 것.
                </p>
              </div>
            </Section>

            <Section num="" title="스노우볼 상환 전략" sub="작은 것부터 죽여나간다. 건수가 줄면 심리가 바뀐다.">
              {[
                { phase: "1단계", time: "즉시 ~ 3개월", color: C.green, bg: C.greenSoft,
                  targets: "J은행2 (196만) → JB은행2 (236만) → J은행3 (300만) → K은행1 (300만) → K은행2 (300만)",
                  total: "합계 1,332만원 · 5건 소멸", desc: "가용자금 + 월 여유분으로 작은 것부터 즉시 정리. 5건이 사라지는 심리적 효과가 크다." },
                { phase: "2단계", time: "3 ~ 9개월", color: C.blue, bg: C.blueSoft,
                  targets: "JB은행1 (544만) → S은행 (1,150만)",
                  total: "합계 1,694만원 · 2건 소멸", desc: "1단계에서 사라진 이자 절감분을 여기에 투입. S은행은 금리 3.96%로 가장 낮으므로 JB은행1(7.67%)을 먼저." },
                { phase: "3단계", time: "9개월 ~ 3년", color: C.accent, bg: C.accentSoft,
                  targets: "N은행 (4,000만) → J은행1 (1억)",
                  total: "합계 1억 4,000만원 · 신용대출 완전 소멸", desc: "가장 큰 두 건. 소득 증가분 + 앞 단계에서 절감된 이자를 전액 투입. 이 두 건이 사라지면 신용대출 제로." },
                { phase: "4단계", time: "이후", color: C.dim, bg: C.surface2,
                  targets: "주담대 3.37억 (H은행)",
                  total: "금리 3.0% · 급하지 않다", desc: "신용대출 전부 정리 후 여유분으로 상환 가속 고려. 아파트 가치 상승도 반영. 이때부터 딸 펀드 투자 시작." },
              ].map((p, i) => (
                <div key={i} style={{ background: p.bg, border: `1px solid ${p.color}22`, borderRadius: 12, padding: "20px 24px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.phase}</span>
                    <span style={{ fontSize: 12, color: p.color, fontWeight: 500 }}>{p.time}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.targets}</div>
                  <div style={{ fontSize: 12, color: p.color, fontWeight: 700, marginBottom: 8 }}>{p.total}</div>
                  <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              ))}
            </Section>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: INVEST */}
        {/* ═══════════════════════════════════════ */}
        {tab === "invest" && (
          <>
            <Section num="" title="Plan B — 딸을 위한 투자" sub="자동이체 · 차트 안 봄 · 판단 불필요 · 2028년 시작">

              <Card label="왜 인덱스인가" labelColor={C.green} title="다른 선택지를 배제하는 이유">
                {REJECT_REASONS.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < REJECT_REASONS.length - 1 ? `1px solid ${C.surface2}` : "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.danger, minWidth: 140 }}>❌ {r.name}</span>
                    <span style={{ fontSize: 13, color: C.mid }}>{r.reason}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, padding: "10px 0", background: C.greenSoft, borderRadius: 8, marginTop: 8, paddingLeft: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green, minWidth: 140 }}>✅ 나스닥+S&P 인덱스</span>
                  <span style={{ fontSize: 13, color: C.mid }}>검증된 수익률 + 분산 + 판단 불필요. 나라는 사람에게 맞는 구조.</span>
                </div>
              </Card>

              <Card label="시뮬레이터" labelColor={C.accent} title="슬라이더를 움직여봐">
                <Slider label="월 투자금" value={monthly} min={30} max={200} step={10} onChange={setMonthly} suffix="만원" />
                <Slider label="투자 기간" value={years} min={10} max={30} step={1} onChange={setYears} suffix="년" />
                <Slider label="매년 투자금 증가율" value={esc} min={0} max={10} step={1} onChange={setEsc} suffix="%"
                  note={esc > 0 ? `소득 증가에 따라 매년 ${esc}%씩 증가 → ${years}년차 월 ${Math.round(monthly * Math.pow(1 + esc / 100, years - 1))}만원` : "고정 투자금"} />
              </Card>

              <div style={{ textAlign: "center", padding: 14, background: C.greenSoft, borderRadius: 10, border: `1px solid rgba(61,122,80,0.2)`, marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>🎯 목표: 10억원 — 딸에게 주는 아빠의 선물</span>
              </div>

              {investResults.map(r => {
                const reached = r.final >= 100000;
                const pct = Math.min(100, (r.final / 100000) * 100);
                return (
                  <div key={r.id} style={{ ...s.card, border: reached ? `2px solid ${C.green}` : `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                    {reached && <div style={{ position: "absolute", top: 0, right: 0, background: C.green, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: "0 0 0 8px" }}>✓ 10억 달성</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>{r.emoji}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{r.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: `${r.color}11`, padding: "2px 8px", borderRadius: 4 }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>{r.alloc}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.muted }}>투자 원금</div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: C.mid }}>{fKRW(r.invested)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: C.muted }}>{years}년 후</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: reached ? C.green : r.color }}>{fKRW(r.final)}</div>
                      </div>
                    </div>
                    <div style={{ background: C.surface2, borderRadius: 4, height: 6, marginBottom: 8 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: reached ? C.green : r.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.dim }}>
                      {reached ? `✓ 10억 달성 · 수익률 ${Math.round((r.final / r.invested - 1) * 100)}%` : `목표 대비 ${Math.round(pct)}% · ${fKRWShort(100000 - r.final)} 부족`}
                    </div>
                  </div>
                );
              })}

              <div style={{ ...s.card, border: `2px solid ${C.accent}`, marginTop: 8 }}>
                <div style={{ ...s.label, color: C.accent }}>추천 플랜</div>
                <h3 style={s.h3}>QQQ 70% + VOO 30% · 자동이체 · 연 1회 리밸런싱</h3>
                <p style={s.p}>
                  매월 자동이체로만 매수. 차트 안 본다. 리밸런싱 1년 1번. 소득이 올라가면 투자금을 늘린다. Wave OS 사업 수익 발생 시 일부를 이 펀드에 추가 적립.<br /><br />
                  <strong>이 돈은 딸의 돈이다. 절대 빼지 않는다. 이것은 투자가 아니라 시간을 사는 것이다.</strong>
                </p>
              </div>

              <div style={{ background: C.dangerSoft, border: `1px solid rgba(185,68,68,0.2)`, borderRadius: 12, padding: 24, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 8 }}>⚠️ 시작 조건 — 전부 충족 전에는 시작하지 않는다</div>
                <p style={{ ...s.p, fontSize: 13, color: C.mid }}>
                  1. 선물 계좌 해지 완료<br />
                  2. 대출 상환 구조 확정 및 실행 중<br />
                  3. 비상금 최소 1,000만원 확보<br />
                  4. 월 상환금과 별도로 50만원 여유 확인<br />
                  <strong>예상 시작: 2028년 · 41세</strong>
                </p>
              </div>
            </Section>

            <p style={{ fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.7 }}>
              과거 수익률은 미래를 보장하지 않습니다. 복리 계산 기반 추정치이며 실제 수익률은 시장 상황에 따라 달라집니다. 투자 결정 전 전문가와 상담하세요.
            </p>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: DEEP DIVE */}
        {/* ═══════════════════════════════════════ */}
        {tab === "deepdive" && (
          <>
            {/* 핵심 선언 */}
            <div style={{ padding: "36px 28px", background: C.accentSoft, border: `1px solid ${C.accent}`, borderRadius: 16, marginBottom: 40, textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: 5, color: C.accent, textTransform: "uppercase", marginBottom: 16 }}>1년 딥다이브 선언</div>
              <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 2, color: C.text, margin: 0 }}>
                나는 1년 동안, 토스의 급여를 기반으로<br />
                '도파민 컨트롤 AI 에이전트'를 집요하게 검증한다.<br />
                <span style={{ color: C.accent }}>토스 월급은 면죄부가 아니라 실험 자본이다.</span>
              </p>
            </div>

            {/* 마인드셋 */}
            <Section num="01" title="크게 믿되, 작게 증명한다" sub="선물판 사고방식과 실험 사고방식의 차이">
              <div style={{ ...s.card, borderColor: C.danger, background: C.dangerSoft }}>
                <div style={{ ...s.label, color: C.danger }}>🔴 도파민 체크</div>
                <p style={s.p}>'이번에 대박 나면 인생이 바뀐다'고 느끼는 순간 — 그건 도파민이다. 선물판과 같은 구조다. 멈추고 기준 3을 확인하라.</p>
              </div>
              <div style={{ ...s.card, borderColor: C.green, background: C.greenSoft }}>
                <div style={{ ...s.label, color: C.green }}>🟢 실험 체크</div>
                <p style={s.p}>'오늘 한 명이 써봤는데 반응이 이랬다'에 집중하고 있다면 — 그건 실험이다. 이건 건강하다. 계속 가라.</p>
              </div>
              <div style={{ ...s.card, borderColor: C.accent, background: C.accentSoft }}>
                <div style={{ ...s.label, color: C.accent }}>🟡 믿음의 번역</div>
                <p style={s.p}>점이 선이 된다는 믿음은 맞다. 선물판에서는 '그러니까 다음 판도 해야 해'로 번역됐다. 사업에서는 '그러니까 이 경험을 제품에 녹이자'로 번역한다. 같은 믿음, 다른 방향.</p>
              </div>
              <div style={{ padding: "20px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, textAlign: "center" }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0, lineHeight: 2 }}>
                  꿈은 북극성이다.<br />매일의 기준은 '오늘 하나를 검증했는가'이다.
                </p>
              </div>
            </Section>

            {/* Wave OS 비전 */}
            <Section num="02" title="Wave OS — 도파민 컨트롤 AI 에이전트" sub="왜 이게 사업이 되는가">
              <Card label="코어 미션" labelColor={C.purple} title="도파민이 나를 파괴하고 있는데, 그걸 보여주고 멈춰주는 AI">
                <p style={s.p}>매매 중독만이 아니다. 쇼핑 중독, 식탐, 폰 중독, 충동 소비 — 모든 자기파괴적 충동을 셀프컨트롤하게 돕는 AI 에이전트. 단순히 '하지 마'라고 막는 게 아니라, 파괴적 도파민을 건설적 도파민으로 리다이렉션하는 구조. 충동 소비를 멈춘 만큼 레벨이 올라가고, 아낀 돈이 쌓여서 자산이 되는 과정을 가시화한다.</p>
              </Card>
              <Card label="경쟁우위" labelColor={C.green} title="토스가 절대 못 하는 영역">
                <p style={s.p}>토스는 '돈을 편하게 쓰게' 해주는 앱이다. Wave OS는 '돈을 안 쓰게' 막아주는 앱이다. 이해관계가 정반대라 토스도, 카드사도, 쇼핑몰도 절대 못 한다. 그들의 수익모델이 네가 쓰는 것에 의존하니까.</p>
              </Card>
              <Card label="타깃" labelColor={C.blue} title="부자가 되고 싶은 수백 수천만의 인구">
                <p style={s.p}>누구나 부자가 되고 싶은 마음은 큰데, 도파민이 그걸 방해하고 있다. Wave OS는 그 사이의 다리다. '당신은 이번 주 충동 소비를 12만원 줄였고, 그 돈이 1년 뒤 156만원이 된다.' 파괴를 멈추는 것에서 그치지 않고, 멈춘 자리에 성장을 채워넣는다.</p>
              </Card>
              <Card label="BM" labelColor={C.accent} title="월 2만원 구독 — 커피 한 잔 값">
                <p style={s.p}>이 앱이 충동 소비를 월 20만원 줄여주면 2만원은 10배 ROI. 프로 모델 89,000원은 경제 뉴스, 시장 분석, 자산 배분 가이드 포함. 하지만 프로는 나중이다. 지금은 코어만.</p>
              </Card>
            </Section>

            {/* Phase 로드맵 */}
            <Section num="03" title="Phase 로드맵" sub="점진적 검증 — 단계를 건너뛰지 않는다">
              {[
                {
                  num: "0", color: C.danger, bg: C.dangerSoft,
                  title: "나 자신이 첫 번째 유저",
                  timeline: "지금 ~ 2개월 · 39세",
                  desc: "카드앱에서 최근 3개월 이용내역 CSV 다운로드. Claude에 넣어서 충동 소비 패턴 분석. 내 도파민 트리거 맵핑. 내가 갓생을 사는 과정 자체가 제품 개발이다.",
                  sub: "첫 번째 할 일: 카드앱 열어서 CSV 다운로드. 이것 하나.",
                },
                {
                  num: "1", color: C.accent, bg: C.accentSoft,
                  title: "첫 세그먼트 검증 — 매매 중독자",
                  timeline: "3 ~ 6개월 · 40세",
                  desc: "내가 가장 깊이 아는 영역. 서사가 곧 마케팅: '6년간 5억 날린 사람이 만든 도파민 브레이크.' 선물로 크게 잃어본 사람 20명 인터뷰. 프로토타입 테스트. 행동 데이터 수집.",
                  sub: "검증: 체크포인트를 실제로 거치는지 / 매매를 실제로 멈추는지 / 다시 오는지",
                },
                {
                  num: "2", color: C.blue, bg: C.blueSoft,
                  title: "세그먼트 확장 — 충동 소비",
                  timeline: "6 ~ 12개월 · 40세",
                  desc: "같은 도파민 컨트롤 엔진으로 쇼핑 중독, 폰 중독, 식탐으로 확장. 코어 로직(트리거 → 개입 → 리다이렉션)은 동일, 트리거 감지만 다르다. 카드 내역 CSV 기반 → 이후 공공마이데이터 API 연동.",
                  sub: "카드 내역 기반 충동 소비 감지 → 텔레그램 알림 → 행동 변화 데이터 확인",
                },
                {
                  num: "3", color: C.green, bg: C.greenSoft,
                  title: "구독 BM + 갓생 플랫폼",
                  timeline: "12개월 ~ · 41세",
                  desc: "월 2만원 구독 시작. 1000명이면 월 990만원. 무료: 도파민 레벨 진단 + 기본 체크포인트. 유료: AI 에이전트 실시간 개입 + 레벨 시스템 + 건설적 도파민 리다이렉션.",
                  sub: "사업화 여부 판단: 자발적 재방문 / 한 문장 가치 설명 / 행동 변화 데이터 / 결제 의향",
                },
              ].map((phase, i) => (
                <div key={i} style={{ background: phase.bg, border: `1px solid ${phase.color}40`, borderRadius: 14, padding: "24px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: phase.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{phase.num}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{phase.title}</div>
                      <div style={{ fontSize: 12, color: phase.color, fontWeight: 600 }}>{phase.timeline}</div>
                    </div>
                  </div>
                  <p style={{ ...s.p, marginBottom: 12 }}>{phase.desc}</p>
                  <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.5)", borderRadius: 8, fontSize: 13, color: C.mid, fontWeight: 600 }}>→ {phase.sub}</div>
                </div>
              ))}
            </Section>

            {/* 분기별 운영 프레임 */}
            <Section num="04" title="2026.4 ~ 2027.3 분기별 목표" sub="연간 실험 로드맵">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { q: "Q1 (4-6월)", color: C.accent, bg: C.accentSoft, content: "문제 정의 잠금 · 타깃 인터뷰 20-30명 · 핵심 로그 정리 · '왜 열어야 하는지' 서사 다듬기 · 내 카드 데이터로 Phase 0 프로토타입" },
                  { q: "Q2 (7-9월)", color: C.blue, bg: C.blueSoft, content: "리텐션 구조 개선 · 트리거/게이트 설계 강화 · 콘텐츠 유입 실험 · '한 문장 가치제안' 고정" },
                  { q: "Q3 (10-12월)", color: C.purple, bg: C.purpleSoft, content: "유저 세그먼트 분화 · 핵심 기능 덜어내기 · 반복 행동 유도 · 초기 유료화 가능성 탐색" },
                  { q: "Q4 (1-3월)", color: C.green, bg: C.greenSoft, content: "이것이 진짜 사업인지 판단 · 사업화 / 오픈소스 / 브랜드자산화 / 다른 도메인 확장 중 선택" },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, border: `1px solid ${item.color}30`, borderRadius: 12, padding: "20px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 10 }}>{item.q}</div>
                    <p style={{ ...s.p, fontSize: 13 }}>{item.content}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 금지선 4조 */}
            <Section num="05" title="1년 딥다이브 금지선" sub="이 선을 넘으면 선물판과 같은 구조다">
              <div style={{ background: C.dangerSoft, border: `2px solid ${C.danger}`, borderRadius: 14, padding: "24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 16 }}>🚫 4개 금지선</div>
                <ol style={{ paddingLeft: 20, fontSize: 14, color: C.mid, margin: "0 0 16px", lineHeight: 2.2 }}>
                  <li><strong>유저 없는 개발 금지</strong> — 만들기 전에 사람을 만나라</li>
                  <li><strong>로그 없는 확신 금지</strong> — 느낌이 아니라 데이터로 판단하라</li>
                  <li><strong>매주 산출물 없는 탐구 금지</strong> — 코드든 문서든 인터뷰 노트든 매주 하나는 남겨라</li>
                  <li><strong>제품과 자기존재를 동일시 금지</strong> — WAVE가 안 되면 네가 끝나는 게 아니다</li>
                </ol>
                <div style={{ padding: "14px 16px", background: "rgba(185,68,68,0.12)", borderRadius: 8, fontSize: 14, fontWeight: 700, color: C.danger, textAlign: "center" }}>
                  WAVE는 첫 번째 증명 무기다. 무기가 부러지면 다음 무기를 만든다.
                </div>
              </div>
            </Section>

            {/* 매주 금요일 자기점검 */}
            <Section num="06" title="매주 금요일 — 3개만 묻는다" sub="더 복잡하게 만들지 않는다">
              <div style={s.card}>
                {[
                  "이번 주 사용자와 대화했는가? (인터뷰, DM, 피드백 뭐든)",
                  "이번 주 하나를 검증했는가? (가설 → 실험 → 결과)",
                  "이번 주 선물판 사고방식이 나를 지배한 순간이 있었는가?",
                ].map((q, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i < 2 ? `1px solid ${C.surface2}` : "none" }}>
                    <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderRadius: 4, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: C.mid, lineHeight: 1.7 }}>{q}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* 1년 후 판단 기준 */}
            <div style={{ background: C.greenSoft, border: `2px solid ${C.green}`, borderRadius: 14, padding: "28px", marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: C.green, fontWeight: 700, marginBottom: 12 }}>2027년 3월 — 사업화 판단 기준</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>이 4개 중 3개 이상 YES면 사업화</div>
              {[
                "사용자가 자발적으로 다시 오는가?",
                "한 문장으로 가치가 설명되는가?",
                "실제 행동 변화가 데이터로 보이는가?",
                "돈을 내겠다는 사람이 있는가?",
              ].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? `1px solid rgba(61,122,80,0.15)` : "none" }}>
                  <div style={{ width: 22, height: 22, border: `2px solid ${C.green}`, borderRadius: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: C.mid, fontWeight: 500 }}>{q}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: ACTION */}
        {/* ═══════════════════════════════════════ */}
        {tab === "action" && (
          <>
            <Section num="" title="즉시 실행" sub="날짜가 붙었을 때 원칙이 행동이 된다">
              {[
                {
                  text: "선물 계좌 해지 완료",
                  sub: "모든 선물/코인선물/레버리지 ETF 계좌",
                  color: C.danger,
                },
                {
                  text: "J은행2 (196만원) 즉시 상환",
                  sub: "스노우볼 1단계 시작. 가장 작은 것부터.",
                  color: C.accent,
                },
                {
                  text: "비상금 1,000만원 별도 계좌에 이체",
                  sub: "딸의 펀드 시작 조건 #3",
                  color: C.accent,
                },
                {
                  text: "카드앱에서 최근 3개월 이용내역 CSV 다운로드",
                  sub: "Wave OS Phase 0의 첫 걸음",
                  color: C.blue,
                },
                {
                  text: "선물로 크게 잃어본 사람 5명에게 DM 보내기",
                  sub: '"저도 6년간 다 잃었는데, 그때 어떤 순간에 버튼을 눌렀는지 얘기 나눌 수 있을까요?"',
                  color: C.blue,
                },
                {
                  text: "Wave OS 노션 폴더에 '매주 검증 로그' 페이지 만들기",
                  sub: "매주 금요일 3개 질문 기록 공간",
                  color: C.purple,
                },
                {
                  text: "내 도파민 트리거 리스트 작성",
                  sub: "선물 차트, 충동 구매, 배달앱, SNS 스크롤, 흡연 등",
                  color: C.purple,
                },
                {
                  text: "J은행1 만기 연장 확인 (6월 만기)",
                  sub: "연장 불가 시 대환 옵션 탐색",
                  color: C.danger,
                },
                {
                  text: "N은행 만기 연장 확인 (8월 만기)",
                  sub: "4,000만원 — 연장 여부 사전 확인",
                  color: C.danger,
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 0", borderBottom: `1px solid ${C.surface2}` }}>
                  <div style={{ width: 24, height: 24, border: `2px solid ${item.color}`, borderRadius: 5, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.text}</div>
                    <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>____년 __월 __일</div>
                </div>
              ))}
            </Section>

            <div style={{ ...s.card, background: C.accentSoft, border: `1px solid ${C.accent}`, textAlign: "center", marginTop: 8 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 8px", lineHeight: 2 }}>
                작은 것들의 신.<br />
                작게 작게 하나씩 위닝해나간다.
              </p>
              <p style={{ fontSize: 13, color: C.dim, margin: 0 }}>오늘 이 중 하나만 완료해도 된다.</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

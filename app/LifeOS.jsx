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
  ];

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>Life Operating System v3</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", background: `linear-gradient(135deg, ${C.text}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>내 인생의 운영체제</h1>
          <div style={{ fontSize: 13, color: C.dim }}>1988년생 · 39세 · 2026년 봄, 이곳에서 나왔다</div>
        </div>

        {/* ── Core Quote ── */}
        <div style={{ padding: "28px", background: C.accentSoft, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 10px 10px 0", marginBottom: 32, fontSize: 17, lineHeight: 2, color: C.text }}>
          난 감정을 오롯이 느끼고 그것에 오롯이 공감하고<br />
          만물을 사랑하고 취하기도 매혹적이기도<br />
          바람에 공기에 감사함을 느끼기도 하는<br />
          충만한 인생을 살고싶다<br />
          <strong>그것이 나의 전부다.</strong>
        </div>

        {/* ── Tab Nav ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 20px", fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? C.accent : C.dim, background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
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
              <p style={{ fontSize: 14, color: C.dim, maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>나인원한남은 이 무형의 가치를 유형화한 상징이다. 매일 쳐다보면 현재가 초라해지고, "빠르게"를 찾게 되고, 그게 선물판이었다.</p>
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
                ⛔ 선물 · 코인 선물 · 레버리지 ETF · 마진 거래 — 금액 불문 전면 금지
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
            </Section>

            {/* Business Path */}
            <Section num="04" title="유일한 경로 — 사업" sub="월급으로는 북극성에 닿지 못한다.">
              <Card label="WAVE OS" labelColor={C.purple} title="자기파괴 루프를 멈추게 하는 시스템">
                <p style={s.p}>매매 도구가 아니다. 인간이 도파민에 의해 자기 파괴적 결정을 반복하는 구조를 인식하고 빠져나오게 돕는 시스템이다. 6년의 지옥이 원재료다. R&D를 인생으로 지불한 것이다.<br /><br /><strong>증명할 건 딱 하나: "이 구조가 한 명의 자기파괴를 1회라도 멈추게 하는가?"</strong></p>
              </Card>
            </Section>

            {/* Principles */}
            <Section num="05" title="운영 원칙 10조" sub="서사는 크게, 운영은 촘촘하게">
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
                <strong>난 다 이룬다.<br />그것이 나를 위한 게 아니라 우리를 위해.</strong>
              </p>
              <div style={{ marginTop: 32, fontSize: 13, color: C.dim }}>
                2026년 3월 29일 봄 · 카페에서 · 딸과 아내 곁에서<br />이곳에서 나왔다
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: DEBT */}
        {/* ═══════════════════════════════════════ */}
        {tab === "debt" && (
          <>
            {/* Asset Summary */}
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

            {/* Detailed Loan Table */}
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
                      {creditLoans.sort((a, b) => b.rate - a.rate).map((l, i) => {
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

              {/* Mortgage */}
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

            {/* Monthly Cash Flow */}
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

            {/* Urgency Alert */}
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

            {/* Snowball Strategy */}
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

              {/* Why Index */}
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

              {/* Simulator Controls */}
              <Card label="시뮬레이터" labelColor={C.accent} title="슬라이더를 움직여봐">
                <Slider label="월 투자금" value={monthly} min={30} max={200} step={10} onChange={setMonthly} suffix="만원" />
                <Slider label="투자 기간" value={years} min={10} max={30} step={1} onChange={setYears} suffix="년" />
                <Slider label="매년 투자금 증가율" value={esc} min={0} max={10} step={1} onChange={setEsc} suffix="%"
                  note={esc > 0 ? `소득 증가에 따라 매년 ${esc}%씩 증가 → ${years}년차 월 ${Math.round(monthly * Math.pow(1 + esc / 100, years - 1))}만원` : "고정 투자금"} />
              </Card>

              {/* Target */}
              <div style={{ textAlign: "center", padding: 14, background: C.greenSoft, borderRadius: 10, border: `1px solid rgba(61,122,80,0.2)`, marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>🎯 목표: 10억원 — 딸에게 주는 아빠의 선물</span>
              </div>

              {/* Results */}
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

              {/* Recommendation */}
              <div style={{ ...s.card, border: `2px solid ${C.accent}`, marginTop: 8 }}>
                <div style={{ ...s.label, color: C.accent }}>추천 플랜</div>
                <h3 style={s.h3}>QQQ 70% + VOO 30% · 자동이체 · 연 1회 리밸런싱</h3>
                <p style={s.p}>
                  매월 자동이체로만 매수. 차트 안 본다. 리밸런싱 1년 1번. 소득이 올라가면 투자금을 늘린다. Wave OS 사업 수익 발생 시 일부를 이 펀드에 추가 적립.<br /><br />
                  <strong>이 돈은 딸의 돈이다. 절대 빼지 않는다. 이것은 투자가 아니라 시간을 사는 것이다.</strong>
                </p>
              </div>

              {/* Conditions */}
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

      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import type { ModelKey } from "@/components/three/models/keys";

/*
 * The still drawing for each page model: what the panel shows before WebGL
 * loads (and for good, without WebGL). Flat shapes in the theme's tokens, so
 * they follow the theme toggle with no script.
 */

/** The folders model's colours (Folders.tsx): ink folders behind a teal one. */
const FOLDER_COLORS = ["var(--ink)", "var(--ink)", "var(--ink)", "var(--accent)"];

const S = { fill: "var(--card)", stroke: "var(--line-2)", strokeWidth: 1.5 } as const;

function Ring({
  cx = 200,
  cy = 150,
  rx = 165,
  ry = 44,
}: {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="none"
      stroke="var(--accent)"
      strokeOpacity={0.5}
      strokeWidth={1.5}
    />
  );
}

const STILLS: Record<ModelKey, ReactNode> = {
  "brand-cube": (
    <>
      <Ring cy={160} rx={170} ry={46} />
      <path d="M200 72 L264 106 L200 140 L136 106 Z" {...S} />
      <path
        d="M136 106 L200 140 L200 214 L136 180 Z"
        fill="var(--bg-soft)"
        stroke={S.stroke}
        strokeWidth={1.5}
      />
      <path
        d="M264 106 L200 140 L200 214 L264 180 Z"
        fill="var(--card-2)"
        stroke={S.stroke}
        strokeWidth={1.5}
      />
      <path d="M216 150 L248 133 L248 167 L216 184 Z" fill="var(--accent)" />
      <path d="M152 133 L184 150 L184 184 L152 167 Z" fill="var(--accent)" opacity={0.85} />
      <circle cx={368} cy={166} r={6} fill="var(--amber)" />
      <circle cx={96} cy={196} r={6} fill="var(--amber)" />
    </>
  ),
  "glass-browser": (
    <>
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={70 + index * 22}
          y={56 + index * 16}
          width={220}
          height={150}
          rx={12}
          fill={index === 3 ? "var(--card)" : "var(--accent)"}
          fillOpacity={index === 3 ? 0.92 : 0.08 + index * 0.06}
          stroke="var(--line-2)"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={152} cy={122} r={4} fill="#f26b5b" />
      <circle cx={165} cy={122} r={4} fill="#f5b54a" />
      <circle cx={178} cy={122} r={4} fill="#3ec27a" />
      <rect x={150} y={146} width={90} height={12} rx={4} fill="var(--ink)" />
      <rect x={150} y={166} width={64} height={7} rx={3} fill="var(--line)" />
      <rect x={150} y={186} width={56} height={16} rx={8} fill="var(--accent)" />
      <rect x={262} y={146} width={70} height={56} rx={8} fill="var(--accent-soft)" />
    </>
  ),
  "phone-screens": (
    <>
      <rect x={150} y={40} width={100} height={210} rx={20} fill="var(--ink)" />
      <rect x={158} y={50} width={84} height={190} rx={14} fill="var(--card)" />
      <rect x={170} y={84} width={44} height={8} rx={3} fill="var(--ink)" />
      <rect x={170} y={108} width={60} height={20} rx={6} {...S} />
      <rect x={170} y={136} width={60} height={20} rx={6} {...S} />
      <rect x={170} y={170} width={60} height={22} rx={11} fill="var(--accent)" />
      <rect
        x={232}
        y={66}
        width={110}
        height={36}
        rx={10}
        fill="var(--card)"
        stroke="var(--line-2)"
        strokeWidth={1.5}
      />
      <rect x={242} y={76} width={16} height={16} rx={4} fill="var(--accent)" />
      <rect x={266} y={78} width={60} height={6} rx={3} fill="var(--ink)" />
      <rect x={266} y={89} width={40} height={5} rx={2} fill="var(--line)" />
    </>
  ),
  "node-graph": (
    <>
      <Ring rx={150} ry={52} />
      {[
        [62, 150, "var(--wa)"],
        [130, 196, "var(--c-ai)"],
        [270, 196, "var(--c-web)"],
        [338, 150, "var(--c-mob)"],
        [200, 102, "var(--c-data)"],
      ].map(([x, y, color]) => (
        <g key={`${x}-${y}`}>
          <line x1={200} y1={150} x2={x} y2={y} stroke="var(--line-2)" strokeWidth={1.5} />
          <rect
            x={Number(x) - 16}
            y={Number(y) - 16}
            width={32}
            height={32}
            rx={8}
            fill={String(color)}
          />
        </g>
      ))}
      <circle cx={200} cy={150} r={30} fill="var(--accent)" />
      <circle cx={146} cy={174} r={5} fill="var(--amber)" />
      <circle cx={262} cy={151} r={5} fill="var(--amber)" />
    </>
  ),
  "phone-bubbles": (
    <>
      <rect x={130} y={40} width={100} height={210} rx={20} fill="var(--ink)" />
      <rect x={138} y={50} width={84} height={190} rx={14} fill="var(--wa)" fillOpacity={0.18} />
      <rect x={138} y={50} width={84} height={24} rx={10} fill="var(--wa)" />
      {[
        [170, 92, 120, false],
        [214, 130, 110, true],
        [184, 168, 96, false],
        [228, 206, 120, true],
      ].map(([x, y, w, mine]) => (
        <rect
          key={`${x}-${y}`}
          x={Number(x)}
          y={Number(y)}
          width={Number(w)}
          height={26}
          rx={12}
          fill={mine ? "var(--wa)" : "var(--card)"}
          stroke="var(--line-2)"
          strokeWidth={1}
        />
      ))}
    </>
  ),
  "handset-rings": (
    <>
      {[60, 95, 130].map((r, index) => (
        <circle
          key={r}
          cx={200}
          cy={150}
          r={r}
          fill="none"
          stroke="var(--c-ai)"
          strokeOpacity={0.5 - index * 0.14}
          strokeWidth={2}
        />
      ))}
      <g transform="rotate(-38 200 150)">
        <rect x={190} y={92} width={20} height={116} rx={10} fill="var(--accent)" />
        <rect x={176} y={84} width={34} height={26} rx={10} fill="var(--accent)" />
        <rect x={176} y={190} width={34} height={26} rx={10} fill="var(--accent)" />
      </g>
    </>
  ),
  funnel: (
    <>
      {[
        [80, 320, 96, "var(--c-mkt)"],
        [116, 284, 140, "var(--c-web)"],
        [146, 254, 184, "var(--accent)"],
        [170, 230, 228, "var(--ok)"],
      ].map(([left, right, y, color]) => {
        const l = Number(left);
        const r = Number(right);
        const top = Number(y) - 30;
        return (
          <path
            key={String(color)}
            d={`M${l} ${top} L${r} ${top} L${r - 16} ${top + 30} L${l + 16} ${top + 30} Z`}
            fill={String(color)}
            fillOpacity={0.45}
            stroke={String(color)}
            strokeWidth={1.5}
          />
        );
      })}
      {[
        [190, 40],
        [214, 56],
        [200, 78],
        [204, 252],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="var(--amber)" />
      ))}
    </>
  ),
  "server-hub": (
    <>
      {[96, 132, 168].map((y) => (
        <g key={y}>
          <rect x={60} y={y} width={120} height={28} rx={6} {...S} />
          <circle cx={76} cy={y + 14} r={3.5} fill="var(--ok)" />
          <circle cx={88} cy={y + 14} r={3.5} fill="var(--accent)" />
        </g>
      ))}
      {[110, 146, 182].map((y) => (
        <path
          key={y}
          d={`M180 ${y} C 220 ${y} 230 150 262 150`}
          fill="none"
          stroke="var(--line-2)"
          strokeWidth={2}
        />
      ))}
      <rect x={262} y={124} width={52} height={52} rx={12} fill="var(--accent)" />
      {[
        [350, 92, "var(--c-web)"],
        [362, 158, "var(--c-mob)"],
        [340, 214, "var(--c-mkt)"],
      ].map(([cx, cy, color]) => (
        <g key={`${cx}-${cy}`}>
          <line x1={314} y1={150} x2={cx} y2={cy} stroke="var(--line-2)" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={12} fill={String(color)} />
        </g>
      ))}
    </>
  ),
  "services-turntable": (
    <>
      <ellipse cx={200} cy={200} rx={170} ry={46} {...S} />
      {[
        [90, 176, "var(--c-web)"],
        [150, 150, "var(--c-mob)"],
        [250, 150, "var(--c-data)"],
        [310, 176, "var(--c-mkt)"],
        [200, 204, "var(--accent)"],
      ].map(([x, y, color]) => (
        <rect
          key={`${x}-${y}`}
          x={Number(x) - 26}
          y={Number(y) - 52}
          width={52}
          height={52}
          rx={10}
          fill={String(color)}
          fillOpacity={0.85}
        />
      ))}
    </>
  ),
  "process-path": (
    <>
      {[
        [80, 210],
        [160, 180],
        [240, 150],
        [320, 120],
      ].map(([x, y], index) => (
        <g key={x}>
          <path
            d={`M${x - 40} ${y} L${x} ${y - 18} L${x + 40} ${y} L${x} ${y + 18} Z`}
            fill={index === 3 ? "var(--accent)" : "var(--card)"}
            stroke="var(--line-2)"
            strokeWidth={1.5}
          />
          <path
            d={`M${x - 40} ${y} L${x - 40} ${y + 14} L${x} ${y + 32} L${x + 40} ${y + 14} L${x + 40} ${y} L${x} ${y + 18} Z`}
            fill="var(--line)"
          />
        </g>
      ))}
      <circle cx={320} cy={92} r={9} fill="var(--amber)" />
    </>
  ),
  "about-cube": (
    <>
      <Ring rx={170} ry={46} cy={156} />
      <path d="M200 70 L268 106 L200 142 L132 106 Z" {...S} />
      <path
        d="M132 106 L200 142 L200 222 L132 186 Z"
        fill="var(--bg-soft)"
        stroke={S.stroke}
        strokeWidth={1.5}
      />
      <path
        d="M268 106 L200 142 L200 222 L268 186 Z"
        fill="var(--card-2)"
        stroke={S.stroke}
        strokeWidth={1.5}
      />
      <path d="M216 154 L250 136 L250 172 L216 190 Z" fill="var(--accent)" />
      <path d="M150 136 L184 154 L184 190 L150 172 Z" fill="var(--accent)" opacity={0.85} />
      {[
        [56, 150],
        [330, 176],
        [300, 120],
        [96, 196],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 34} y={y - 11} width={68} height={22} rx={11} {...S} />
      ))}
    </>
  ),
  folders: (
    <>
      {FOLDER_COLORS.map((color, index) => (
        <g key={index} transform={`rotate(${(index - 1.5) * 9} 200 250)`}>
          <rect x={120} y={92 - index * 4} width={44} height={14} rx={4} fill={color} />
          <rect x={120} y={102 - index * 4} width={160} height={110} rx={8} fill={color} />
          <rect x={132} y={118 - index * 4} width={136} height={84} rx={4} fill="var(--card)" />
        </g>
      ))}
    </>
  ),
  "folders-closed": (
    <>
      {FOLDER_COLORS.map((color, index) => (
        <g key={index}>
          <rect x={120 + index * 6} y={92 - index * 8} width={44} height={14} rx={4} fill={color} />
          <rect
            x={120 + index * 6}
            y={102 - index * 8}
            width={160}
            height={110}
            rx={8}
            fill={color}
          />
          <rect
            x={132 + index * 6}
            y={118 - index * 8}
            width={136}
            height={84}
            rx={4}
            fill="var(--card)"
          />
        </g>
      ))}
    </>
  ),
  "device-frame": (
    <>
      <rect x={70} y={60} width={260} height={180} rx={12} {...S} />
      <rect x={70} y={60} width={260} height={22} rx={10} fill="var(--line)" />
      <rect x={84} y={96} width={232} height={130} rx={6} fill="var(--accent-soft)" />
    </>
  ),
  "paper-plane": (
    <>
      <ellipse
        cx={200}
        cy={150}
        rx={160}
        ry={60}
        fill="none"
        stroke="var(--accent)"
        strokeOpacity={0.4}
        strokeDasharray="6 8"
        strokeWidth={1.5}
      />
      <rect x={140} y={110} width={120} height={80} rx={6} {...S} />
      <path d="M140 112 L200 156 L260 112" fill="none" stroke="var(--line-2)" strokeWidth={1.5} />
      <circle cx={200} cy={166} r={8} fill="var(--accent)" />
      <path d="M300 92 L352 76 L322 112 L314 98 Z" fill="var(--accent)" />
    </>
  ),
  "assembling-cube": (
    <>
      <path
        d="M200 70 L268 106 L200 142 L132 106 Z"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity={0.5}
        strokeDasharray="5 6"
        strokeWidth={1.5}
      />
      <path
        d="M132 106 L200 142 L200 222 L132 186 Z"
        fill="var(--card)"
        stroke={S.stroke}
        strokeWidth={1.5}
      />
      <path
        d="M268 106 L200 142 L200 222 L268 186 Z"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity={0.5}
        strokeDasharray="5 6"
        strokeWidth={1.5}
      />
    </>
  ),
  shield: (
    <>
      <path
        d="M200 52 C230 66 260 70 284 70 C284 150 260 200 200 240 C140 200 116 150 116 70 C140 70 170 66 200 52 Z"
        fill="var(--accent)"
      />
      <path
        d="M168 146 L192 170 L236 122"
        fill="none"
        stroke="var(--card)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  "legal-document": (
    <>
      <rect x={156} y={58} width={130} height={176} rx={8} fill="var(--line)" />
      <rect x={136} y={46} width={130} height={176} rx={8} {...S} />
      <rect x={154} y={70} width={60} height={9} rx={3} fill="var(--ink)" />
      {[96, 112, 128, 144, 160].map((y, index) => (
        <rect
          key={y}
          x={154}
          y={y}
          width={index % 3 === 2 ? 64 : 94}
          height={6}
          rx={3}
          fill="var(--line)"
        />
      ))}
      <circle cx={234} cy={196} r={12} fill="var(--accent)" />
    </>
  ),
  "drifting-cube": (
    <>
      <ellipse
        cx={170}
        cy={180}
        rx={120}
        ry={32}
        fill="none"
        stroke="var(--accent)"
        strokeOpacity={0.45}
        strokeWidth={1.5}
      />
      <g transform="rotate(14 280 100)">
        <path d="M280 56 L318 76 L280 96 L242 76 Z" {...S} />
        <path
          d="M242 76 L280 96 L280 140 L242 120 Z"
          fill="var(--bg-soft)"
          stroke={S.stroke}
          strokeWidth={1.5}
        />
        <path
          d="M318 76 L280 96 L280 140 L318 120 Z"
          fill="var(--card-2)"
          stroke={S.stroke}
          strokeWidth={1.5}
        />
        <path d="M290 104 L308 94 L308 114 L290 124 Z" fill="var(--accent)" />
      </g>
    </>
  ),
  /*
   * web-dev-layers still: eight flat layers shown at k ≈ 0.3 (assembled-ish),
   * mild right-and-down perspective offset.  Every colour uses a CSS variable
   * so the still matches both themes without script.
   *
   * Viewbox 400 × 300. Layers listed back-to-front.
   * The slight x-offset mimics the prototype's 0.45 rad y-rotation.
   */
  "web-dev-layers": (
    <>
      {/* Back glass */}
      <rect x={42} y={22} width={295} height={235} rx={18}
        fill="var(--accent)" fillOpacity={0.18}
        stroke="var(--accent)" strokeOpacity={0.35} strokeWidth={1.5} />
      {/* Browser window */}
      <rect x={52} y={30} width={278} height={222} rx={14}
        fill="var(--card)" fillOpacity={0.96}
        stroke="var(--line-2)" strokeWidth={1.5} />
      {/* Title / tab bar strip */}
      <rect x={58} y={31} width={266} height={22} rx={8}
        fill="var(--line)" />
      {/* Traffic-light dots */}
      <circle cx={76}  cy={42} r={5} fill="#f26b5b" />
      <circle cx={91}  cy={42} r={5} fill="#f5b54a" />
      <circle cx={106} cy={42} r={5} fill="#28c840" />
      {/* Nav bar */}
      <rect x={68} y={62} width={240} height={24} rx={10}
        fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      {/* Nav logo tile */}
      <rect x={74} y={67} width={14} height={14} rx={3} fill="var(--accent)" />
      {/* Nav menu bars */}
      {[162, 180, 198].map((x) => (
        <rect key={x} x={x} y={72} width={18} height={4} rx={2} fill="var(--body)" />
      ))}
      {/* Hero headline bars */}
      <rect x={68}  y={96}  width={116} height={18} rx={5} fill="var(--ink)" />
      <rect x={68}  y={120} width={ 84} height={18} rx={5} fill="var(--ink)" />
      {/* Hero sub-text bars */}
      <rect x={68}  y={144} width={110} height={ 6} rx={3} fill="var(--body)" fillOpacity={0.7} />
      <rect x={68}  y={154} width={ 78} height={ 6} rx={3} fill="var(--body)" fillOpacity={0.7} />
      {/* CTA buttons */}
      <rect x={68}  y={168} width={ 62} height={22} rx={11} fill="var(--accent)" />
      <rect x={136} y={168} width={ 66} height={22} rx={11}
        fill="none" stroke="var(--line-2)" strokeWidth={1.5} />
      {/* Three cards */}
      {([196, 232, 268] as const).map((x, i) => (
        <g key={x}>
          <rect x={x} y={96} width={42} height={82} rx={7}
            fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
          <rect x={x + 4} y={100} width={34} height={36} rx={4}
            fill={i === 1 ? "var(--accent)" : "var(--line)"}
            fillOpacity={i === 1 ? 0.4 : 1} />
          <rect x={x + 4} y={140} width={28} height={5} rx={2} fill="var(--ink)" />
          <rect x={x + 4} y={149} width={20} height={4} rx={2} fill="var(--body)" fillOpacity={0.7} />
        </g>
      ))}
      {/* Badge */}
      <rect x={272} y={34} width={56} height={32} rx={9}
        fill="var(--card)" stroke="var(--line-2)" strokeWidth={1.5} />
      <text
        x={300} y={56}
        textAnchor="middle"
        fontSize={13}
        fontFamily="ui-monospace,Menlo,Consolas,monospace"
        fontWeight="bold"
        fill="var(--accent)"
      >
        {"</>"}
      </text>
    </>
  ),
  /*
   * app-dev-phones still: two phones side by side (Mode B, assembled-ish k ≈ 0.3).
   * Left phone = iOS (camera pill), right phone = Android (camera dot).
   * Exact hex colours from the prototype colour table, using CSS variables
   * where the token is byte-identical, literals otherwise.
   * Viewbox 400 × 300. Mild right-lean to match y-rotation -0.2 rad.
   */
  "app-dev-phones": (() => {
    // Phone body dimensions in SVG units (scaled to fit two phones)
    // iOS phone: centred ~x=120, Android: ~x=270
    const phones = [
      { cx: 118, cy: 152, camPill: true  },
      { cx: 274, cy: 148, camPill: false },
    ] as const;

    return (
      <>
        {phones.map(({ cx, cy, camPill }) => (
          <g key={cx}>
            {/* Body */}
            <rect x={cx - 48} y={cy - 97} width={96} height={194} rx={16}
              fill="#172233" />
            {/* Screen */}
            <rect x={cx - 43} y={cy - 93} width={86} height={186} rx={12}
              fill="var(--card)" />
            {/* Camera */}
            {camPill
              ? <rect x={cx - 13} y={cy - 86} width={26} height={5} rx={2.5} fill="var(--ink)" />
              : <circle cx={cx} cy={cy - 84} r={4} fill="var(--ink)" />
            }
            {/* Title bar */}
            <rect x={cx - 36} y={cy - 72} width={46} height={7} rx={3} fill="var(--ink)" />
            {/* Avatar circle */}
            <rect x={cx + 16} y={cy - 76} width={14} height={14} rx={7} fill="var(--accent)" />
            {/* Promo banner */}
            <rect x={cx - 38} y={cy - 50} width={76} height={32} rx={7}
              fill="var(--accent)" fillOpacity={0.85} />
            <rect x={cx - 28} y={cy - 44} width={40} height={5} rx={2} fill="#ffffff" />
            <rect x={cx - 28} y={cy - 36} width={26} height={4} rx={2} fill="#ffffff" fillOpacity={0.7} />
            {/* List rows */}
            {[-5, 23, 51].map((dy) => (
              <g key={dy}>
                <rect x={cx - 38} y={cy + dy} width={76} height={22} rx={5}
                  fill="var(--line)" />
                <rect x={cx - 33} y={cy + dy + 4} width={12} height={12} rx={3}
                  fill={dy === -5 ? "var(--accent)" : "var(--body)"} fillOpacity={0.7} />
                <rect x={cx - 16} y={cy + dy + 5} width={28} height={4} rx={2} fill="var(--ink)" />
                <rect x={cx - 16} y={cy + dy + 12} width={20} height={3} rx={1.5} fill="var(--body)" fillOpacity={0.6} />
              </g>
            ))}
            {/* Tab bar */}
            <rect x={cx - 38} y={cy + 83} width={76} height={15} rx={6}
              fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
            {[-26, -9, 9, 26].map((dx, ti) => (
              <rect key={dx} x={cx + dx - 4} y={cy + 86} width={8} height={8} rx={2}
                fill={ti === 0 ? "var(--accent)" : "var(--body)"} fillOpacity={ti === 0 ? 1 : 0.5} />
            ))}
            {/* FAB */}
            <rect x={cx + 14} y={cy + 60} width={18} height={18} rx={9}
              fill="var(--accent)" />
            <text x={cx + 23} y={cy + 73} textAnchor="middle" fontSize={13} fill="#ffffff" fontWeight="bold">+</text>
          </g>
        ))}
      </>
    );
  })(),

  // ---- Flow model stills ----
  // All use CSS variables where the token is byte-identical to the prototype hex.
  // "--accent" = #0a6b74 light / #22d3ee dark  - close but not byte-identical to
  // TEAL (#0f5f66 / #2fb5bf), so we use the literal hex values.

  // process-steps still: four stage cards on a staircase, completed state.
  "process-steps": (
    <>
      {/* Back glass */}
      <rect x={12} y={8} width={376} height={284} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Progress track */}
      <rect x={30} y={268} width={340} height={12} rx={6} fill="#8fc3cb" fillOpacity={0.4} />
      <rect x={30} y={268} width={340} height={12} rx={6} fill="#0f5f66" />
      {/* Stage cards  - rising staircase, all completed (teal circle, teal pill) */}
      {([0, 1, 2, 3] as const).map((i) => {
        const x = 28 + i * 90;
        const y = 180 - i * 32;
        return (
          <g key={i}>
            <rect x={x} y={y} width={68} height={106} rx={10}
              fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
            <rect x={x + 20} y={y + 10} width={22} height={22} rx={11} fill="#0f5f66" />
            <rect x={x + 6} y={y + 36} width={56} height={5} rx={2} fill="var(--ink)" />
            {[0, 1, 2].map((j) => (
              <rect key={j} x={x + 6} y={y + 50 + j * 12} width={[34, 24, 29][j]} height={5} rx={2} fill="#0f5f66" />
            ))}
            <rect x={x + 10} y={y + 90} width={48} height={9} rx={4.5} fill="#0f5f66" />
            <text x={x + 31} y={y + 24} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#ffffff">{i + 1}</text>
          </g>
        );
      })}
    </>
  ),

  // about-studio still: studio card, values card, timeline card, bubble  - completed.
  "about-studio": (
    <>
      {/* Back glass */}
      <rect x={12} y={8} width={376} height={284} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Studio card */}
      <rect x={20} y={16} width={160} height={200} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={30} y={26} width={38} height={38} rx={8} fill="#0f5f66" />
      <text x={49} y={51} textAnchor="middle" fontSize={22} fontWeight="bold" fill="#ffffff">G</text>
      <rect x={76} y={34} width={86} height={20} rx={5} fill="var(--ink)" />
      {/* Avatars */}
      {[0, 1, 2].map((j) => (
        <rect key={j} x={30 + j * 44} y={82} width={34} height={34} rx={17}
          fill={["#0f5f66", "#8fc3cb", "#b7c0c9"][j]} />
      ))}
      {/* Say hello button */}
      <rect x={30} y={180} width={86} height={26} rx={13} fill="#0f5f66" />
      <text x={73} y={197} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ffffff">Say hello</text>
      {/* Values card */}
      <rect x={192} y={16} width={148} height={110} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      {["Clear scope", "Fast delivery", "Honest talk"].map((txt, j) => (
        <g key={txt}>
          <rect x={202} y={26 + j * 30} width={18} height={18} rx={5} fill="#0f5f66" />
          <rect x={226} y={30 + j * 30} width={68} height={6} rx={3} fill="var(--ink)" />
          <rect x={226} y={40 + j * 30} width={50} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
        </g>
      ))}
      {/* Timeline card */}
      <rect x={192} y={138} width={148} height={80} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={202} y={148} width={76} height={6} rx={3} fill="var(--ink)" />
      <rect x={202} y={170} width={128} height={5} rx={2} fill="#0f5f66" />
      {[-38, 0, 38].map((dx) => (
        <rect key={dx} x={266 + dx - 7} y={167} width={14} height={11} rx={5.5} fill="#0f5f66" />
      ))}
      {/* Hi bubble */}
      <rect x={58} y={228} width={56} height={28} rx={14} fill="#0f5f66" />
      <text x={86} y={247} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#ffffff">Hi!</text>
    </>
  ),

  // contact-message still: form card, inbox card, reply card  - completed.
  "contact-message": (
    <>
      {/* Back glass */}
      <rect x={12} y={8} width={376} height={284} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Form card */}
      <rect x={20} y={14} width={162} height={214} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={30} y={26} width={120} height={10} rx={3} fill="var(--ink)" />
      {/* Fields */}
      {[52, 82, 112].map((y) => (
        <rect key={y} x={30} y={y} width={132} height={y === 112 ? 36 : 22} rx={5}
          fill="var(--line)" />
      ))}
      {/* Typed bars */}
      <rect x={34} y={57} width={62} height={6} rx={3} fill="var(--ink)" />
      <rect x={34} y={87} width={80} height={6} rx={3} fill="var(--ink)" />
      <rect x={34} y={117} width={96} height={6} rx={3} fill="var(--ink)" />
      {/* Send button */}
      <rect x={30} y={160} width={80} height={22} rx={11} fill="#0f5f66" />
      <text x={70} y={175} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ffffff">Send</text>
      {/* Inbox card */}
      <rect x={196} y={14} width={148} height={92} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={206} y={24} width={62} height={8} rx={3} fill="var(--ink)" />
      <rect x={206} y={42} width={12} height={12} rx={6} fill="var(--body)" fillOpacity={0.5} />
      <rect x={224} y={44} width={68} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
      <rect x={224} y={53} width={50} height={4} rx={2} fill="var(--body)" fillOpacity={0.4} />
      {/* New row */}
      <rect x={206} y={66} width={12} height={12} rx={6} fill="#0f5f66" />
      <rect x={224} y={68} width={68} height={5} rx={2} fill="var(--ink)" />
      <rect x={224} y={77} width={50} height={4} rx={2} fill="var(--body)" fillOpacity={0.4} />
      {/* Reply card */}
      <rect x={196} y={116} width={148} height={56} rx={14} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={206} y={126} width={30} height={30} rx={15} fill="#0f5f66" />
      <text x={221} y={146} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#ffffff">✓</text>
      <rect x={242} y={130} width={90} height={7} rx={3} fill="var(--ink)" />
      <rect x={242} y={142} width={62} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
    </>
  ),

  "automation-flow": (
    <>
      {/* Back glass */}
      <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Trigger node */}
      <rect x={30} y={96} width={68} height={44} rx={10} fill="#0f5f66" />
      <rect x={42} y={112} width={6} height={28} rx={3} fill="#ffffff" transform="rotate(-15 48 126)" />
      <rect x={56} y={110} width={6} height={28} rx={3} fill="#ffffff" transform="rotate(15 59 124)" />
      {/* Condition diamond */}
      <rect x={148} y={103} width={36} height={36} rx={5} fill="var(--card)"
        stroke="var(--line-2)" strokeWidth={1.5} transform="rotate(45 166 121)" />
      {/* Action 1 */}
      <rect x={222} y={68} width={68} height={38} rx={8} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={228} y={76} width={16} height={16} rx={4} fill="#0f5f66" />
      <rect x={250} y={80} width={34} height={5} rx={2} fill="var(--ink)" />
      <rect x={250} y={89} width={24} height={4} rx={2} fill="var(--body)" fillOpacity={0.6} />
      {/* Action 2 */}
      <rect x={222} y={136} width={68} height={38} rx={8} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={228} y={144} width={16} height={16} rx={4} fill="#8fc3cb" />
      <rect x={250} y={148} width={34} height={5} rx={2} fill="var(--ink)" />
      <rect x={250} y={157} width={24} height={4} rx={2} fill="var(--body)" fillOpacity={0.6} />
      {/* Data */}
      <rect x={148} y={188} width={56} height={34} rx={8} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={156} y={197} width={34} height={5} rx={2} fill="#0f5f66" />
      <rect x={156} y={206} width={28} height={5} rx={2} fill="#8fc3cb" />
      <rect x={156} y={215} width={22} height={4} rx={2} fill="#8fc3cb" />
      {/* Output */}
      <rect x={316} y={94} width={48} height={48} rx={24} fill="#0f5f66" />
      <rect x={326} y={114} width={8} height={3} rx={1.5} fill="#ffffff" transform="rotate(-45 330 116)" />
      <rect x={332} y={110} width={14} height={3} rx={1.5} fill="#ffffff" transform="rotate(40 339 112)" />
      {/* Connectors */}
      <path d="M98 118 L148 121" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M184 110 C205 110 210 87 222 87" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M184 132 C205 132 210 155 222 155" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M166 139 C166 165 166 180 166 188" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M290 87 C308 87 312 108 316 118" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
    </>
  ),

  "marketing-growth": (
    <>
      {/* Back glass */}
      <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Chart card */}
      <rect x={36} y={42} width={192} height={148} rx={12} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={48} y={52} width={56} height={8} rx={3} fill="var(--ink)" />
      {/* Chart bars */}
      {[22, 32, 28, 46, 60, 76].map((h, i) => (
        <rect key={i} x={52 + i * 28} y={148 - h} width={16} height={h} rx={4}
          fill={i === 5 ? "#0f5f66" : "#8fc3cb"} />
      ))}
      {/* Trend line */}
      <polyline points="60,126 88,116 116,118 144,102 172,89 200,76"
        fill="none" stroke="#0f5f66" strokeWidth={2} />
      {/* Notification chip */}
      <rect x={30} y={22} width={80} height={24} rx={12} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={36} y={29} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={50} y={31} width={34} height={4} rx={2} fill="var(--ink)" />
      {/* Social post */}
      <rect x={254} y={36} width={80} height={72} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={262} y={44} width={16} height={16} rx={8} fill="#0f5f66" />
      <rect x={284} y={48} width={32} height={5} rx={2} fill="var(--ink)" />
      <rect x={262} y={66} width={64} height={30} rx={4} fill="#8fc3cb" fillOpacity={0.4} />
      {/* Target card */}
      <rect x={254} y={120} width={80} height={62} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <circle cx={284} cy={151} r={20} fill="none" stroke="var(--body)" strokeWidth={2} />
      <circle cx={284} cy={151} r={12} fill="none" stroke="#8fc3cb" strokeWidth={2} />
      <circle cx={284} cy={151} r={5} fill="#0f5f66" />
    </>
  ),

  "software-cloud": (
    <>
      {/* Back glass */}
      <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Code window */}
      <rect x={28} y={80} width={92} height={72} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={36} y={92} width={44} height={6} rx={3} fill="#0f5f66" />
      <rect x={36} y={102} width={60} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
      <rect x={36} y={112} width={38} height={5} rx={2} fill="var(--ink)" />
      <rect x={36} y={122} width={50} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
      {/* Cloud */}
      <rect x={148} y={48} width={88} height={32} rx={16} fill="#0f5f66" />
      <rect x={156} y={38} width={44} height={44} rx={22} fill="#0f5f66" />
      <rect x={176} y={34} width={48} height={48} rx={24} fill="#0f5f66" />
      <rect x={158} y={68} width={34} height={5} rx={2} fill="#ffffff" fillOpacity={0.8} />
      {/* API */}
      <rect x={148} y={152} width={50} height={50} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={162} y={165} width={4} height={22} rx={2} fill="#0f5f66" />
      <rect x={176} y={165} width={4} height={22} rx={2} fill="#0f5f66" />
      <rect x={167} y={173} width={8} height={8} rx={4} fill="#8fc3cb" />
      {/* Servers */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={268} y={82 + i * 32} width={82} height={24} rx={6} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
          <circle cx={278} cy={94 + i * 32} r={4} fill="#0f5f66" />
          <rect x={286} y={91 + i * 32} width={30} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
        </g>
      ))}
      {/* Deploy chip */}
      <rect x={268} y={190} width={82} height={24} rx={12} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={276} y={198} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={290} y={201} width={28} height={5} rx={2} fill="var(--ink)" />
      {/* Connectors */}
      <path d="M120 110 C140 110 136 65 148 65" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M120 120 C140 120 140 170 148 175" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M236 65 C254 65 258 95 268 95" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M198 175 C234 175 250 127 268 127" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
    </>
  ),

  "whatsapp-bot-3d": (
    <>
      {/* Back glass */}
      <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Chat window */}
      <rect x={36} y={28} width={118} height={204} rx={16} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={42} y={34} width={106} height={22} rx={8} fill="#0f5f66" />
      <rect x={48} y={40} width={12} height={12} rx={6} fill="#ffffff" />
      <rect x={66} y={43} width={36} height={5} rx={2} fill="#ffffff" />
      {/* Chat bubbles */}
      <rect x={42} y={70}  width={68} height={24} rx={12} fill="var(--body)" fillOpacity={0.4} />
      <rect x={42} y={100} width={76} height={24} rx={12} fill="#0f5f66" fillOpacity={0.8} />
      <rect x={42} y={130} width={56} height={24} rx={12} fill="var(--body)" fillOpacity={0.4} />
      <rect x={42} y={160} width={80} height={30} rx={12} fill="#0f5f66" />
      <rect x={50} y={168} width={50} height={5} rx={2} fill="#ffffff" />
      <rect x={50} y={177} width={34} height={4} rx={2} fill="#ffffff" fillOpacity={0.7} />
      {/* Bot node */}
      <rect x={192} y={52} width={56} height={44} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={202} y={64} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={226} y={64} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={206} y={80} width={18} height={3} rx={1.5} fill="var(--body)" />
      {/* Orders node */}
      <rect x={212} y={132} width={80} height={56} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={220} y={142} width={56} height={7} rx={3} fill="#0f5f66" />
      <rect x={220} y={153} width={46} height={6} rx={3} fill="#8fc3cb" />
      <rect x={220} y={163} width={36} height={6} rx={3} fill="#8fc3cb" />
      {/* Confirmation */}
      <rect x={268} y={208} width={68} height={26} rx={13} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={276} y={216} width={14} height={14} rx={7} fill="#0f5f66" />
      <rect x={296} y={220} width={28} height={5} rx={2} fill="var(--ink)" />
      {/* Connectors */}
      <path d="M154 82 C174 82 180 74 192 74" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M220 96 C220 114 220 125 220 132" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M292 188 L292 208" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
    </>
  ),

  "calling-agent-3d": (
    <>
      {/* Back glass */}
      <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
      {/* Incoming call */}
      <rect x={24} y={48} width={88} height={94} rx={12} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={48} y={58} width={32} height={32} rx={16} fill="#0f5f66" />
      <rect x={56} y={70} width={4} height={18} rx={2} fill="#ffffff" fillOpacity={0.9} />
      <rect x={62} y={70} width={8} height={8} rx={4} fill="#ffffff" />
      <rect x={32} y={102} width={44} height={5} rx={2} fill="var(--ink)" />
      <rect x={32} y={112} width={34} height={5} rx={2} fill="var(--body)" fillOpacity={0.6} />
      <rect x={30} y={124} width={28} height={12} rx={6} fill="#0f5f66" />
      <rect x={62} y={124} width={28} height={12} rx={6} fill="var(--body)" fillOpacity={0.4} />
      {/* Voice wave */}
      <rect x={152} y={40} width={94} height={56} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      {[16, 29, 40, 28, 36, 22, 14].map((h, i) => (
        <rect key={i} x={160 + i * 12} y={80 - h} width={7} height={h} rx={3}
          fill={i % 2 === 0 ? "#8fc3cb" : "#0f5f66"} />
      ))}
      {/* AI agent */}
      <rect x={152} y={162} width={94} height={44} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={170} y={176} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={220} y={176} width={8} height={8} rx={4} fill="#0f5f66" />
      <rect x={182} y={190} width={18} height={3} rx={1.5} fill="var(--body)" />
      <rect x={148} y={175} width={8} height={18} rx={4} fill="#0f5f66" />
      <rect x={242} y={175} width={8} height={18} rx={4} fill="#0f5f66" />
      {/* Calendar */}
      <rect x={272} y={42} width={76} height={60} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={278} y={50} width={64} height={12} rx={4} fill="#0f5f66" />
      {[[278, 66],[310, 66],[278, 82],[310, 82]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={26} height={12} rx={3}
          fill={i === 3 ? "#0f5f66" : "#8fc3cb"} fillOpacity={0.6} />
      ))}
      {/* Summary */}
      <rect x={272} y={172} width={76} height={34} rx={10} fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
      <rect x={280} y={180} width={14} height={14} rx={7} fill="#0f5f66" />
      <rect x={300} y={184} width={34} height={5} rx={2} fill="var(--ink)" />
      <rect x={300} y={193} width={24} height={4} rx={2} fill="var(--body)" fillOpacity={0.6} />
      {/* Connectors */}
      <path d="M112 72 C132 72 140 68 152 68" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M112 100 C132 100 138 180 152 184" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M199 96 C199 125 199 150 199 162" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
      <path d="M246 184 C258 184 262 184 272 184" stroke="var(--body)" strokeWidth={1.5} fill="none" strokeOpacity={0.5} />
    </>
  ),

  "services-hub": (() => {    // Hub centre at (200, 150). Five tiles at radius 95.
    const HX = 200; const HY = 150; const R = 95; const TILE_R = 28;
    const tiles = Array.from({ length: 5 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
      return { x: HX + R * Math.cos(a), y: HY - R * Math.sin(a) };
    });
    return (
      <>
        {/* Back glass */}
        <rect x={12} y={16} width={376} height={268} rx={18} fill="#8fc3cb" fillOpacity={0.18} />
        {/* Connectors */}
        {tiles.map(({ x, y }, i) => (
          <line key={i} x1={HX} y1={HY} x2={x} y2={y}
            stroke="var(--body)" strokeWidth={1.5} strokeOpacity={0.4} />
        ))}
        {/* Hub */}
        <rect x={HX - 36} y={HY - 36} width={72} height={72} rx={18} fill="#0f5f66" />
        <rect x={HX - 16} y={HY - 16} width={32} height={32} rx={10} fill="#ffffff" fillOpacity={0.3} />
        <rect x={HX + 2} y={HY - 7} width={16} height={6} rx={3} fill="#ffffff" />
        {/* Tiles */}
        {tiles.map(({ x, y }, i) => (
          <rect key={i} x={x - TILE_R} y={y - TILE_R} width={TILE_R * 2} height={TILE_R * 2} rx={9}
            fill="var(--card)" stroke={i === 0 ? "#0f5f66" : "var(--line-2)"} strokeWidth={1.5} />
        ))}
        {/* Tile icons (one per service) */}
        {/* web */}
        <rect x={tiles[0].x - 14} y={tiles[0].y - 8} width={28} height={6} rx={3} fill="#0f5f66" />
        <rect x={tiles[0].x - 14} y={tiles[0].y + 2} width={28} height={12} rx={3} fill="#8fc3cb" fillOpacity={0.6} />
        {/* app */}
        <rect x={tiles[1].x - 8} y={tiles[1].y - 20} width={16} height={28} rx={6} fill="#0f5f66" fillOpacity={0.8} />
        {/* automation */}
        <circle cx={tiles[2].x - 10} cy={tiles[2].y} r={7} fill="#0f5f66" />
        <circle cx={tiles[2].x + 10} cy={tiles[2].y - 5} r={7} fill="#8fc3cb" fillOpacity={0.6} />
        {/* marketing bars */}
        {[12, 20, 16, 24].map((h, bi) => (
          <rect key={bi} x={tiles[3].x - 14 + bi * 8} y={tiles[3].y + 10 - h} width={6} height={h} rx={2}
            fill={bi === 3 ? "#0f5f66" : "#8fc3cb"} fillOpacity={0.8} />
        ))}
        {/* cloud */}
        <rect x={tiles[4].x - 14} y={tiles[4].y} width={28} height={12} rx={6} fill="#0f5f66" fillOpacity={0.8} />
        <circle cx={tiles[4].x - 4} cy={tiles[4].y} r={8} fill="#0f5f66" fillOpacity={0.6} />
        <circle cx={tiles[4].x + 6} cy={tiles[4].y - 2} r={10} fill="#0f5f66" fillOpacity={0.6} />
      </>
    );
  })(),

  /*
   * getwithus-overview still: hub logo + four service cards + process track + CTA chip.
   * Completed pose (k=0.3, all pops done). Viewbox 400×300.
   * Uses prototype hex values directly (not CSS vars) for teal, navy, tint.
   * CSS vars used for surf/ink where token is byte-identical in both themes.
   */
  "getwithus-overview": (() => {
    const HX = 200, HY = 148;
    // Four card positions (mirrored from prototype, scaled to SVG space)
    const CARDS = [
      { name: "Web",        cx: 82,  cy: 108, xe: 82 },
      { name: "Apps",       cx: 318, cy: 108, xe: 318 },
      { name: "Automation", cx: 82,  cy: 192, xe: 82 },
      { name: "Marketing",  cx: 318, cy: 192, xe: 318 },
    ] as const;

    return (
      <>
        {/* Back glass */}
        <rect x={8} y={8} width={384} height={284} rx={18} fill="#8fc3cb" fillOpacity={0.18} />

        {/* Connectors (behind everything) */}
        {CARDS.map(({ cx, cy }) => (
          <path key={`${cx}-${cy}`}
            d={`M${HX},${HY} C${HX + (cx > HX ? 40 : -40)},${HY} ${cx + (cx > HX ? -30 : 30)},${cy} ${cx},${cy}`}
            fill="none" stroke="var(--body)" strokeWidth={1.5} strokeOpacity={0.4}
          />
        ))}
        {/* CTA connector */}
        <path d={`M${HX},${HY - 32} C${HX},${HY - 60} ${HX},${HY - 76} ${HX},${HY - 90}`}
          fill="none" stroke="var(--body)" strokeWidth={1.5} strokeOpacity={0.4} />

        {/* Hub: navy tile */}
        <rect x={HX - 36} y={HY - 36} width={72} height={72} rx={14} fill="#0f1b2d" />
        {/* G shape approximation */}
        <path d={`M${HX + 2},${HY - 20} A22,22 0 0 1 ${HX + 20},${HY + 10} L${HX + 11},${HY + 10} A13,13 0 0 0 ${HX + 2},${HY - 20} Z`}
          fill="#ffffff" opacity={0.9} />
        <path d={`M${HX - 2},${HY - 20} A22,22 0 1 0 ${HX - 22},${HY} L${HX - 13},${HY} A13,13 0 1 1 ${HX - 2},${HY - 20} Z`}
          fill="#ffffff" opacity={0.9} />
        {/* Teal square */}
        <rect x={HX + 4} y={HY + 2} width={15} height={15} rx={3} fill="#0f5f66" />

        {/* CTA chip */}
        <rect x={HX - 46} y={HY - 112} width={92} height={22} rx={11} fill="#0f5f66" />
        <text x={HX} y={HY - 100} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ffffff">
          Start a project
        </text>

        {/* Service cards */}
        {CARDS.map(({ name, cx, cy }) => (
          <g key={name}>
            <rect x={cx - 46} y={cy - 32} width={92} height={64} rx={10}
              fill="var(--card)" stroke="var(--line-2)" strokeWidth={1} />
            <rect x={cx - 36} y={cy - 22} width={42} height={8} rx={3} fill="var(--ink)" />
            <rect x={cx - 36} y={cy + 2} width={72} height={18} rx={5}
              fill="#8fc3cb" fillOpacity={0.5} />
            {/* Teal accent dot */}
            <circle cx={cx + 30} cy={cy + 11} r={5} fill="#0f5f66" />
          </g>
        ))}

        {/* Wordmark */}
        <text x={HX} y={HY + 76} textAnchor="middle" fontSize={16} fontWeight="800" fill="var(--ink)">
          <tspan fill="var(--ink)">Get</tspan>
          <tspan fill="#0f5f66">with</tspan>
          <tspan fill="var(--ink)">Us</tspan>
        </text>

        {/* Process track */}
        <rect x={72} y={HY + 100} width={256} height={8} rx={4} fill="#8fc3cb" fillOpacity={0.5} />
        <rect x={72} y={HY + 100} width={256} height={8} rx={4} fill="#0f5f66" />
        {[-96, -32, 32, 96].map((dx, j) => (
          <g key={j}>
            <rect x={HX + dx - 11} y={HY + 97} width={22} height={14} rx={7} fill="#0f5f66" />
            <text x={HX + dx} y={HY + 107} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#ffffff">{j + 1}</text>
          </g>
        ))}
      </>
    );
  })(),
};

/** The still drawing of a page model, at the panel's 4:3. */
export default function ModelStill({ model }: { model: ModelKey }) {
  return (
    <svg viewBox="0 0 400 300" className="h-auto w-[86%]" aria-hidden="true" focusable="false">
      {STILLS[model]}
    </svg>
  );
}

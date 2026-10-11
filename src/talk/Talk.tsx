import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {cameraAt, eased, enter, linear, reveal, slam} from "./motion";
import {
  CARD,
  CJK,
  CINNABAR,
  CIRCLE,
  COBALT,
  COPY,
  FOLDER,
  GRID,
  INK,
  MONO,
  PAPER,
  SANS,
  SERIF,
  STICKY,
} from "./stage";
import {BEAT_COUNT, TOTAL_FRAMES, beatOf, beatStart, stepStart} from "./timing";

export type TalkProps = {
  onlyBeat?: number;
  /** Idle frames since the current step settled (presenter only). Always 0 in Studio and stills, so end frames stay the reference. */
  idle?: number;
};

/** Idle clock: frames elapsed since the current step reached its hold frame. Loop-only motion reads it; it is 0 in stills. */
const IdleContext = React.createContext(0);
const useIdle = (): number => React.useContext(IdleContext);

const TORN =
  "polygon(0 0, 100% 0, 100% 14%, 97% 30%, 100% 46%, 98% 62%, 100% 78%, 95% 93%, 82% 100%, 66% 95%, 50% 100%, 34% 95%, 18% 100%, 4% 92%, 0 78%, 3% 62%, 0 46%, 3% 30%, 0 14%)";

export const Talk: React.FC<TalkProps> = ({onlyBeat, idle = 0}) => {
  const shift = onlyBeat == null ? 0 : beatStart(onlyBeat);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: "hidden"}}>
      <Sequence
        from={-shift}
        durationInFrames={TOTAL_FRAMES}
        style={{overflow: "hidden"}}
      >
        <IdleContext.Provider value={idle}>
          <Scene />
        </IdleContext.Provider>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Beat 17: How to use Cinnabar, as one AI chat window. Screen coords + HT_O. Thread coords are relative to the thread viewport. */
const HT_O = {x: 2340, y: 10060};
const HT_ASK = "Help me build a blind box project by using Spore protocol";
const HT_WIN = {x: 90, y: 78, w: 1740, h: 930, bar: 64, input: 100};
const HT_VIEW = HT_WIN.h - HT_WIN.bar - HT_WIN.input;
/** Message boxes in the thread: top, height. */
const HT_M = {
  m1: {y: 28, h: 132},
  m2: {y: 188, h: 246},
  m3: {y: 462, h: 330},
  m4: {y: 820, h: 96},
  m5: {y: 944, h: 170},
};
const HT_SCROLL3 = Math.max(0, HT_M.m3.y + HT_M.m3.h + 28 - HT_VIEW);
const HT_SCROLL4 = Math.max(0, HT_M.m5.y + HT_M.m5.h + 28 - HT_VIEW);
const HT_AI_X = 170;
const HT_USER_R = HT_WIN.w - 36 - 58 - 18;
const HT_CHIP_X = [28, 308, 588, 868];
const HT_TREE = {x: 28, y: 28, w: 340, h: 274};
const HT_ASM = [
  {x: 400, y: 40},
  {x: 640, y: 40},
  {x: 400, y: 180},
  {x: 640, y: 180},
];
const HT_BTN = {x: 930, y: 118, w: 340, h: 92};
const HT_FLOW = {x0: 40, x1: 700, y: 118, done: 768};

const HtAvatar: React.FC = () => (
  <svg width={58} height={58} viewBox="0 0 58 58" style={{display: "block"}}>
    <circle cx={29} cy={29} r={27} fill={CARD} stroke={INK} strokeWidth={2.5} />
    <circle cx={29} cy={22} r={9} fill={INK} />
    <path d="M 11 49 C 13 36, 45 36, 47 49 C 40 54, 18 54, 11 49 Z" fill={INK} />
  </svg>
);

const HtPlate: React.FC<{w: number; h: number; size: number}> = ({w, h, size}) => (
  <div style={{width: w, height: h, padding: 3, boxSizing: "border-box", borderRadius: 4, background: FOIL, boxShadow: "0 3px 7px rgba(26,26,26,0.2), 0 0 0 1px rgba(26,26,26,0.45)"}}>
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 2,
        background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.08em",
        color: INK,
      }}
    >
      <span style={{marginRight: "-0.08em"}}>CINNABAR</span>
    </div>
  </div>
);

const HowTo: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = beatStart(16);
  const next = beatStart(17);
  if (frame < at || frame >= next + 34) {
    return null;
  }
  const fi = frame + idleF;
  const s1 = stepStart(16, 1);
  const s2 = stepStart(16, 2);
  const s3 = stepStart(16, 3);
  const s4 = stepStart(16, 4);
  const out = deskDrift(frame, next, {x: -1, y: -0.35});
  const clampP = (v: number) => Math.min(1, Math.max(0, v));
  const popStyle = (p: number, dy = 26): React.CSSProperties => ({
    opacity: clampP(p * 2.5),
    transform: `translateY(${(1 - Math.min(1, p)) * dy}px) scale(${interpolate(p, [0, 1], [0.94, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
  });
  // The window, then the request typed into the input box and sent.
  const winP = slam(frame, fps, s1, 2);
  const titleOn = linear(frame, s1 + 8, s1 + 20, 0, 1);
  const typeAt = s1 + 20;
  const typed = Math.max(0, Math.min(HT_ASK.length, Math.floor((frame - typeAt) / 1.15)));
  const sendAt = typeAt + Math.ceil(HT_ASK.length * 1.15) + 6;
  const sent = frame >= sendAt;
  const sendPress = Math.sin(Math.PI * linear(frame, sendAt - 2, sendAt + 8, 0, 1));
  const m1P = slam(frame, fps, sendAt, 4);
  const cursorOn = Math.floor(fi / 12) % 2 === 0;
  // Step 2: typing dots, then Cinnabar's reply with the cloud resolving into numbered steps.
  const dots2 = linear(frame, s2 + 4, s2 + 10, 0, 1) * (1 - linear(frame, s2 + 34, s2 + 36, 0, 1));
  const m2P = slam(frame, fps, s2, 36);
  const cloudIn = linear(frame, s2 + 46, s2 + 58, 0, 1) * (1 - linear(frame, s2 + 82, s2 + 112, 0, 1));
  // Step 3: typing dots, then the Verification Tree, Tx Assembler cards and a waiting Confirm button.
  const dots3 = linear(frame, s3 + 2, s3 + 8, 0, 1) * (1 - linear(frame, s3 + 22, s3 + 24, 0, 1));
  const m3P = slam(frame, fps, s3, 24);
  const btnWait = linear(frame, s3 + 84, s3 + 100, 0, 1);
  // Step 4: Confirm is pressed, the user's tick lands, Cinnabar answers and the rest runs on its own.
  const press = Math.sin(Math.PI * linear(frame, s4 + 2, s4 + 14, 0, 1));
  const pressed = frame >= s4 + 8;
  const m4P = slam(frame, fps, s4, 20);
  const shake = frame - (s4 + 24);
  const shakeX = shake >= 0 && shake < 8 ? Math.sin(shake * 2.6) * 6 * (1 - shake / 8) : 0;
  const shock = linear(frame, s4 + 22, s4 + 40, 0, 1);
  const dots5 = linear(frame, s4 + 46, s4 + 52, 0, 1) * (1 - linear(frame, s4 + 66, s4 + 68, 0, 1));
  const m5P = slam(frame, fps, s4, 68);
  const stickerP = slam(frame, fps, s4, 84);
  const flowDraw = eased(frame, s4 + 76, s4 + 100);
  const doneP = slam(frame, fps, s4, 100);
  const flowStart = s4 + 94;
  const gp = frame >= s4 + 112 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * idleF) / 90) : 0;
  const Wd = HT_FLOW.x1 - HT_FLOW.x0;
  const scroll = HT_SCROLL3 * eased(frame, s3 + 14, s3 + 40) + (HT_SCROLL4 - HT_SCROLL3) * eased(frame, s4 + 10, s4 + 36);
  const cloudPath = "M 975 205 C 960 150, 1030 112, 1085 134 C 1120 98, 1200 104, 1225 140 C 1275 108, 1360 116, 1380 152 C 1430 112, 1520 120, 1535 160 C 1590 120, 1690 124, 1705 166 C 1760 130, 1850 150, 1850 205 C 1880 250, 1830 292, 1775 280 C 1730 312, 1650 308, 1620 280 C 1570 306, 1480 304, 1455 278 C 1410 306, 1330 304, 1300 278 C 1250 304, 1170 300, 1145 276 C 1100 298, 1020 292, 1010 262 C 960 262, 950 228, 975 205 Z";
  const bar = (x: number, y: number, w: number, p: number, o = 0.5) => (
    <div style={{position: "absolute", left: x, top: y, height: 11, width: w * clampP(p), borderRadius: 6, background: INK, opacity: o}} />
  );
  const typingBubble = (y: number, p: number) =>
    p > 0 ? (
      <div style={{position: "absolute", left: 36, top: y, display: "flex", alignItems: "center", gap: 18, opacity: p}}>
        <HtPlate w={116} h={40} size={15} />
        <div style={{display: "flex", gap: 9, padding: "16px 22px", border: `2px solid ${INK}`, borderRadius: 22, background: "#FFFFFF"}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 12, height: 12, borderRadius: "50%", background: INK, opacity: 0.3 + 0.55 * Math.max(0, Math.sin(fi / 3 - i * 1.2))}} />
          ))}
        </div>
      </div>
    ) : null;
  const aiBubble = (y: number, h: number, w: number, p: number, children: React.ReactNode) => (
    <div style={{position: "absolute", left: 36, top: y, width: HT_AI_X + w - 36, height: h, ...popStyle(p)}}>
      <div style={{position: "absolute", left: 0, top: 6}}>
        <HtPlate w={116} h={40} size={15} />
      </div>
      <div style={{position: "absolute", left: HT_AI_X - 36, top: 0, width: w, height: h, boxSizing: "border-box", background: "#FBEFE9", border: `2.5px solid ${CINNABAR}`, borderRadius: "6px 24px 24px 24px"}}>{children}</div>
    </div>
  );
  const asmCard = (k: number) => {
    const c = HT_ASM[k];
    const p = slam(frame, fps, s3, 40 + k * 8);
    if (frame < s3 + 40 + k * 8) {
      return null;
    }
    return (
      <div
        key={k}
        style={{
          position: "absolute",
          left: c.x,
          top: c.y,
          width: 220,
          height: 110,
          boxSizing: "border-box",
          padding: "26px 16px 14px",
          background: CARD,
          border: `2px solid ${INK}`,
          boxShadow: "0 10px 18px rgba(26,26,26,0.14)",
          transform: `translateY(${(1 - Math.min(1, p)) * -70}px) scale(${interpolate(p, [0, 1], [1.2, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(${[-1.8, 1.4, 1.6, -1.4][k]}deg)`,
          opacity: clampP(p * 3),
        }}
      >
        <div style={{position: "absolute", top: -11, left: "50%", width: 80, height: 20, marginLeft: -40, background: "rgba(255,255,255,0.62)", transform: `rotate(${k % 2 === 0 ? -3 : 2}deg)`}} />
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28, lineHeight: "30px", color: INK, letterSpacing: "-0.02em", whiteSpace: "nowrap"}}>Tx Assembler</div>
        <div style={{display: "flex", gap: 8, marginTop: 14}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 34, height: 12, borderRadius: 3, border: `2px solid ${INK}`, background: i === 2 ? INK : "transparent", opacity: 0.6}} />
          ))}
        </div>
      </div>
    );
  };
  const treeP = slam(frame, fps, s3, 28);
  return (
    <div style={{position: "absolute", left: HT_O.x, top: HT_O.y}}>
      {winP > 0.02 ? (
        <div style={cssDrift(out, HT_WIN.x + HT_WIN.w / 2, HT_WIN.y + HT_WIN.h / 2)}>
          <div
            style={{
              position: "absolute",
              left: HT_WIN.x,
              top: HT_WIN.y,
              width: HT_WIN.w,
              height: HT_WIN.h,
              boxSizing: "border-box",
              background: CARD,
              border: `2.5px solid ${INK}`,
              borderRadius: 20,
              boxShadow: "0 24px 44px rgba(26,26,26,0.16)",
              overflow: "hidden",
              transformOrigin: "50% 50%",
              transform: `translateY(${(1 - Math.min(1, winP)) * -60}px) scale(${interpolate(winP, [0, 1], [0.94, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
              opacity: clampP(winP * 2.5),
            }}
          >
            {/* Title bar: the headline moves in here. */}
            <div style={{position: "absolute", left: 0, top: 0, right: 0, height: HT_WIN.bar, borderBottom: `2px solid ${INK}`, background: FOLDER, display: "flex", alignItems: "center", gap: 12, padding: "0 26px"}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{width: 15, height: 15, borderRadius: "50%", border: `2px solid ${INK}`, background: i === 0 ? CINNABAR : "transparent"}} />
              ))}
              <div style={{marginLeft: 20, fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em", color: INK, opacity: titleOn, whiteSpace: "nowrap"}}>How to use Cinnabar</div>
            </div>
            {/* The thread. */}
            <div style={{position: "absolute", left: 0, right: 0, top: HT_WIN.bar, height: HT_VIEW, overflow: "hidden"}}>
              <div style={{position: "absolute", left: 0, top: 0, width: HT_WIN.w, transform: `translateY(${-scroll}px)`}}>
                {/* M1: the user's request. */}
                {sent ? (
                  <div style={{position: "absolute", left: 0, top: HT_M.m1.y, width: HT_WIN.w, height: HT_M.m1.h, ...popStyle(m1P)}}>
                    <div style={{position: "absolute", left: HT_USER_R + 18, top: 0}}>
                      <HtAvatar />
                    </div>
                    <div style={{position: "absolute", left: HT_USER_R - 820, top: 0, width: 820, height: HT_M.m1.h, boxSizing: "border-box", padding: "20px 28px", background: "#FFFFFF", border: `2.5px solid ${INK}`, borderRadius: "24px 6px 24px 24px", fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: INK}}>
                      {HT_ASK}
                    </div>
                  </div>
                ) : null}
                {/* M2: Cinnabar's reply with the idea resolving into numbered steps. */}
                {typingBubble(HT_M.m2.y, dots2)}
                {frame >= s2 + 36
                  ? aiBubble(
                      HT_M.m2.y,
                      HT_M.m2.h,
                      1130,
                      m2P,
                      <>
                        {bar(28, 34, 540, linear(frame, s2 + 42, s2 + 58, 0, 1))}
                        {bar(28, 62, 400, linear(frame, s2 + 50, s2 + 66, 0, 1))}
                        {cloudIn > 0 ? (
                          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
                            <g transform={`translate(18 96) scale(1.1 0.6) translate(-950 -100)`} opacity={cloudIn}>
                              <path d={cloudPath} fill="rgba(26,26,26,0.05)" stroke={INK} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" opacity={0.5} style={{filter: "blur(2.5px)"}} vectorEffect="non-scaling-stroke" />
                            </g>
                          </svg>
                        ) : null}
                        {HT_CHIP_X.map((x, k) => {
                          const q = eased(frame, s2 + 72 + k * 8, s2 + 94 + k * 8);
                          if (q <= 0) {
                            return null;
                          }
                          return (
                            <div
                              key={k}
                              style={{position: "absolute", left: x, top: 110, width: 190, height: 100, boxSizing: "border-box", padding: "18px 18px", background: CARD, border: `2.5px solid ${INK}`, borderRadius: 10, boxShadow: "0 8px 14px rgba(26,26,26,0.12)", filter: `blur(${(1 - q) * 12}px)`, opacity: q, transform: `scale(${0.88 + 0.12 * q})`}}
                            >
                              <div style={{height: 10, width: 80, borderRadius: 5, background: INK, opacity: 0.6}} />
                              <div style={{height: 10, width: 126, borderRadius: 5, background: INK, opacity: 0.3, marginTop: 12}} />
                              <div style={{height: 10, width: 70, borderRadius: 5, background: INK, opacity: 0.3, marginTop: 10}} />
                            </div>
                          );
                        })}
                        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
                          {[0, 1, 2].map((k) => {
                            const a = eased(frame, s2 + 92 + k * 9, s2 + 104 + k * 9);
                            if (a <= 0) {
                              return null;
                            }
                            const x0 = HT_CHIP_X[k] + 190 + 8;
                            const x1 = HT_CHIP_X[k + 1] - 8;
                            const nl = linear(frame, s2 + 100 + k * 9, s2 + 108 + k * 9, 0, 1);
                            return (
                              <g key={k}>
                                <path d={`M ${x0} 160 L ${x0 + (x1 - x0) * a} 160`} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
                                {a >= 1 ? <path d={`M ${x1 - 12} 150 L ${x1} 160 L ${x1 - 12} 170`} stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
                                <text x={(x0 + x1) / 2} y={138} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={CINNABAR} opacity={nl}>
                                  {k + 1}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </>,
                    )
                  : null}
                {/* M3: Verification Tree + Tx Assemblers + a waiting Confirm button. */}
                {typingBubble(HT_M.m3.y, dots3)}
                {frame >= s3 + 24
                  ? aiBubble(
                      HT_M.m3.y,
                      HT_M.m3.h,
                      1330,
                      m3P,
                      <>
                        {frame >= s3 + 28 ? (
                          <div
                            style={{
                              position: "absolute",
                              left: HT_TREE.x,
                              top: HT_TREE.y,
                              width: HT_TREE.w,
                              height: HT_TREE.h,
                              boxSizing: "border-box",
                              padding: "26px 16px 14px",
                              background: CARD,
                              border: `2px solid ${INK}`,
                              boxShadow: "0 12px 20px rgba(26,26,26,0.14)",
                              textAlign: "center",
                              transform: `translateY(${(1 - Math.min(1, treeP)) * -60}px) scale(${interpolate(treeP, [0, 1], [1.18, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(-1.2deg)`,
                              opacity: clampP(treeP * 3),
                            }}
                          >
                            <div style={{position: "absolute", top: -12, left: "50%", width: 96, height: 24, marginLeft: -48, background: "rgba(255,255,255,0.62)", transform: "rotate(-2deg)"}} />
                            <svg width={308} height={140} viewBox="0 0 310 150" style={{display: "block", margin: "0 auto"}}>
                              {[
                                [155, 22, 80, 70],
                                [155, 22, 230, 70],
                                [80, 70, 42, 124],
                                [80, 70, 118, 124],
                                [230, 70, 192, 124],
                                [230, 70, 268, 124],
                              ].map(([x1, y1, x2, y2], i) => {
                                const g = linear(frame, s3 + 34 + i * 3, s3 + 50 + i * 3, 0, 1);
                                return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * g} y2={y1 + (y2 - y1) * g} stroke={INK} strokeWidth={3} strokeLinecap="round" />;
                              })}
                              <rect x={125} y={6} width={60} height={30} rx={6} fill={INK} />
                              {[80, 230].map((x) => (
                                <rect key={x} x={x - 26} y={54} width={52} height={28} rx={6} fill={CARD} stroke={INK} strokeWidth={3} />
                              ))}
                              {[42, 118, 192, 268].map((x) => (
                                <rect key={x} x={x - 20} y={110} width={40} height={26} rx={13} fill={CARD} stroke={INK} strokeWidth={3} />
                              ))}
                            </svg>
                            <div style={{marginTop: 10, fontFamily: SERIF, fontWeight: 700, fontSize: 31, color: INK, letterSpacing: "-0.02em", whiteSpace: "nowrap"}}>Verification Tree</div>
                          </div>
                        ) : null}
                        {[0, 1, 2, 3].map((k) => asmCard(k))}
                        {btnWait > 0 ? (
                          <div
                            style={{
                              position: "absolute",
                              left: HT_BTN.x,
                              top: HT_BTN.y - HT_BTN.h / 2,
                              width: HT_BTN.w,
                              height: HT_BTN.h,
                              boxSizing: "border-box",
                              borderRadius: 16,
                              border: pressed ? `5px solid ${CINNABAR}` : `5px dashed ${CINNABAR}`,
                              background: pressed ? CINNABAR : "transparent",
                              color: pressed ? "#FFF8EE" : CINNABAR,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 14,
                              fontFamily: SANS,
                              fontWeight: 800,
                              fontSize: 48,
                              letterSpacing: "0.03em",
                              opacity: pressed ? 1 : 0.55 * btnWait,
                              transform: `scale(${1 - 0.07 * press})`,
                            }}
                          >
                            {pressed ? (
                              <svg width={46} height={46} viewBox="0 0 62 62">
                                <path d="M 8 33 L 25 50 L 55 12" fill="none" stroke="#FFF8EE" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                            Confirm
                          </div>
                        ) : null}
                      </>,
                    )
                  : null}
                {/* M4: the user confirms. */}
                {frame >= s4 + 20 ? (
                  <div style={{position: "absolute", left: 0, top: HT_M.m4.y, width: HT_WIN.w, height: HT_M.m4.h, opacity: clampP(m4P * 2.5)}}>
                    <div style={{position: "absolute", left: HT_USER_R + 18, top: 16}}>
                      <HtAvatar />
                    </div>
                    {shock > 0 && shock < 1 ? (
                      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
                        <g opacity={1 - shock} stroke={CINNABAR} strokeWidth={5} strokeLinecap="round">
                          {Array.from({length: 14}, (_, i) => {
                            const a = (i / 14) * Math.PI * 2 + 0.2;
                            if (Math.cos(a) > 0.8) {
                              return null;
                            }
                            const rx = 205 + 24 * shock;
                            const ry = 62 + 18 * shock;
                            const cx = HT_USER_R - 180;
                            return <line key={i} x1={cx + rx * Math.cos(a)} y1={48 + ry * Math.sin(a)} x2={cx + (rx + 24) * Math.cos(a)} y2={48 + (ry + 24) * Math.sin(a)} />;
                          })}
                        </g>
                      </svg>
                    ) : null}
                    <div
                      style={{
                        position: "absolute",
                        left: HT_USER_R - 360 + shakeX,
                        top: 0,
                        width: 360,
                        height: HT_M.m4.h,
                        boxSizing: "border-box",
                        border: `5px solid ${CINNABAR}`,
                        outline: `2px solid ${CINNABAR}`,
                        outlineOffset: 4,
                        borderRadius: 18,
                        background: "rgba(217,56,30,0.07)",
                        color: CINNABAR,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                        fontFamily: SANS,
                        fontWeight: 800,
                        fontSize: 46,
                        letterSpacing: "0.03em",
                        mixBlendMode: "multiply",
                        transformOrigin: "50% 50%",
                        transform: `rotate(-3deg) scale(${interpolate(m4P, [0, 1], [1.7, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
                      }}
                    >
                      <svg width={50} height={50} viewBox="0 0 62 62">
                        <path d="M 8 33 L 25 50 L 55 12" fill="none" stroke={CINNABAR} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Confirm
                    </div>
                  </div>
                ) : null}
                {/* M5: Cinnabar does the rest. */}
                {typingBubble(HT_M.m5.y, dots5)}
                {frame >= s4 + 68
                  ? aiBubble(
                      HT_M.m5.y,
                      HT_M.m5.h,
                      830,
                      m5P,
                      <>
                        {bar(28, 30, 360, linear(frame, s4 + 72, s4 + 90, 0, 1))}
                        {flowDraw > 0 ? (
                          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
                            <line x1={HT_FLOW.x0} y1={HT_FLOW.y} x2={HT_FLOW.x0 + Wd * flowDraw} y2={HT_FLOW.y} stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" />
                            {[0, 1, 2].map((i) => {
                              if (frame < flowStart) {
                                return null;
                              }
                              const t = (((fi - flowStart) / 96 + i / 3) % 1 + 1) % 1;
                              const op = Math.min(1, t * 10) * (1 - linear(t, 0.9, 1, 0, 1));
                              return (
                                <g key={i} transform={`translate(${HT_FLOW.x0 + Wd * t} ${HT_FLOW.y})`} opacity={op}>
                                  <rect x={-18} y={-14} width={36} height={28} rx={5} fill={CARD} stroke={INK} strokeWidth={3.5} />
                                  <line x1={-10} y1={-4} x2={10} y2={-4} stroke={INK} strokeWidth={3} strokeLinecap="round" />
                                  <line x1={-10} y1={5} x2={3} y2={5} stroke={INK} strokeWidth={3} strokeLinecap="round" />
                                </g>
                              );
                            })}
                            {doneP > 0.02 ? (
                              <g transform={`translate(${HT_FLOW.done} ${HT_FLOW.y}) scale(${Math.min(1.2, doneP) * (1 + 0.07 * gp)})`} opacity={clampP(doneP * 3)}>
                                <circle r={30} fill={CARD} stroke={CINNABAR} strokeWidth={6} />
                                <circle r={30 + 12 * gp} fill="none" stroke={CINNABAR} strokeWidth={3} opacity={0.5 * (1 - gp)} />
                                <path d="M -13 2 L -4 12 L 14 -10" fill="none" stroke={CINNABAR} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                              </g>
                            ) : null}
                          </svg>
                        ) : null}
                      </>,
                    )
                  : null}
                {frame >= s4 + 84 ? (
                  <BigNote x={1420} y={HT_M.m5.y + HT_M.m5.h / 2 + 14} width={540} tilt={-3} p={stickerP} size={44}>
                    Cinnabar does the rest
                  </BigNote>
                ) : null}
              </div>
              <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 56, background: `linear-gradient(${CARD}, rgba(251,250,246,0))`}} />
            </div>
            {/* Input box with a blinking cursor and a send button. */}
            <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: HT_WIN.input, borderTop: `2px solid ${INK}`, background: FOLDER}}>
              <div style={{position: "absolute", left: 36, right: 36, top: 15, height: 70, boxSizing: "border-box", borderRadius: 35, border: `2.5px solid ${INK}`, background: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 100px 0 30px", fontFamily: SANS, fontWeight: 600, fontSize: 34, color: INK, whiteSpace: "nowrap", overflow: "hidden"}}>
                {typed > 0 && !sent ? <span>{HT_ASK.slice(0, typed)}</span> : null}
                {typed === 0 || sent ? <span style={{display: "inline-block", width: 220, height: 11, borderRadius: 6, background: INK, opacity: 0.14, marginRight: 8}} /> : null}
                <span style={{display: "inline-block", width: 3, height: 38, marginLeft: 2, background: CINNABAR, opacity: cursorOn ? 1 : 0}} />
              </div>
              <div style={{position: "absolute", right: 46, top: 24, width: 52, height: 52, borderRadius: "50%", border: `2.5px solid ${INK}`, background: sendPress > 0.04 ? CINNABAR : INK, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.14 * sendPress})`}}>
                <svg width={26} height={26} viewBox="0 0 26 26">
                  <path d="M 4 13 L 22 13 M 14 5 L 22 13 L 14 21" fill="none" stroke="#FFF8EE" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam = cameraAt(frame);
  const shA = catchUpShake(frame);
  const shB = gapShake(frame);
  const sh = {x: shA.x + shB.x, y: shA.y + shB.y};
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transformOrigin: "0 0",
          transform: `translate(${960 + sh.x}px, ${540 + sh.y}px) scale(${cam.scale}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <Desk />
        <Patterns />
        <OpeningFile frame={frame} fps={fps} />
        <TitleNote frame={frame} fps={fps} />
        <RgbArrival frame={frame} />
        <Thermometer frame={frame} fps={fps} />
        <CircleCards frame={frame} fps={fps} />
        <Arrows frame={frame} />
        <JourneyNotes frame={frame} fps={fps} />
        <LearnDocs frame={frame} fps={fps} />
        <BuildWall frame={frame} fps={fps} />
        <SuccessRoad frame={frame} fps={fps} />
        <NeedsAi frame={frame} fps={fps} />
        <AiCore frame={frame} fps={fps} />
        <GapBuild frame={frame} fps={fps} />
        <ToolFile frame={frame} fps={fps} />
        <CinnabarBox frame={frame} fps={fps} />
        <TxAssemblers frame={frame} fps={fps} />
        <Skills frame={frame} fps={fps} />
        <Tree frame={frame} fps={fps} />
        <Framework frame={frame} fps={fps} />
        <Closing frame={frame} fps={fps} />
        <HowTo frame={frame} fps={fps} />
      </div>
      <JumpView frame={frame} fps={fps} />
      <AiEra frame={frame} fps={fps} />
      <LessBuild frame={frame} fps={fps} />
      <CatchUp frame={frame} fps={fps} />
      <Overlay frame={frame} fps={fps} />
    </>
  );
};

const Desk: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        left: -2500,
        top: -1800,
        width: 11000,
        height: 16500,
        backgroundColor: PAPER,
        backgroundImage: `
          linear-gradient(${GRID} 1px, transparent 1px),
          linear-gradient(90deg, ${GRID} 1px, transparent 1px),
          radial-gradient(rgba(26,26,26,0.045) 0.7px, transparent 0.75px),
          radial-gradient(rgba(255,255,255,0.55) 0.6px, transparent 0.7px)
        `,
        backgroundSize: "48px 48px, 48px 48px, 3px 3px, 5px 5px",
      }}
    />
  );
};

const Patterns: React.FC = () => {
  return (
    <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0}}>
      <defs>
        <pattern
          id="halftone"
          width={5}
          height={5}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={1.2} cy={1.2} r={1} fill={INK} />
        </pattern>
        <pattern
          id="halftoneRed"
          width={6}
          height={6}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={1.4} cy={1.4} r={1.15} fill={CINNABAR} />
        </pattern>
      </defs>
    </svg>
  );
};

/**
 * Title page click 3, the "why it exists" sticky: a ballistic pop out of the case, then a bouncing landing. Everything is a closed form of the frame.
 * Timeline, in frames after the click: 0-10 the case squeezes (anticipation), 10 launch, 10-50 flight, 50 impact, two decaying hops, then rest.
 */
const TN = {
  anticipate: 10,
  flight: 40,
  hop1: 14,
  hop2: 8,
  mouth: { x: 1100, y: 452 },
  land: { x: 1572, y: 862 },
  apexY: 230,
  boxH: 190,
};

/** Damped spring impulse starting at t0 with amplitude a: zero before t0, starts at zero, swings both ways. */
const impulse = (
  t: number,
  t0: number,
  a: number,
  k: number,
  w: number,
): number =>
  t >= t0 ? a * Math.exp(-(t - t0) / k) * Math.sin(w * (t - t0)) : 0;

/** The case file's reaction to the sticky: squeeze, recoil + wobble at launch, then a jiggle at each landing impact. All terms are 0 at rest. */
const casePose = (
  frame: number,
): { dy: number; rot: number; sx: number; sy: number; dip: number } => {
  const t = frame - stepStart(0, 3);
  if (t < 0 || t >= 100) {
    return { dy: 0, rot: 0, sx: 1, sy: 1, dip: 0 };
  }
  const tau = t - TN.anticipate;
  // q: 0 -> 1 while squeezing, then releases as a spring that overshoots (negative) and settles.
  const q =
    t < TN.anticipate
      ? Easing.inOut(Easing.quad)(t / TN.anticipate)
      : Math.exp(-tau / 5) * Math.cos(0.7 * tau);
  const land = TN.anticipate + TN.flight;
  const times = [land, land + TN.hop1, land + TN.hop1 + TN.hop2];
  const amp = [14, 6, 3];
  const rot = [1.8, 0.7, 0.3];
  let dy = 9 * q;
  let r = tau >= 0 ? 1.3 * Math.exp(-tau / 9) * Math.sin(0.45 * tau) : 0;
  times.forEach((t0, i) => {
    dy += impulse(t, t0, amp[i], 6, 0.55);
    r += impulse(t, t0, rot[i], 8, 0.5);
  });
  return { dy, rot: r, sx: 1 + 0.012 * q, sy: 1 - 0.035 * q, dip: 14 * q };
};

const TitleNote: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const idleF = useIdle();
  const start = stepStart(0, 3);
  if (frame < start) {
    return null;
  }
  const t = frame - start;
  const tau = t - TN.anticipate;
  const T = TN.flight;
  const land = TN.anticipate + T;
  const { mouth, land: spot } = TN;
  // Ballistic arc: constant horizontal speed, vertical y = y0 + v*u + g*u^2/2 with the apex at apexY and touchdown at the landing spot.
  const rise = mouth.y - TN.apexY;
  const a = (T * T) / (4 * rise);
  const v = (T + Math.sqrt(T * T + 4 * a * (spot.y - mouth.y))) / (2 * a);
  const g = (v * v) / (2 * rise);
  const u = Math.min(1, Math.max(0, tau / T));
  const flying = tau >= 0 && tau < T;
  const air = tau >= 0 ? Math.min(tau, T) : 0;
  const x = mouth.x + (spot.x - mouth.x) * u;
  const arcY = mouth.y - v * air + 0.5 * g * air * air;
  const groundY = mouth.y + (spot.y - mouth.y) * u;
  // After touchdown: two decaying hops, each a parabola, with a squash at every contact.
  const t2 = t - land;
  const hop = (tt: number, d: number, h: number): number =>
    tt >= 0 && tt < d ? 4 * h * (tt / d) * (1 - tt / d) : 0;
  const hopUp = hop(t2, TN.hop1, 42) + hop(t2 - TN.hop1, TN.hop2, 13);
  const y = (tau < 0 ? mouth.y : arcY) - hopUp;
  const height = Math.max(0, groundY - y);
  // Grows as it rises toward the viewer, a little extra at the apex, exactly 1 on touchdown.
  const scale =
    tau < 0
      ? 0.1
      : 0.1 +
        0.9 * Math.pow(u, 0.85) +
        0.3 * Math.sin(Math.PI * u) * (flying ? 1 : 0);
  // Tumble that damps to the settled tilt (-3), plus paper flutter (a rocking rotateX and a little skew) while airborne.
  const tumble = tau >= 0 ? 30 * Math.sin(2 * Math.PI * 1.15 * u) * (1 - u) : 0;
  const settle = Math.min(1, Math.max(0, t2 / 6));
  const done = t2 >= 50;
  const wobble = done
    ? 0
    : impulse(t2, 0, 5, 9, 0.5) +
      impulse(t2, TN.hop1, 2.2, 8, 0.5) +
      impulse(t2, TN.hop1 + TN.hop2, 1, 8, 0.5);
  const tilt =
    -7 +
    4 * u +
    tumble +
    wobble +
    1.8 * settle * Math.sin((2 * Math.PI * idleF) / 110);
  const flutter = flying ? 16 * Math.sin(tau * 0.85) * (1 - 0.5 * u) : 0;
  const skew = flying ? 3 * Math.sin(tau * 0.6 + 1) : 0;
  // Squash at every contact, held on the bottom edge.
  const squash = done
    ? 0
    : [0, TN.hop1, TN.hop1 + TN.hop2].reduce((sum, t0, i) => {
        const e = t2 - t0;
        return e >= 0
          ? sum + [0.2, 0.09, 0.04][i] * Math.exp(-e / 4.5) * Math.cos(0.9 * e)
          : sum;
      }, 0);
  const sy = 1 - squash;
  const sx = 1 + 0.5 * squash;
  const bottomFix = TN.boxH * scale * (1 - sy);
  const opacityIn = tau < 0 ? 0 : Math.min(1, tau / 3);
  // Leaves as the camera starts toward beat 2, so its edge never shows there.
  const tuck = linear(frame, beatStart(1), beatStart(1) + 10, 1, 0);
  if (tuck <= 0) {
    return null;
  }
  const shadowH = Math.min(1, height / 220);
  const sparkT = tau >= 0 && tau < 16 ? tau / 16 : -1;
  return (
    <>
      {sparkT >= 0 ? (
        <svg
          width={1}
          height={1}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            overflow: "visible",
            opacity: tuck,
          }}
        >
          {[-150, -125, -100, -80, -55, -30].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r0 = 30 + 80 * sparkT * (0.8 + 0.1 * (i % 3));
            const len = 30 * (1 - sparkT) + 4;
            return (
              <line
                key={deg}
                x1={mouth.x + (r0 - len) * Math.cos(rad) * 1.4}
                y1={TN.mouth.y - 8 + (r0 - len) * Math.sin(rad)}
                x2={mouth.x + r0 * Math.cos(rad) * 1.4}
                y2={TN.mouth.y - 8 + r0 * Math.sin(rad)}
                stroke={i % 2 === 0 ? CINNABAR : INK}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={1 - sparkT}
              />
            );
          })}
        </svg>
      ) : null}
      {tau >= 0 && shadowH > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: groundY - TN.boxH / 2 + TN.boxH * scale + 2,
            width: 400 * scale,
            height: 34 * (0.6 + 0.4 * scale),
            borderRadius: "50%",
            background: "rgba(26,26,26,0.45)",
            filter: `blur(${5 + 14 * shadowH}px)`,
            opacity:
              tuck * 0.5 * Math.min(1, shadowH * 3) * (1 - 0.5 * shadowH),
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + bottomFix,
          opacity: tuck * opacityIn,
          width: 440,
          minHeight: 190,
          padding: "56px 30px 30px",
          boxSizing: "border-box",
          background: STICKY,
          color: INK,
          fontFamily:
            '"Marker Felt", "Chalkboard SE", "Bradley Hand", "Comic Neue", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          boxShadow: `0 ${22 * Math.min(1, 0.3 + shadowH + settle)}px 36px rgba(26,26,26,0.2)`,
          transform: `translate(-50%, -50%) ${flying ? `perspective(1100px) rotateX(${flutter}deg) skewX(${skew}deg) ` : ""}scale(${scale * sx}, ${scale * sy}) rotate(${tilt}deg)`,
          transformOrigin: "50% 0%",
          zIndex: 3,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            width: 128,
            height: 30,
            marginLeft: -64,
            background: "rgba(255,255,255,0.6)",
            transform: "rotate(-2deg)",
          }}
        />
        why it exists
      </div>
    </>
  );
};

const OpeningFile: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  // The case drops in on the first click (step 1); step 0 is an empty desk.
  const at0 = stepStart(0, 1);
  const p = enter(frame, fps, at0, 0);
  const slide = interpolate(p, [0, 1], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  const flip = enter(frame, fps, at0, 12);
  const angle = interpolate(flip, [0, 1], [-78, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label = enter(frame, fps, at0, 14);
  const pose = casePose(frame);
  // The label plate stamps on with an overshoot, one foil sweep follows, then a faint sweep every 150 idle frames (none at idle 0).
  const idleF = useIdle();
  const stampP = slam(frame, fps, at0, 14);
  const entrySweep = linear(frame, at0 + 34, at0 + 62, 0, 1);
  const idleT = idleF - 45;
  const idlePhase = idleT >= 0 ? idleT % 150 : 999;
  const shinePos =
    entrySweep > 0 && entrySweep < 1
      ? entrySweep
      : idlePhase < 30
        ? idlePhase / 30
        : 0;
  const shineAlpha =
    entrySweep > 0 && entrySweep < 1 ? 1 : idlePhase < 30 ? 0.5 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 1100,
        top: 680,
        width: 740,
        height: 470,
        transform: `translate(-50%, -50%) translateX(${slide}px)${pose.dip === 0 && pose.dy === 0 && pose.rot === 0 ? "" : ` translateY(${pose.dy}px) rotate(${pose.rot}deg) scale(${pose.sx}, ${pose.sy})`}`,
        opacity: Math.min(1, Math.max(0, p * 2)),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 34,
          top: -38,
          padding: "9px 20px 7px",
          background: FOLDER,
          border: `1px solid ${INK}`,
          borderBottom: "none",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.22em",
          color: INK,
          transform: `perspective(600px) rotateX(${angle + pose.dip}deg)`,
          transformOrigin: "bottom left",
        }}
      >
        CINNABAR
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: FOLDER,
          border: `1px solid ${INK}`,
          boxShadow: "0 18px 40px rgba(26,26,26,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 10,
            background: COBALT,
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            padding: "24px 44px 22px",
            background: CINNABAR,
            border: `3px solid ${INK}`,
            boxShadow:
              "0 12px 24px rgba(26,26,26,0.26), inset 0 -4px 0 rgba(0,0,0,0.14)",
            overflow: "hidden",
            opacity: Math.min(1, Math.max(0, stampP * 3)),
            transform: `translate(-50%, -50%) rotate(-1.2deg) scale(${interpolate(
              stampP,
              [0, 1],
              [1.45, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "extend",
              },
            )})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 7,
              right: 7,
              top: 7,
              bottom: 7,
              border: `1.5px solid ${CARD}`,
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "0.2em",
              lineHeight: 1,
              color: CARD,
              marginRight: "-0.2em",
              textShadow: "0 2px 0 rgba(90,16,6,0.45)",
            }}
          >
            CINNABAR
          </div>
          {shineAlpha > 0 ? (
            <div
              style={{
                position: "absolute",
                top: -20,
                bottom: -20,
                left: -140 + shinePos * 900,
                width: 110,
                transform: "skewX(-22deg)",
                background:
                  "linear-gradient(90deg, rgba(255,244,210,0), rgba(255,244,210,0.8), rgba(255,244,210,0))",
                opacity: shineAlpha,
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 330,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: "0.06em",
            color: INK,
            opacity: Math.min(1, Math.max(0, label)) * 0.85,
          }}
        >
          CKB script programming tool
        </div>
      </div>
    </div>
  );
};

/** Beat 2. Crowd arrives while a red dot draws the run-up. World coords, kept inside this beat's view. */
const RGB_CROWD: {x: number; y: number; s: number; d: number}[] = [
  {x: 2290, y: 1040, s: 1.05, d: 2},
  {x: 2370, y: 1015, s: 0.86, d: 8},
  {x: 2440, y: 1045, s: 1.12, d: 5},
  {x: 2515, y: 1010, s: 0.9, d: 13},
  {x: 2590, y: 1042, s: 1.0, d: 10},
  {x: 2660, y: 1008, s: 0.84, d: 18},
  {x: 2730, y: 1046, s: 1.1, d: 15},
  {x: 2800, y: 1012, s: 0.88, d: 22},
  {x: 2870, y: 1040, s: 1.0, d: 20},
  {x: 2930, y: 1010, s: 0.82, d: 27},
  {x: 2335, y: 970, s: 0.7, d: 12},
  {x: 2480, y: 962, s: 0.68, d: 19},
  {x: 2625, y: 956, s: 0.66, d: 24},
  {x: 2760, y: 950, s: 0.64, d: 30},
  {x: 2885, y: 946, s: 0.62, d: 33},
  {x: 2405, y: 966, s: 0.66, d: 25},
  {x: 2550, y: 960, s: 0.64, d: 29},
  {x: 2690, y: 954, s: 0.62, d: 34},
];

const RGB_P = [
  {x: 1700, y: 1040},
  {x: 2120, y: 1045},
  {x: 2520, y: 700},
  {x: 2960, y: 230},
];

const rgbBez = (t: number): {x: number; y: number} => {
  const u = 1 - t;
  const [p0, p1, p2, p3] = RGB_P;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

const RGB_ARC: {x: number; y: number; l: number}[] = (() => {
  const pts: {x: number; y: number; l: number}[] = [];
  let length = 0;
  let prev = rgbBez(0);
  pts.push({...prev, l: 0});
  for (let i = 1; i <= 120; i++) {
    const q = rgbBez(i / 120);
    length += Math.hypot(q.x - prev.x, q.y - prev.y);
    pts.push({x: q.x, y: q.y, l: length});
    prev = q;
  }
  return pts;
})();

const rgbPoint = (fraction: number): {x: number; y: number} => {
  const total = RGB_ARC[RGB_ARC.length - 1].l;
  const target = Math.max(0, Math.min(1, fraction)) * total;
  for (let i = 1; i < RGB_ARC.length; i++) {
    if (RGB_ARC[i].l >= target) {
      const span = RGB_ARC[i].l - RGB_ARC[i - 1].l || 1;
      const u = (target - RGB_ARC[i - 1].l) / span;
      return {
        x: RGB_ARC[i - 1].x + (RGB_ARC[i].x - RGB_ARC[i - 1].x) * u,
        y: RGB_ARC[i - 1].y + (RGB_ARC[i].y - RGB_ARC[i - 1].y) * u,
      };
    }
  }
  return RGB_ARC[RGB_ARC.length - 1];
};

/** Beat 3, step 1: order in which the crowd leaves. Indexes into RGB_CROWD. */
const GONE_ORDER = [7, 12, 2, 16, 9, 0, 14, 5, 11, 3, 17, 8, 1, 13, 6, 10, 15, 4];

/** Frames after beat 3 step 1 starts when the n-th person begins to leave. Each gap is 0.86x the last. */
const goneStart = (rank: number): number => {
  let t = 12;
  let gap = 18;
  for (let i = 0; i < rank; i++) {
    t += gap;
    gap *= 0.86;
  }
  return t;
};

/** How far RGB_CROWD[index] has left during beat 3 step 1: 0 present, 1 gone. Frame-only. */
const goneAmount = (frame: number, index: number): number => {
  const rank = GONE_ORDER.indexOf(index);
  const at = stepStart(2, 1) + goneStart(rank);
  const length = interpolate(rank, [0, GONE_ORDER.length - 1], [20, 10]);
  return interpolate(frame, [at, at + length], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
};

/** Share of the crowd that has left so far, 0..1. Drives the thermometer so it falls with the removals. */
const crowdGone = (frame: number): number =>
  RGB_CROWD.reduce((sum, _, index) => sum + goneAmount(frame, index), 0) /
  RGB_CROWD.length;

const RgbArrival: React.FC<{frame: number}> = ({frame}) => {
  const at = beatStart(1);
  if (frame < at || frame >= beatStart(3)) {
    return null;
  }
  const local = frame - at;
  // Beat 3 camera push: the curve slides up and left out of the close-up instead of cutting.
  const away = interpolate(frame, [beatStart(2), beatStart(2) + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const curveAt = stepStart(1, 1) - at;
  const crowdAt = stepStart(1, 2) - at;
  const drawn = interpolate(local, [curveAt + 4, curveAt + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const tip = rgbPoint(drawn);
  const [p0, p1, p2, p3] = RGB_P;
  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  return (
    <svg
      width={1}
      height={1}
      style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}
    >
      {RGB_CROWD.map((person, index) => {
        const t = interpolate(local, [crowdAt + person.d, crowdAt + person.d + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const gone = goneAmount(frame, index);
        if (gone >= 1) {
          return null;
        }
        return (
          <g
            key={`${person.x}-${person.y}`}
            transform={`translate(${person.x} ${person.y + (1 - t) * 26 + gone * 22}) scale(${person.s * (1 - 0.45 * gone)})`}
            opacity={t * (1 - gone)}
          >
            <circle cx={0} cy={-84} r={13} fill={INK} />
            <path
              d="M-23 -64 C-26 -40 -20 -12 -17 0 L17 0 C20 -12 26 -40 23 -64 C15 -73 0 -75 0 -75 C0 -75 -15 -73 -23 -64 Z"
              fill={INK}
            />
          </g>
        );
      })}
      {away < 1 ? (
        <g
          transform={`translate(${-1100 * away} ${-900 * away})`}
          opacity={interpolate(away, [0.5, 1], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          <path
            d={d}
            fill="none"
            stroke={CINNABAR}
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawn}
          />
          {drawn > 0 ? <circle cx={tip.x} cy={tip.y} r={10} fill={CINNABAR} /> : null}
        </g>
      ) : null}
    </svg>
  );
};

const CircleCards: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(3);
  // Beat 10 step 1: Build turns red and stays red into beat 11; the other cards fade to faint ink.
  const red = linear(frame, stepStart(9, 1) + 6, stepStart(9, 1) + 20, 0, 1);
  const dim = buildFocus(frame);
  const cards = [
    {n: "01", label: "Discover", at: CIRCLE.discover, delay: 40, rot: -2},
    {n: "02", label: "Learn", at: CIRCLE.learn, delay: 66, rot: 2},
    {n: "03", label: "Build", at: CIRCLE.build, delay: 92, rot: -1.5},
    {n: "04", label: "Success", at: CIRCLE.success, delay: 118, rot: 2.5},
  ];
  return (
    <>
      {cards.map((card) => (
        <IndexCard
          key={card.n}
          x={card.at.x}
          y={card.at.y}
          n={card.n}
          label={card.label}
          rot={card.rot}
          red={card.n === "03" ? red : 0}
          dim={card.n === "03" ? 0 : dim}
          frame={frame}
          fps={fps}
          at={at}
          delay={card.delay}
        />
      ))}
    </>
  );
};

const IndexCard: React.FC<{
  x: number;
  y: number;
  n: string;
  label: string;
  rot: number;
  red: number;
  dim?: number;
  frame: number;
  fps: number;
  at: number;
  delay: number;
}> = ({x, y, n, label, rot, red, dim = 0, frame, fps, at, delay}) => {
  const p = enter(frame, fps, at, delay);
  if (frame < at + delay) {
    return null;
  }
  const yOff = interpolate(p, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(p, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ink = red > 0.55 ? PAPER : INK;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 250,
        height: 148,
        transform: `translate(-50%, -50%) translateY(${yOff}px) scale(${scale}) rotate(${rot}deg)`,
        opacity: Math.min(1, Math.max(0, p)) * (1 - 0.72 * dim),
        background: CARD,
        border: `1px solid ${INK}`,
        boxShadow: "0 14px 28px rgba(26,26,26,0.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: CINNABAR,
          opacity: red,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -9,
          left: "50%",
          width: 58,
          height: 16,
          marginLeft: -29,
          background: "rgba(255,255,255,0.55)",
          transform: "rotate(-1.5deg)",
        }}
      />
      <div style={{position: "relative", padding: "26px 20px", color: ink}}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 13,
            letterSpacing: "0.16em",
          }}
        >
          {n}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 36,
            marginTop: 6,
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

/** Beat 4 journey circle: one circle through the four cards, drawn clockwise in four arcs. */
const JOURNEY_C = {x: 1520, y: 3180};
const JOURNEY_R = 482;
const JOURNEY_ARCS = [
  {from: -114.4, to: -65.6},
  {from: -17.6, to: 17.6},
  {from: 65.6, to: 114.4},
  {from: 162.4, to: 197.6},
];

const journeyPoint = (deg: number): {x: number; y: number} => {
  const a = (deg * Math.PI) / 180;
  return {x: JOURNEY_C.x + JOURNEY_R * Math.cos(a), y: JOURNEY_C.y + JOURNEY_R * Math.sin(a)};
};

const Arrows: React.FC<{frame: number}> = ({frame}) => {
  const at = beatStart(3);
  if (frame < at) {
    return null;
  }
  // Step 4 (Success): the arc back to Discover turns red and pulses once; it returns to ink in beat 5.
  const loopAt = stepStart(3, 4) + 40;
  const red =
    linear(frame, loopAt, loopAt + 10, 0, 1) *
    (1 - linear(frame, beatStart(4), beatStart(4) + 12, 0, 1));
  const pulse = Math.sin(Math.PI * linear(frame, loopAt, loopAt + 14, 0, 1));
  return (
    <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - 0.6 * buildFocus(frame)}}>
      {JOURNEY_ARCS.map((arc, i) => {
        const start = at + 50 + i * 26;
        const drawn = interpolate(frame, [start, start + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        });
        if (drawn <= 0) {
          return null;
        }
        const a = journeyPoint(arc.from);
        const b = journeyPoint(arc.to);
        const theta = (arc.to * Math.PI) / 180;
        const tx = -Math.sin(theta);
        const ty = Math.cos(theta);
        const nx = Math.cos(theta);
        const ny = Math.sin(theta);
        const isLoop = i === 3;
        const color = isLoop ? interpolateColors(red, [0, 1], [INK, CINNABAR]) : INK;
        const width = isLoop ? 4 + 2 * red + 5 * pulse : 4;
        const head = isLoop ? 1 + 0.35 * pulse : 1;
        const tip = {x: b.x + tx * 10 * head, y: b.y + ty * 10 * head};
        const base = {x: b.x - tx * 16 * head, y: b.y - ty * 16 * head};
        return (
          <g key={arc.from}>
            <path
              d={`M ${a.x} ${a.y} A ${JOURNEY_R} ${JOURNEY_R} 0 0 1 ${b.x} ${b.y}`}
              fill="none"
              stroke={color}
              strokeWidth={width}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
            <path
              d={`M ${tip.x} ${tip.y} L ${base.x + nx * 12 * head} ${base.y + ny * 12 * head} L ${base.x - nx * 12 * head} ${base.y - ny * 12 * head} Z`}
              fill={color}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              opacity={interpolate(drawn, [0.85, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          </g>
        );
      })}
    </svg>
  );
};

const JOURNEY_CARDS = [CIRCLE.discover, CIRCLE.learn, CIRCLE.build, CIRCLE.success];

const JOURNEY_NOTES = [
  {x: 740, y: 2890, tilt: -3, text: "Hear about CKB and get curious."},
  {x: 2320, y: 2890, tilt: 2.5, text: "Read the docs and understand how CKB works."},
  {x: 2320, y: 3490, tilt: -2, text: "Write scripts and ship a real app."},
  {x: 740, y: 3490, tilt: 3, text: "Users arrive, the project grows, and others discover CKB."},
];

/** Hand-drawn loop around a card, centered on 0,0. Slightly more than one turn, with a wobble. */
const JOURNEY_LOOP = (() => {
  const pts: string[] = [];
  for (let k = 0; k <= 48; k++) {
    const t = (k / 48) * 1.08;
    const a = -2.6 + t * Math.PI * 2;
    const f = 1 + 0.035 * Math.sin(3 * a + 1) + 0.025 * t;
    pts.push(`${(170 * f * Math.cos(a)).toFixed(1)} ${(110 * f * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
})();

/** Beat 4 steps 1-4: red loop on the focused card and a taped definition note that stays on the desk. */
const JourneyNotes: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const next = beatStart(4);
  if (frame < stepStart(3, 1) || frame >= next + 34) {
    return null;
  }
  const out = linear(frame, next, next + 16, 0, 1);
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - out}}>
        {JOURNEY_CARDS.map((card, i) => {
          const s = stepStart(3, i + 1);
          const end = stepStart(3, i + 2);
          const drawn = interpolate(frame, [s + 16, s + 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const fade = 1 - linear(frame, end, end + 12, 0, 1);
          if (drawn <= 0 || fade <= 0) {
            return null;
          }
          return (
            <path
              key={card.x * 10000 + card.y}
              transform={`translate(${card.x} ${card.y}) rotate(${i % 2 === 0 ? -4 : 3})`}
              d={JOURNEY_LOOP}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
              opacity={fade}
            />
          );
        })}
      </svg>
      {JOURNEY_NOTES.map((note, i) => {
        const at = stepStart(3, i + 1) + 28;
        if (frame < at) {
          return null;
        }
        // Glide into beat 5: each note slides off the desk, away from the circle's center, staggered.
        const driftAt = next + i * 3;
        const drift = interpolate(frame, [driftAt, driftAt + 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        if (drift >= 1) {
          return null;
        }
        const ox = note.x - JOURNEY_C.x;
        const oy = note.y - JOURNEY_C.y;
        const len = Math.hypot(ox, oy) || 1;
        const dx = (ox / len) * 720 * drift;
        const dy = (oy / len) * 720 * drift;
        const spin = (ox < 0 ? -1 : 1) * (oy < 0 ? -1 : 1) * 14 * drift;
        return (
          <div
            key={note.text}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: `${note.x}px ${note.y}px`,
              transform: `translate(${dx}px, ${dy}px) rotate(${spin}deg) scale(${1 + 0.06 * Math.sin(Math.PI * Math.min(1, drift * 1.6))})`,
              opacity: 1 - interpolate(drift, [0.55, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              filter: drift > 0 ? `drop-shadow(0 ${18 * drift}px ${24 * drift}px rgba(26,26,26,${0.12 * drift}))` : undefined,
            }}
          >
            <BigNote x={note.x} y={note.y} width={420} tilt={note.tilt} p={slam(frame, fps, at, 0)} size={40}>
              {note.text}
            </BigNote>
          </div>
        );
      })}
    </div>
  );
};




/** Beat 10 step 1 on: Discover, Learn, Success and the arcs fade to faint ink while Build is lit. Restores off-screen after the beat 11 glide. */
const buildFocus = (frame: number): number =>
  eased(frame, stepStart(9, 1), stepStart(9, 1) + 14) *
  (1 - linear(frame, beatStart(10) + 40, beatStart(10) + 52, 0, 1));

const GAP_SEAL = {x: 2620, y: 3300};
const GAP_ARROW_PTS = {a: {x: 2560, y: 3470}, c: {x: 2440, y: 3700}, b: {x: 2082, y: 3575}};
const GAP_ARROW = `M ${GAP_ARROW_PTS.a.x} ${GAP_ARROW_PTS.a.y} Q ${GAP_ARROW_PTS.c.x} ${GAP_ARROW_PTS.c.y} ${GAP_ARROW_PTS.b.x} ${GAP_ARROW_PTS.b.y}`;
const GAP_ARROW_HEAD = "M 2131 3566 L 2082 3575 L 2115 3613";
/** Baseline for "Fill the gap": a gentle arc under the lowest part of the arrow, read left to right. */
const GAP_TEXT_PATH = "M 2170 3672 Q 2340 3722 2520 3664";
const FOIL = "linear-gradient(135deg, #8E5A1C 0%, #E7C46C 20%, #B07A2A 38%, #F3DC94 54%, #C0612F 76%, #7C2A16 100%)";
const GOLD = "#9A6A1E";
const GLINT = "M 0 -16 L 3 -3 L 16 0 L 3 3 L 0 16 L -3 3 L -16 0 L -3 -3 Z";
const FLOURISH = "M 0 30 C 0 13 13 0 30 0 M 9 24 C 11 16 16 11 24 9";

/** Beat 10 step 2 landing: a short desk shake when the Cinnabar seal card slams down. */
const gapShake = (frame: number): { x: number; y: number } => {
  const t = frame - (stepStart(9, 2) + 10);
  if (t < 0 || t > 10) {
    return {x: 0, y: 0};
  }
  const k = 1 - t / 10;
  return {x: Math.sin(t * 3.1) * 7 * k, y: Math.cos(t * 3.9) * 5 * k};
};

/** Beat 10 steps 1-2 (world): red loop on Build with a gentle breathe, then a premium Cinnabar seal card and a thick arrow from it to Build. */
const GapBuild: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const s1 = stepStart(9, 1);
  const s2 = stepStart(9, 2);
  const next = beatStart(10);
  if (frame < s1 || frame >= next + 34) {
    return null;
  }
  const b = CIRCLE.build;
  const drawn = interpolate(frame, [s1 + 14, s1 + 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Breathe starts from rest and returns to rest every 48 frames, so both step holds sit near rest.
  const t = Math.max(0, frame + idleF - (s1 + 36));
  const breathe = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 48);
  // The loop stays on the Build card and fades in place, so the red card never looks abandoned mid-glide.
  const loopFade = 1 - linear(frame, next, next + 12, 0, 1);
  const cardOut = deskDrift(frame, next + 2, {x: 1, y: -0.3});
  const arrowOut = deskDrift(frame, next, {x: 1, y: 0.3});
  const at = s2 + 4;
  const arrow = interpolate(frame, [s2 + 30, s2 + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const head = linear(frame, s2 + 48, s2 + 54, 0, 1);
  const p = slam(frame, fps, at, 0);
  const scale = interpolate(p, [0, 1], [2.2, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  const write = interpolate(frame, [s2 + 36, s2 + 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const burst = Math.sin(Math.PI * linear(frame, at + 5, at + 30, 0, 1));
  const rays = linear(frame, at + 5, at + 26, 0, 1);
  // One sweep of light on landing, then a faint shimmer every 60 frames that is at rest on the step hold.
  const sweep = linear(frame, at + 10, at + 32, 0, 1);
  const idle = frame + idleF - (at + 44);
  const phase = idle >= 0 ? idle % 60 : 99;
  const shine =
    sweep > 0 && sweep < 1
      ? {pos: sweep, alpha: 0.8}
      : phase < 22
        ? {pos: phase / 22, alpha: 0.32}
        : null;
  const rule = linear(frame, at + 14, at + 30, 0, 1);
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <g opacity={loopFade}>
          <g transform={`translate(${b.x} ${b.y}) rotate(-4) scale(${1 + 0.035 * breathe})`}>
            <path
              d={JOURNEY_LOOP}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={22}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.16 * breathe * drawn}
            />
            <path
              d={JOURNEY_LOOP}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
          </g>
        </g>
        {arrow > 0 ? (
          <g transform={svgDrift(arrowOut, 2160, 3580)} opacity={arrowOut.opacity}>
            <path
              d={GAP_ARROW}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={14}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - arrow}
            />
            <path
              d={GAP_ARROW_HEAD}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={head}
            />
            <clipPath id="gapWrite">
              <rect x={2160} y={3560} width={380 * write} height={320} />
            </clipPath>
            <text
              clipPath="url(#gapWrite)"
              fontFamily={MARKER}
              fontWeight={800}
              fontSize={50}
              fill={CINNABAR}
              letterSpacing={1}
            >
              <textPath href="#gapTextPath" startOffset="50%" textAnchor="middle">
                Fill the gap
              </textPath>
            </text>
            <path id="gapTextPath" d={GAP_TEXT_PATH} fill="none" stroke="none" />
          </g>
        ) : null}
      </svg>
      {frame >= at ? (
        <div style={cssDrift(cardOut, GAP_SEAL.x, GAP_SEAL.y)}>
          <div
            style={{
              position: "absolute",
              left: GAP_SEAL.x,
              top: GAP_SEAL.y,
              width: 0,
              height: 0,
              transform: `scale(${scale}) rotate(-2.5deg)`,
              opacity: Math.min(1, Math.max(0, p * 2.5)),
            }}
          >
            {burst > 0 ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -460,
                    top: -330,
                    width: 920,
                    height: 660,
                    background: "radial-gradient(closest-side, rgba(231,196,108,0.55), rgba(217,56,30,0.12) 60%, transparent)",
                    opacity: burst,
                  }}
                />
                <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - rays}}>
                  {Array.from({length: 14}, (_, i) => {
                    const a = (i / 14) * Math.PI * 2 + 0.2;
                    const r0 = 290 + 70 * rays;
                    const r1 = r0 + 46;
                    return (
                      <line
                        key={i}
                        x1={r0 * Math.cos(a)}
                        y1={r0 * 0.7 * Math.sin(a)}
                        x2={r1 * Math.cos(a)}
                        y2={r1 * 0.7 * Math.sin(a)}
                        stroke={i % 2 === 0 ? CINNABAR : GOLD}
                        strokeWidth={7}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              </>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: -260,
                top: -140,
                width: 520,
                height: 280,
                padding: 7,
                boxSizing: "border-box",
                borderRadius: 10,
                background: FOIL,
                boxShadow: "0 26px 44px rgba(26,26,26,0.28), 0 0 0 1px rgba(26,26,26,0.45)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 6,
                  background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -4px 8px rgba(120,80,20,0.2), 0 0 0 1px rgba(90,60,20,0.35)",
                }}
              >
                <div style={{position: "absolute", inset: 12, border: `2px solid ${INK}`}} />
                <div style={{position: "absolute", inset: 18, border: `1px solid ${GOLD}`}} />
                <svg width={506} height={266} style={{position: "absolute", left: 0, top: 0}}>
                  {[
                    `translate(26 26)`,
                    `translate(480 26) scale(-1 1)`,
                    `translate(26 240) scale(1 -1)`,
                    `translate(480 240) scale(-1 -1)`,
                  ].map((tf) => (
                    <g key={tf} transform={tf}>
                      <path d={FLOURISH} fill="none" stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" />
                      <circle cx={4} cy={4} r={3} fill={CINNABAR} />
                    </g>
                  ))}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                  }}
                >
                  <svg width={300} height={20}>
                    <g opacity={rule}>
                      <line x1={150 - 140 * rule} y1={10} x2={140} y2={10} stroke={GOLD} strokeWidth={2} />
                      <line x1={160} y1={10} x2={150 + 140 * rule} y2={10} stroke={GOLD} strokeWidth={2} />
                      <path d="M 150 3 L 157 10 L 150 17 L 143 10 Z" fill={CINNABAR} />
                    </g>
                  </svg>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: 76,
                      lineHeight: 1,
                      letterSpacing: "0.08em",
                      marginRight: "-0.08em",
                      color: INK,
                      textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(90,60,20,0.28)",
                    }}
                  >
                    CINNABAR
                  </div>
                  <svg width={300} height={20}>
                    <g opacity={rule}>
                      <line x1={150 - 140 * rule} y1={10} x2={140} y2={10} stroke={GOLD} strokeWidth={2} />
                      <line x1={160} y1={10} x2={150 + 140 * rule} y2={10} stroke={GOLD} strokeWidth={2} />
                      <path d="M 150 3 L 157 10 L 150 17 L 143 10 Z" fill={CINNABAR} />
                    </g>
                  </svg>
                </div>
              </div>
              {shine ? (
                <div
                  style={{
                    position: "absolute",
                    top: -120,
                    bottom: -120,
                    left: `${-45 + 175 * shine.pos}%`,
                    width: "26%",
                    background: "linear-gradient(90deg, rgba(255,250,230,0), rgba(255,250,230,0.85), rgba(255,250,230,0))",
                    transform: "rotate(18deg)",
                    opacity: shine.alpha,
                    mixBlendMode: "screen",
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                position: "absolute",
                left: -70,
                top: -156,
                width: 140,
                height: 32,
                background: "rgba(255,255,255,0.62)",
                transform: "rotate(-3deg)",
                boxShadow: "0 1px 2px rgba(26,26,26,0.08)",
              }}
            />
            <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
              {[
                {x: 238, y: -122, d: 10},
                {x: -246, y: 120, d: 16},
                {x: 120, y: 130, d: 22},
              ].map((g) => {
                const tw = Math.sin(Math.PI * linear(frame, at + g.d, at + g.d + 16, 0, 1));
                return tw > 0 ? (
                  <path
                    key={g.d}
                    d={GLINT}
                    transform={`translate(${g.x} ${g.y}) scale(${0.6 + 0.8 * tw})`}
                    fill="#F3DC94"
                    stroke={GOLD}
                    strokeWidth={1.5}
                    opacity={tw}
                  />
                ) : null;
              })}
            </svg>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Stamp: React.FC<{
  text: string;
  x: number;
  y: number;
  frame: number;
  fps: number;
  at: number;
  delay: number;
  color?: string;
}> = ({text, x, y, frame, fps, at, delay, color = CINNABAR}) => {
  const p = slam(frame, fps, at, delay);
  if (frame < at + delay) {
    return null;
  }
  const scale = interpolate(p, [0, 1], [1.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(-8deg) scale(${scale})`,
        opacity: Math.min(0.9, Math.max(0, p * 3)),
        border: `6px solid ${color}`,
        color,
        fontFamily: SANS,
        fontWeight: 700,
        letterSpacing: "0.14em",
        fontSize: text.length > 6 ? 40 : 54,
        padding: "6px 14px 8px",
        whiteSpace: "nowrap",
        background: "transparent",
      }}
    >
      {text}
    </div>
  );
};

const ToolFile: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(10);
  const p = enter(frame, fps, at, 8);
  const close = 0;
  const fade = linear(frame, beatStart(15), beatStart(15) + 12, 1, 0);
  if (frame < at || fade <= 0) {
    return null;
  }
  const h = 490 - close * 270;
  return (
    <div
      style={{
        position: "absolute",
        left: 1520,
        top: 4900,
        width: 780,
        height: h,
        transform: "translate(-50%, -50%)",
        opacity: Math.min(1, Math.max(0, p)) * fade,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 32,
          top: -36,
          padding: "8px 16px 6px",
          background: FOLDER,
          border: `1px solid ${INK}`,
          borderBottom: "none",
          fontFamily: SANS,
          fontSize: 13,
          letterSpacing: "0.16em",
          opacity: 1 - close,
        }}
      >
        THE TOOL
      </div>
      {["01", "02", "03", "04"].map((label, i) => {
        const fan = enter(frame, fps, at, 16 + i * 5);
        const spread = [-20, -7, 7, 20][i];
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 150 + i * 130,
              top: -78,
              width: 92,
              padding: "10px 0 8px",
              textAlign: "center",
              background: CARD,
              border: `1px solid ${INK}`,
              fontFamily: SANS,
              letterSpacing: "0.12em",
              fontSize: 16,
              transform: `rotate(${spread * Math.min(1, Math.max(0, fan))}deg)`,
              transformOrigin: "bottom center",
              opacity: (1 - close) * Math.min(1, Math.max(0, fan)),
              boxShadow: "0 8px 16px rgba(26,26,26,0.08)",
            }}
          >
            {label}
          </div>
        );
      })}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: FOLDER,
          border: `1px solid ${INK}`,
          boxShadow: "0 18px 40px rgba(26,26,26,0.12)",
          position: "relative",
        }}
      >
      </div>
    </div>
  );
};

/** Beat 11: the Cinnabar crate. Bottom-center of the crate in world coords; its mouth is just above the front face. */
const CRATE = {x: 3500, y: 5270};
const CRATE_MOUTH = {x: 3500, y: 4990};
const FEATURES = [
  {title: "Contracts own their Tx Assemblers", lines: ["Contracts own", "their Tx Assemblers"], x: 2910, y: 4830, tilt: -5, spin: -1},
  {title: "AI skills for non-coders", lines: ["AI skills", "for non-coders"], x: 3300, y: 4560, tilt: -2, spin: -1},
  {title: "Inclusive verification tree", lines: ["Inclusive", "verification tree"], x: 3700, y: 4560, tilt: 3, spin: 1},
  {title: "First SSRI-integrated contract framework", lines: ["First SSRI-integrated", "contract framework"], x: 4090, y: 4830, tilt: 5, spin: 1},
];

/** Frame each feature leaves the crate (step k + 1, a few frames after the click). */
const popAt = (k: number): number => stepStart(10, k + 1) + 4;

/** A kick that rises over 4 frames and decays; zero before t = 0. */
const kickAt = (t: number): number => (t < 0 ? 0 : t < 4 ? t / 4 : Math.exp(-(t - 4) / 9));

/** A damped squash wobble for the crate after a pop; zero before t = 0. */
const squashAt = (t: number): number => (t < 0 ? 0 : Math.exp(-t / 7) * Math.sin(t * 0.55));

const FeatureIcon: React.FC<{k: number}> = ({k}) => {
  const ink = {stroke: INK, strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
  return (
    <svg width={180} height={108} viewBox="0 0 150 90" style={{display: "block", margin: "0 auto"}}>
      {k === 0 ? (
        <>
          <rect x={14} y={8} width={62} height={76} rx={4} fill={CARD} {...ink} />
          {[24, 36, 48, 60].map((y) => (
            <line key={y} x1={24} y1={y} x2={y === 60 ? 50 : 66} y2={y} stroke={INK} strokeWidth={2} opacity={0.55} />
          ))}
          <line x1={76} y1={52} x2={92} y2={52} stroke={INK} strokeWidth={3} />
          <circle cx={84} cy={52} r={3.5} fill={CINNABAR} />
          <rect x={92} y={22} width={46} height={62} rx={5} fill={INK} />
          <rect x={98} y={28} width={34} height={12} rx={2} fill={CINNABAR} />
          {[0, 1, 2].flatMap((i) =>
            [0, 1, 2].map((j) => <rect key={`${i}-${j}`} x={99 + i * 11.5} y={46 + j * 12} width={8} height={7} rx={1.5} fill={PAPER} />),
          )}
        </>
      ) : k === 1 ? (
        <>
          <circle cx={36} cy={26} r={13} fill={INK} />
          <path d="M 14 86 Q 14 48 36 45 Q 58 48 58 86 Z" fill={INK} />
          <rect x={72} y={6} width={66} height={38} rx={10} fill={CARD} {...ink} />
          <path d="M 84 44 L 78 56 L 96 44" fill={CARD} {...ink} />
          {[92, 105, 118].map((x) => (
            <circle key={x} cx={x} cy={25} r={3.5} fill={INK} />
          ))}
          <line x1={62} y1={84} x2={106} y2={64} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          {[-60, -20, 20, 60, 100].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={112 + 7 * Math.cos(a)}
                y1={61 - 7 * Math.sin(a)}
                x2={112 + 15 * Math.cos(a)}
                y2={61 - 15 * Math.sin(a)}
                stroke={CINNABAR}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
        </>
      ) : k === 2 ? (
        <>
          {[
            [75, 12, 40, 42],
            [75, 12, 110, 42],
            [40, 42, 22, 72],
            [40, 42, 58, 72],
            [110, 42, 92, 72],
            [110, 42, 128, 72],
          ].map(([x1, y1, x2, y2]) => (
            <line key={`${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2.5} />
          ))}
          <circle cx={75} cy={12} r={7} fill={INK} />
          <circle cx={40} cy={42} r={6} fill={INK} />
          <circle cx={110} cy={42} r={6} fill={INK} />
          {[22, 58, 92, 128].map((x) => (
            <g key={x}>
              <circle cx={x} cy={74} r={10} fill={CARD} {...ink} />
              <path d={`M ${x - 5} ${74} L ${x - 1} ${78} L ${x + 5} ${70}`} fill="none" stroke={CINNABAR} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </>
      ) : (
        <>
          {[0, 1, 2].flatMap((i) =>
            [0, 1].map((j) => <rect key={`${i}-${j}`} x={10 + i * 24} y={20 + j * 24} width={24} height={24} fill="none" {...ink} />),
          )}
          <line x1={10} y1={20} x2={34} y2={44} stroke={INK} strokeWidth={1.8} opacity={0.6} />
          <line x1={58} y1={44} x2={82} y2={68} stroke={INK} strokeWidth={1.8} opacity={0.6} />
          <line x1={82} y1={44} x2={96} y2={44} stroke={INK} strokeWidth={3} />
          <rect x={96} y={34} width={22} height={20} rx={3} fill={INK} />
          <line x1={118} y1={39} x2={130} y2={39} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <line x1={118} y1={49} x2={130} y2={49} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <line x1={107} y1={54} x2={107} y2={64} stroke={INK} strokeWidth={1.5} />
          <rect x={88} y={64} width={40} height={18} rx={3} fill={CINNABAR} />
          <text x={108} y={77} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={11} fill={PAPER} letterSpacing={1}>
            SSRI
          </text>
        </>
      )}
    </svg>
  );
};

/** Beat 11 (world): a crate tagged CINNABAR; each click kicks the lid and one feature card springs out to its slot. */
const CinnabarBox: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = beatStart(10);
  const next = beatStart(11);
  if (frame < at || frame >= next + 34) {
    return null;
  }
  const drop = slam(frame, fps, at, 12);
  if (frame < at + 12) {
    return null;
  }
  const kicks = FEATURES.reduce((sum, _, k) => sum + kickAt(frame - popAt(k)), 0);
  const squash = FEATURES.reduce((sum, _, k) => sum + squashAt(frame - popAt(k)), 0);
  const breathe = Math.sin(((frame + idleF - at) * 2 * Math.PI) / 60);
  const lid = 10 + 1.5 * breathe + 18 * Math.min(1, kicks);
  const sx = 1 + 0.07 * squash;
  const sy = 1 - 0.12 * squash + 0.006 * breathe;
  const boxOut = deskDrift(frame, next, {x: 1, y: 0.35});
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <div style={cssDrift(boxOut, CRATE.x, CRATE.y - 150)}>
        <div
          style={{
            position: "absolute",
            left: CRATE.x - 300,
            top: CRATE.y - 420,
            width: 600,
            height: 420,
            transformOrigin: "50% 100%",
            transform: `translateY(${(1 - Math.min(1, drop)) * -140}px) scale(${sx}, ${sy})`,
            opacity: Math.min(1, Math.max(0, drop * 2.5)),
          }}
        >
          <svg width={600} height={420} viewBox="-300 -420 600 420" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            <ellipse cx={0} cy={2} rx={290} ry={16} fill={INK} opacity={0.12} />
            <path d="M -260 -260 L 260 -260 L 236 -296 L -236 -296 Z" fill={INK} opacity={0.9} />
            <rect x={-260} y={-260} width={520} height={260} fill={FOLDER} stroke={INK} strokeWidth={3} />
            {[-173, -87].map((y) => (
              <line key={y} x1={-258} y1={y} x2={258} y2={y} stroke={INK} strokeWidth={2} opacity={0.3} />
            ))}
            {[-212, -40, 128].map((x) => (
              <line key={x} x1={x} y1={-258} x2={x + 6} y2={-2} stroke={INK} strokeWidth={1.2} opacity={0.18} />
            ))}
            {[
              [-260, -260],
              [244, -260],
              [-260, -44],
              [244, -44],
            ].map(([x, y]) => (
              <rect key={`${x}${y}`} x={x} y={y} width={16} height={44} fill={INK} opacity={0.85} />
            ))}
            <g transform={`translate(240 -296) rotate(${lid})`}>
              <rect x={-500} y={-30} width={522} height={30} fill={FOLDER} stroke={INK} strokeWidth={3} />
              <line x1={-496} y1={-15} x2={18} y2={-15} stroke={INK} strokeWidth={1.5} opacity={0.3} />
              <circle cx={0} cy={-2} r={5} fill={INK} />
            </g>
          </svg>
          <div
            style={{
              position: "absolute",
              left: 300 - 180,
              top: 420 - 130 - 52,
              width: 360,
              height: 104,
              padding: 5,
              boxSizing: "border-box",
              borderRadius: 6,
              background: FOIL,
              boxShadow: "0 6px 12px rgba(26,26,26,0.2), 0 0 0 1px rgba(26,26,26,0.45)",
              transform: "rotate(-1.5deg)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(120,80,20,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 52,
                letterSpacing: "0.08em",
                color: INK,
                textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(90,60,20,0.28)",
              }}
            >
              <span style={{marginRight: "-0.08em"}}>CINNABAR</span>
            </div>
          </div>
        </div>
        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          {FEATURES.map((_, k) => {
            const q = linear(frame, popAt(k), popAt(k) + 14, 0, 1);
            if (q <= 0 || q >= 1) {
              return null;
            }
            return (
              <g key={k} opacity={1 - q}>
                {[-165, -140, -115, -65, -40, -15].map((deg, i) => {
                  const a = (deg * Math.PI) / 180;
                  const r0 = 70 + 110 * q;
                  const r1 = r0 + 34;
                  return (
                    <line
                      key={deg}
                      x1={CRATE_MOUTH.x + r0 * 1.6 * Math.cos(a)}
                      y1={CRATE_MOUTH.y + r0 * Math.sin(a)}
                      x2={CRATE_MOUTH.x + r1 * 1.6 * Math.cos(a)}
                      y2={CRATE_MOUTH.y + r1 * Math.sin(a)}
                      stroke={i % 2 === 0 ? INK : CINNABAR}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  );
                })}
                {[-170, 170].map((dx) => (
                  <circle
                    key={dx}
                    cx={CRATE_MOUTH.x + dx * (1 + 0.3 * q)}
                    cy={CRATE_MOUTH.y + 4 - 20 * q}
                    r={18 + 22 * q}
                    fill="none"
                    stroke={INK}
                    strokeWidth={3}
                    opacity={0.5}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {FEATURES.map((f, k) => {
        const a = popAt(k);
        if (frame < a) {
          return null;
        }
        const t = linear(frame, a, a + 20, 0, 1);
        const te = 1 - (1 - t) * (1 - t);
        const x = CRATE_MOUTH.x + (f.x - CRATE_MOUTH.x) * te;
        const y = CRATE_MOUTH.y + (f.y - CRATE_MOUTH.y) * te - (k === 0 ? 240 : k === 3 ? 120 : 150) * Math.sin(Math.PI * t);
        const land = a + 20;
        const p = slam(frame, fps, land, 0);
        const landed = frame >= land;
        const stx = landed ? interpolate(p, [0, 1], [1.14, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"}) : 1;
        const sty = landed ? interpolate(p, [0, 1], [0.86, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"}) : 1;
        const sc = 0.25 + 0.75 * te;
        const rot = f.tilt + (1 - te) * f.spin * 40;
        const newest = k === FEATURES.length - 1 || frame < popAt(k + 1);
        const ring = landed && newest ? 0.4 + 0.6 * Math.exp(-(frame - land) / 16) : 0;
        const out = deskDrift(frame, next + 2 + k * 2, {x: f.x - CRATE.x, y: f.y - CRATE.y - 200});
        // Idle float: zero at idle 0, so the settled frame is unchanged.
        const float = landed ? 3.5 * (Math.sin((2 * Math.PI * idleF) / 130 + k * 1.7) - Math.sin(k * 1.7)) : 0;
        return (
          <div key={f.title} style={k === 0 && frame >= next ? seedStyle(frame, next, f) : cssDrift(out, f.x, f.y)}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: y + float,
                width: 360,
                padding: "30px 16px 22px",
                boxSizing: "border-box",
                background: CARD,
                border: `2px solid ${INK}`,
                boxShadow: `0 16px 28px rgba(26,26,26,0.18), 0 0 ${34 * ring}px rgba(217,56,30,${0.45 * ring})`,
                transformOrigin: "50% 100%",
                transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sc * stx}, ${sc * sty})`,
                opacity: Math.min(1, t * 4),
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  width: 110,
                  height: 28,
                  marginLeft: -55,
                  background: "rgba(255,255,255,0.62)",
                  transform: `rotate(${k % 2 === 0 ? -3 : 2}deg)`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 16,
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "0.14em",
                  color: CINNABAR,
                }}
              >
                {`0${k + 1}`}
              </div>
              {ring > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: -11,
                    border: `4px solid ${CINNABAR}`,
                    borderRadius: 10,
                    opacity: ring,
                  }}
                />
              ) : null}
              <FeatureIcon k={k} />
              <div
                style={{
                  marginTop: 10,
                  fontFamily: MARKER,
                  fontWeight: 800,
                  fontSize: k === 3 ? 29 : 33,
                  lineHeight: 1.05,
                  color: INK,
                }}
              >
                {f.lines.map((line) => (
                  <div key={line} style={{whiteSpace: "nowrap"}}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Beat 12: contracts own their Tx Assemblers. World coords near the beat camera (wide for the long bridge). */
const CALC_CONTRACT = {x: 380, y: 6330, w: 380, h: 300};
const CALC_ASM = {x: 2640, y: 6330, w: 400, h: 280};
/** Merged unit: contract + Tx Assembler side by side, centered on the bridge's middle. */
const CALC_MID = 1500;
const CALC_JOIN_CONTRACT = CALC_MID - (CALC_CONTRACT.w + CALC_ASM.w) / 2 + CALC_CONTRACT.w / 2;
const CALC_JOIN = {contract: CALC_JOIN_CONTRACT, asm: CALC_JOIN_CONTRACT + CALC_CONTRACT.w / 2 + CALC_ASM.w / 2};
const CALC_FIGURE = {x: 2890, y: 6470};
/** Bridge: one flat ink deck from the contract's right edge to the assembler's left edge, on two plain posts. n = frames the deck takes to draw. */
const BR = {a: 575, b: 2435, deck: 6330, n: 46};
const BR_Y = BR.deck + 11;
const BR_POSTS = [1100, 1900];
/** The missing span of the deck. Symmetric about CALC_MID so the right end is a mirror of the left. */
const BR_GAP = { l: 1280, r: 1720 };
/** Step 6: hand-drawn loop (page 4/10 style, slightly over one turn) around the merged pair, and its Monorepo tag. */
const MONO_LOOP_PTS = Array.from({length: 97}, (_, k) => {
  const t = (k / 96) * 1.08;
  const a = -2.6 + t * Math.PI * 2;
  const f = 1 + 0.035 * Math.sin(3 * a + 1) + 0.012 * Math.sin(7 * a) + 0.025 * t;
  return {x: CALC_MID + 600 * f * Math.cos(a), y: CALC_CONTRACT.y + 262 * f * Math.sin(a)};
});
const MONO_LOOP = `M ${MONO_LOOP_PTS.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}`;
const MONO_LOOP_CUM = MONO_LOOP_PTS.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p.x - MONO_LOOP_PTS[i - 1].x, p.y - MONO_LOOP_PTS[i - 1].y));
  return acc;
}, []);
const monoNib = (u: number): {x: number; y: number} => {
  const target = u * MONO_LOOP_CUM[MONO_LOOP_CUM.length - 1];
  let i = 1;
  while (i < MONO_LOOP_CUM.length - 1 && MONO_LOOP_CUM[i] < target) {
    i++;
  }
  const span = MONO_LOOP_CUM[i] - MONO_LOOP_CUM[i - 1] || 1;
  const r = Math.min(1, Math.max(0, (target - MONO_LOOP_CUM[i - 1]) / span));
  const p = MONO_LOOP_PTS[i - 1];
  const q = MONO_LOOP_PTS[i];
  return {x: p.x + (q.x - p.x) * r, y: p.y + (q.y - p.y) * r};
};
const MONO_TAG = {x: 2210, y: 6655};
const MONO_TIE = "M 1948 6518 Q 1990 6585 2040 6618";
/** Page 11's first feature card flies to the beat 12 headline spot, where it hands over to the headline. */
const SEED_TO = {x: 629, y: 7110};

const seedStyle = (frame: number, next: number, f: {x: number; y: number}): React.CSSProperties => {
  const u = eased(frame, next, next + 30);
  const dx = (SEED_TO.x - f.x) * u;
  const dy = (SEED_TO.y - f.y) * u - 260 * Math.sin(Math.PI * u);
  return {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: `${f.x}px ${f.y}px`,
    transform: `translate(${dx}px, ${dy}px) scale(${1 - 0.35 * u}) rotate(${4 * u}deg)`,
    opacity: 1 - linear(frame, next + 22, next + 34, 0, 1),
  };
};

const CalcCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  scaleX?: number;
  children: React.ReactNode;
}> = ({x, y, w, h, rot, scaleX = 1, children}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: "border-box",
      padding: "28px 28px",
      background: CARD,
      border: `2px solid ${INK}`,
      boxShadow: "0 16px 30px rgba(26,26,26,0.14)",
      transform: `translate(-50%, -50%) rotate(${rot}deg) scaleX(${scaleX})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -14,
        left: "50%",
        width: 120,
        height: 28,
        marginLeft: -60,
        background: "rgba(255,255,255,0.62)",
        transform: "rotate(-2deg)",
      }}
    />
    {children}
  </div>
);

const QUIET_INK = "#6E5E4A";

/** Beat 12 (world): contract and its assembler far apart across a long bridge marked GAP; Cinnabar smashes the bridge and merges them. */
const TxAssemblers: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const s = (k: number) => stepStart(11, k);
  const next = beatStart(12);
  if (frame < s(1) || frame >= next + 34) {
    return null;
  }
  const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
  const s3 = s(3);
  const s5 = s(5);
  // Step 5: Cinnabar swings in like a wrecking ball, the bridge collapses, the two halves slide together.
  const impactAt = s5 + 22;
  const it = frame - impactAt;
  const shake = it >= 0 ? 12 * Math.exp(-it / 5) * Math.sin(it * 2.7) : 0;
  const fallAll = it >= 0 ? it : -1;
  const slide = interpolate(frame, [s5 + 52, s5 + 76], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const snapAt = s5 + 76;
  const st = frame - snapAt;
  const snapShake = st >= 0 ? 9 * Math.exp(-st / 5) * Math.sin(st * 2.6) : 0;
  const bump = st >= 0 ? Math.exp(-st / 6) * Math.sin(Math.min(Math.PI, st * 0.5)) : 0;
  const flash = st >= 0 ? Math.exp(-st / 10) : 0;
  // Once merged, the unit breathes gently (zero at idle 0).
  const unitScaleX = 1 + 0.035 * bump + (slide >= 1 ? 0.014 * Math.sin((2 * Math.PI * idleF) / 96) : 0);
  const cX = CALC_CONTRACT.x + (CALC_JOIN.contract - CALC_CONTRACT.x) * slide - snapShake;
  const aX = CALC_ASM.x + (CALC_JOIN.asm - CALC_ASM.x) * slide + snapShake;
  const relabel = linear(frame, snapAt + 4, snapAt + 16, 0, 1);
  const checkP = slam(frame, fps, snapAt, 12);
  const plateP = slam(frame, fps, snapAt, 22);
  const unitOut = deskDrift(frame, next, {x: -1, y: -0.45});
  // Step 6: a red pen loops the merged pair, then the Monorepo tag drops in on a short pen line.
  const s6 = s(6);
  const loopDrawn = interpolate(frame, [s6 + 10, s6 + 42], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const nib = monoNib(loopDrawn);
  const nibOn = loopDrawn > 0 && loopDrawn < 1 ? 1 : 1 - linear(frame, s6 + 42, s6 + 50, 0, 1);
  const tie = interpolate(frame, [s6 + 42, s6 + 50], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const monoTagP = slam(frame, fps, s6, 48);
  // Step 1-2 cards and notes.
  const cP = slam(frame, fps, s(1), 4);
  const aP = slam(frame, fps, s(2), 4);
  const figIn = linear(frame, s(2) + 40, s(2) + 52, 0, 1);
  // The client tag pops after the Tx Assembler card lands, then sways gently (period 60, zero at each 60-frame mark).
  const clientP = slam(frame, fps, s(2), 16);
  const clientIdle = Math.max(0, frame + idleF - (s(2) + 40));
  const clientWiggle = 1.6 * Math.sin((2 * Math.PI * clientIdle) / 60) * (1 - Math.exp(-clientIdle / 20));
  const n4 = slam(frame, fps, s(4), 4);
  const n4Out = deskDrift(frame, s5, {x: 0.2, y: -1});
  const walk = interpolate(frame, [s5 + 2, s5 + 40], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const working = 1 - linear(frame, s5, s5 + 8, 0, 1);
  const bob = Math.sin(((frame + idleF - s(2)) * 2 * Math.PI) / 26);
  const hands = working * (0.5 + 0.5 * Math.sin(((frame + idleF - s(2)) * 2 * Math.PI) / 18));
  const figX = CALC_FIGURE.x + 260 * walk;
  // Step 3: the bridge builds plank by plank, then piers, towers, cables, measure, tag.
  const built = linear(frame, s3 + 4, s3 + 4 + BR.n, 0, 1);
  // Both deck halves grow from their outer ends toward each other and stop short, leaving the gap.
  const leftEnd = BR.a + (BR_GAP.l - BR.a) * built;
  const rightStart = BR.b - (BR.b - BR_GAP.r) * built;
  const ends = linear(frame, s3 + 4 + BR.n, s3 + 4 + BR.n + 14, 0, 1);
  const posts = interpolate(
    frame,
    [s3 + 4 + BR.n, s3 + 4 + BR.n + 12],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) },
  );
  const tagP = slam(frame, fps, s3 + 70, 0);
  const debris = fallAll >= 0 ? {dy: 0.9 * fallAll * fallAll, op: 1 - linear(fallAll, 0, 24, 0, 1)} : {dy: 0, op: 1};
  const burst = it >= 0 ? linear(frame, impactAt, impactAt + 16, 0, 1) : 0;
  // Wrecking plate.
  const swingIn = linear(frame, s5 + 6, impactAt, 0, 1);
  const theta = it < 0 ? -95 * (1 - swingIn * swingIn) : 16 * Math.exp(-it / 9) * Math.sin(it * 0.4);
  const rope = 1050 - 820 * eased(frame, s5 + 44, s5 + 66);
  const plateFade = 1 - linear(frame, s5 + 58, s5 + 68, 0, 1);
  const bridgeVisible = frame >= s3 + 4 && (it < 0 || debris.op > 0);
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      {bridgeVisible ? (
        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <g transform={`translate(${shake} 0)`}>
            {BR_POSTS.map((x, i) => {
              const sway = it >= 0 ? (i === 0 ? -1 : 1) * it * 0.8 : 0;
              return (
                <line
                  key={x}
                  x1={x}
                  y1={BR_Y + 6}
                  x2={x}
                  y2={BR_Y + 6 + 170 * posts}
                  stroke={INK}
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={debris.op * Math.min(1, posts * 20)}
                  transform={`translate(0 ${debris.dy * 0.9}) rotate(${sway} ${x} ${BR_Y + 6})`}
                />
              );
            })}
            {/* Static bridge with a missing span: two deck halves that stop short of each other, ragged ends, hanging rail ends, a dark void below.
                Nothing here moves while it holds; on impact the halves tip into the void and fade. */}
            {(() => {
              const gl = BR_GAP.l;
              const gr = BR_GAP.r;
              const half = (x: number) => (x < CALC_MID ? 0 : 1);
              const sideTf = (side: number) =>
                `translate(0 ${debris.dy * 0.5}) rotate(${it >= 0 ? (side === 0 ? 1 : -1) * 0.07 * it * it : 0} ${side === 0 ? BR.a : BR.b} ${BR_Y})`;
              const top = BR_Y - 7;
              const railTop = top - 64;
              const reach = (x: number) =>
                half(x) === 0
                  ? Math.min(1, Math.max(0, (leftEnd - x) / 80))
                  : Math.min(1, Math.max(0, (x - rightStart) / 80));
              const baluster = (x: number) => (
                <g key={`b${x}`} transform={sideTf(half(x))} opacity={debris.op * reach(x)}>
                  <line x1={x} y1={top} x2={x} y2={railTop} stroke={INK} strokeWidth={4} strokeLinecap="round" />
                </g>
              );
              const railSeg = (side: number, x0: number, x1: number) => {
                const a0 = side === 0 ? x0 : Math.max(x0, rightStart);
                const a1 = side === 0 ? Math.min(x1, leftEnd) : x1;
                if (a1 <= a0) {
                  return null;
                }
                return (
                  <g
                    key={`r${side}`}
                    transform={sideTf(side)}
                    opacity={debris.op}
                  >
                    <line
                      x1={a0}
                      y1={railTop}
                      x2={a1}
                      y2={railTop}
                      stroke={INK}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  </g>
                );
              };
              const lamp = (x: number, dir: number) => (
                <g key={`l${x}`} transform={sideTf(half(x))} opacity={debris.op * posts}>
                  <g transform={`translate(${x} ${top}) scale(1 ${posts})`}>
                    <line x1={0} y1={0} x2={0} y2={-270} stroke={INK} strokeWidth={9} strokeLinecap="round" />
                    <path d={`M 0 -270 Q 0 -302 ${dir * 46} -302`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
                    <circle cx={dir * 54} cy={-282} r={30} fill={STICKY} opacity={0.5} />
                    <path d={`M ${dir * 34} -304 L ${dir * 74} -304 L ${dir * 66} -280 L ${dir * 42} -280 Z`} fill={INK} />
                  </g>
                </g>
              );
              const chevrons = [700, 850, 1000, 1150, 1850, 2000, 2150, 2300];
              // Broken end of the left half; the right half is its mirror about the gap's centre.
              const brokenEnd = (side: number) => (
                <g
                  key={`e${side}`}
                  transform={sideTf(side)}
                  opacity={debris.op * ends}
                >
                  <g
                    transform={
                      side === 0
                        ? undefined
                        : `translate(${2 * CALC_MID} 0) scale(-1 1)`
                    }
                  >
                    <path
                      d={`M ${gl - 44} ${top} L ${gl + 2} ${top} L ${gl - 10} ${BR_Y + 8} L ${gl + 18} ${BR_Y + 18} L ${gl - 8} ${BR_Y + 34} L ${gl - 14} ${BR_Y + 74} L ${gl - 38} ${BR_Y + 30} L ${gl - 56} ${BR_Y + 10} Z`}
                      fill={INK}
                    />
                    <path
                      d={`M ${gl + 2} ${BR_Y - 3} L ${gl + 38} ${BR_Y - 17}`}
                      stroke={INK}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${gl + 8} ${BR_Y + 6} L ${gl + 34} ${BR_Y + 22}`}
                      stroke={INK}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${gl - 34} ${railTop} Q ${gl - 14} ${railTop + 2} ${gl - 8} ${railTop + 70}`}
                      fill="none"
                      stroke={INK}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${gl - 8} ${railTop + 70} L ${gl - 2} ${railTop + 100}`}
                      fill="none"
                      stroke={INK}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              );
              const gate = it >= 0 ? Math.max(0, 1 - it / 6) : 1;
              return (
                <>
                  <defs>
                    <linearGradient id="brVoid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={INK} stopOpacity={0.92} />
                      <stop offset="0.55" stopColor={INK} stopOpacity={0.5} />
                      <stop offset="1" stopColor={INK} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {ends > 0 ? (
                    <g opacity={debris.op * ends}>
                      <path
                        d={`M ${gl + 6} ${BR_Y + 9} L ${gr - 6} ${BR_Y + 9} L ${gr - 36} ${BR_Y + 110} L ${gr - 14} ${BR_Y + 190} L ${CALC_MID + 70} ${BR_Y + 330} L ${CALC_MID - 30} ${BR_Y + 300} L ${gl + 18} ${BR_Y + 200} L ${gl + 44} ${BR_Y + 100} Z`}
                        fill="url(#brVoid)"
                      />
                      <rect
                        x={gl + 22}
                        y={top}
                        width={gr - gl - 44}
                        height={14}
                        fill="none"
                        stroke={INK}
                        strokeWidth={3}
                        strokeDasharray="12 10"
                        opacity={0.45 * gate}
                      />
                      <line
                        x1={gl + 40}
                        y1={railTop}
                        x2={gr - 40}
                        y2={railTop}
                        stroke={INK}
                        strokeWidth={3}
                        strokeDasharray="10 12"
                        opacity={0.28 * gate}
                      />
                    </g>
                  ) : null}
                  {[0, 1].map((side) => {
                    const x0 = side === 0 ? BR.a : rightStart;
                    const x1 = side === 0 ? leftEnd : BR.b;
                    if (x1 <= x0) {
                      return null;
                    }
                    return (
                      <line
                        key={`deck${side}`}
                        x1={x0}
                        y1={BR_Y}
                        x2={x1}
                        y2={BR_Y}
                        stroke={INK}
                        strokeWidth={14}
                        strokeLinecap="butt"
                        opacity={debris.op}
                        transform={sideTf(side)}
                      />
                    );
                  })}
                  {ends > 0 ? [0, 1].map(brokenEnd) : null}
                  {Array.from({ length: 10 }, (_, k) => BR.a + 36 + k * 70).map(
                    baluster,
                  )}
                  {Array.from({ length: 10 }, (_, k) => BR.b - 36 - k * 70).map(
                    baluster,
                  )}
                  {railSeg(0, BR.a + 36, gl - 34)}
                  {railSeg(1, gr + 34, BR.b - 36)}
                  {lamp(800, 1)}
                  {lamp(2200, -1)}
                  {chevrons.map((x) => (
                    <g key={`c${x}`} transform={sideTf(half(x))} opacity={debris.op * reach(x) * 0.8}>
                      <path d={`M ${x - 12} ${BR_Y + 28} L ${x + 8} ${BR_Y + 40} L ${x - 12} ${BR_Y + 52}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  ))}
                </>
              );
            })()}
          </g>
        </svg>
      ) : null}
      {frame >= s3 + 70 && (it < 0 || debris.op > 0) ? (
        <div
          style={{
            position: "absolute",
            left: CALC_MID + shake,
            top: BR_Y - 190 + (it >= 0 ? 1.2 * it * it : 0),
            width: 0,
            height: 0,
            transform: `rotate(${it >= 0 ? it * 9 : 0}deg)`,
            opacity: it >= 0 ? debris.op : 1,
          }}
        >
          <svg
            width={1}
            height={1}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "visible",
            }}
          >
            <g opacity={linear(frame, s3 + 80, s3 + 84, 0, 1)}>
              <path
                d="M 0 40 L 0 176"
                fill="none"
                stroke={CINNABAR}
                strokeWidth={9}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - linear(frame, s3 + 80, s3 + 98, 0, 1)}
              />
              <path
                d="M -24 146 L 0 180 L 24 146"
                fill="none"
                stroke={CINNABAR}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={linear(frame, s3 + 94, s3 + 100, 0, 1)}
              />
            </g>
          </svg>
          <div
            style={{
              position: "absolute",
              left: -80,
              top: -35,
              width: 160,
              height: 70,
              boxSizing: "border-box",
              background: PAPER,
              border: `5px solid ${CINNABAR}`,
              color: CINNABAR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 46,
              letterSpacing: "0.16em",
              transform: `scale(${interpolate(tagP, [0, 1], [1.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "extend" })}) rotate(-4deg)`,
              transformOrigin: "50% 100%",
              opacity: Math.min(1, Math.max(0, tagP * 3)),
              boxShadow: "0 8px 14px rgba(26,26,26,0.15)",
            }}
          >
            <span style={{marginRight: "-0.16em"}}>GAP</span>
          </div>
        </div>
      ) : null}
      {burst > 0 && burst < 1 ? (
        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - burst}}>
          {Array.from({length: 12}, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r0 = 120 + 160 * burst;
            return (
              <line
                key={i}
                x1={CALC_MID + r0 * Math.cos(a)}
                y1={BR.deck - 40 + r0 * 0.6 * Math.sin(a)}
                x2={CALC_MID + (r0 + 60) * Math.cos(a)}
                y2={BR.deck - 40 + (r0 + 60) * 0.6 * Math.sin(a)}
                stroke={i % 2 === 0 ? CINNABAR : INK}
                strokeWidth={9}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      ) : null}
      {frame >= s(1) + 4 ? (
        <div style={cssDrift(unitOut, CALC_CONTRACT.x, CALC_CONTRACT.y)}>
          <div style={{opacity: Math.min(1, Math.max(0, cP * 2.5))}}>
            <CalcCard x={cX} y={CALC_CONTRACT.y - (1 - Math.min(1, cP)) * 50} w={CALC_CONTRACT.w} h={CALC_CONTRACT.h} rot={-1.5 * (1 - slide)} scaleX={unitScaleX}>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: INK, letterSpacing: "-0.02em"}}>Contract</div>
              {[250, 300, 210, 280, 170].map((w, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: i === 0 ? 24 : 16,
                    marginLeft: i % 2 === 1 ? 26 : 0,
                    width: w - (i % 2 === 1 ? 26 : 0),
                    height: 10,
                    borderRadius: 5,
                    background: INK,
                    opacity: 0.55,
                  }}
                />
              ))}
            </CalcCard>
          </div>
        </div>
      ) : null}
      {frame >= s(2) + 4 ? (
        <div style={cssDrift(unitOut, CALC_CONTRACT.x, CALC_CONTRACT.y)}>
          <div style={{opacity: Math.min(1, Math.max(0, aP * 2.5))}}>
            <CalcCard x={aX} y={CALC_ASM.y - (1 - Math.min(1, aP)) * 50} w={CALC_ASM.w} h={CALC_ASM.h} rot={1.5 * (1 - slide)} scaleX={unitScaleX}>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: interpolateColors(relabel, [0, 1], [INK, CINNABAR]), letterSpacing: "-0.02em", lineHeight: "44px", height: 44}}>
                Tx Assembler
              </div>
              <svg width={340} height={150} viewBox="0 0 340 150" style={{display: "block", marginTop: 18}}>
                {[0, 1, 2].map((i) => (
                  <rect key={`i${i}`} x={10} y={12 + i * 44} width={80} height={30} rx={4} fill="none" stroke={INK} strokeWidth={3} />
                ))}
                <path d="M 110 72 L 210 72" stroke={INK} strokeWidth={4} strokeLinecap="round" />
                <path d="M 196 60 L 212 72 L 196 84" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                {[0, 1].map((i) => (
                  <rect key={`o${i}`} x={232} y={34 + i * 44} width={90} height={30} rx={4} fill={i === 0 ? INK : "none"} stroke={INK} strokeWidth={3} opacity={i === 0 ? 0.85 : 1} />
                ))}
              </svg>
            </CalcCard>
            {slide <= 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: CALC_ASM.x + 210,
                  top: CALC_ASM.y - 178 + 200 * walk * walk,
                  padding: "10px 24px 12px",
                  background: CINNABAR,
                  border: `3px solid ${CARD}`,
                  outline: `2px solid ${CINNABAR}`,
                  borderRadius: 6,
                  boxShadow: "0 10px 18px rgba(26,26,26,0.22)",
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 48,
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                  color: CARD,
                  transformOrigin: "50% 0%",
                  transform: `translate(-50%, -50%) rotate(${7 + clientWiggle + 50 * walk}deg) scale(${interpolate(clientP, [0, 1], [0.2, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
                  opacity: Math.min(1, Math.max(0, clientP * 3)) * (1 - walk),
                }}
              >
                <div style={{position: "absolute", top: -16, left: "50%", width: 70, height: 24, marginLeft: -35, background: "rgba(255,255,255,0.62)", transform: "rotate(-8deg)"}} />
                client
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {figIn > 0 && walk < 1 ? (
        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: figIn * (1 - linear(frame, s5 + 24, s5 + 40, 0, 1))}}>
          <g transform={`translate(${figX} ${CALC_FIGURE.y + 3 * bob * working + (walk > 0 ? -4 * Math.abs(Math.sin(walk * 18)) : 0)}) scale(1.6)`}>
            <circle cx={0} cy={-104} r={14} fill={INK} />
            <path d="M-22 -80 C-25 -56 -20 -26 -17 -14 L17 -14 C20 -26 25 -56 22 -80 C14 -89 0 -91 0 -91 C0 -91 -14 -89 -22 -80 Z" fill={INK} />
            <line x1={-8} y1={-14} x2={-10 - 6 * Math.sin(walk * 18)} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
            <line x1={8} y1={-14} x2={10 + 6 * Math.sin(walk * 18)} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
            <line x1={-16} y1={-74} x2={-40 - 6 * hands} y2={-58 - 12 * hands + 30 * (1 - working)} stroke={INK} strokeWidth={7} strokeLinecap="round" />
            <line x1={-10} y1={-70} x2={-38 + 4 * hands} y2={-44 + 8 * hands + 26 * (1 - working)} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          </g>
        </svg>
      ) : null}
      {frame >= s5 + 6 && plateFade > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CALC_MID,
            top: 5150,
            width: 0,
            height: 0,
            transform: `rotate(${theta}deg)`,
            opacity: plateFade,
          }}
        >
          <div style={{position: "absolute", left: -3, top: 0, width: 6, height: rope - 80, background: INK}} />
          <div
            style={{
              position: "absolute",
              left: -270,
              top: rope - 90,
              width: 540,
              height: 170,
              padding: 8,
              boxSizing: "border-box",
              borderRadius: 10,
              background: FOIL,
              boxShadow: "0 26px 44px rgba(26,26,26,0.3), 0 0 0 1px rgba(26,26,26,0.5)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 6,
                background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -4px 8px rgba(120,80,20,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 76,
                letterSpacing: "0.08em",
                color: INK,
                textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(90,60,20,0.28)",
              }}
            >
              <span style={{marginRight: "-0.08em"}}>CINNABAR</span>
            </div>
          </div>
        </div>
      ) : null}
      {flash > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: CALC_MID,
            top: CALC_CONTRACT.y,
            width: CALC_CONTRACT.w + CALC_ASM.w + 40,
            height: CALC_CONTRACT.h + 40,
            transform: "translate(-50%, -50%)",
            border: `5px solid ${CINNABAR}`,
            borderRadius: 12,
            boxShadow: `0 0 ${60 * flash}px rgba(217,56,30,${0.5 * flash})`,
            opacity: flash,
          }}
        />
      ) : null}
      {frame >= snapAt ? (
        <div style={cssDrift(unitOut, CALC_CONTRACT.x, CALC_CONTRACT.y)}>
          {frame >= snapAt + 22 ? (
            <div
              style={{
                position: "absolute",
                left: CALC_JOIN.contract + CALC_CONTRACT.w / 2,
                top: CALC_CONTRACT.y - CALC_CONTRACT.h / 2 - 6,
                width: 230,
                height: 56,
                padding: 4,
                boxSizing: "border-box",
                borderRadius: 5,
                background: FOIL,
                boxShadow: "0 6px 12px rgba(26,26,26,0.2), 0 0 0 1px rgba(26,26,26,0.45)",
                transform: `translate(-50%, -50%) rotate(-2deg) scale(${interpolate(plateP, [0, 1], [1.8, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
                opacity: Math.min(1, Math.max(0, plateP * 3)),
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 3,
                  background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: "0.08em",
                  color: INK,
                }}
              >
                <span style={{marginRight: "-0.08em"}}>CINNABAR</span>
              </div>
            </div>
          ) : null}
          {frame >= snapAt + 12 ? (
            <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
              <g
                transform={`translate(${CALC_MID + 640} 6070) scale(${interpolate(checkP, [0, 1], [1.9, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(-6)`}
                opacity={Math.min(1, Math.max(0, checkP * 3))}
              >
                <path d="M -46 2 L -12 38 L 52 -44" fill="none" stroke={CINNABAR} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          ) : null}
        </div>
      ) : null}
      {frame >= s(4) + 4 ? (
        <div style={cssDrift(n4Out, CALC_MID, 5960)}>
          <BigNote x={CALC_MID} y={5960} width={720} tilt={-1.5} p={n4} size={52}>
            <div>It makes CKB</div>
            <div>unintuitive and confusing</div>
          </BigNote>
        </div>
      ) : null}
      {loopDrawn > 0 ? (
        <div style={cssDrift(unitOut, CALC_CONTRACT.x, CALC_CONTRACT.y)}>
          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            <path
              d={MONO_LOOP}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - loopDrawn}
            />
            {tie > 0 ? (
              <path
                d={MONO_TIE}
                fill="none"
                stroke={CINNABAR}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - tie}
              />
            ) : null}
            {nibOn > 0 ? (
              <g transform={`translate(${nib.x} ${nib.y}) rotate(-35)`} opacity={nibOn}>
                <rect x={-9} y={-150} width={18} height={118} rx={5} fill={INK} />
                <rect x={-9} y={-52} width={18} height={14} fill={CINNABAR} />
                <path d="M -9 -38 L 9 -38 L 0 0 Z" fill="#D9C9A8" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
                <circle cx={0} cy={-2} r={4} fill={CINNABAR} />
              </g>
            ) : null}
          </svg>
          {frame >= s6 + 48 ? (
            <div
              style={{
                position: "absolute",
                left: MONO_TAG.x,
                top: MONO_TAG.y,
                transform: `translate(-50%, -50%) translateY(${-90 * (1 - monoTagP)}px) rotate(${3 + 4 * (1 - monoTagP)}deg)`,
                opacity: Math.min(1, Math.max(0, monoTagP * 3)),
                padding: "16px 28px 14px",
                background: PAPER,
                border: `5px solid ${CINNABAR}`,
                boxShadow: "0 10px 18px rgba(26,26,26,0.16)",
                whiteSpace: "nowrap",
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: "0.02em",
                color: CINNABAR,
              }}
            >
              <div style={{position: "absolute", top: -16, left: 18, width: 96, height: 28, background: "rgba(255,255,255,0.68)", transform: "rotate(-6deg)"}} />
              All in Monorepo
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** Beat 13: AI skills for non-coders. The world layer only carries the 02 card into the headline spot; the high-jump stage is a screen-space layer (JumpView). */
const SK_SEED_FROM = {x: 4760, y: 5520};
const SK_SEED_TO = {x: 3890, y: 6860};

const Skills: React.FC<{frame: number; fps: number}> = ({frame}) => {
  const at = beatStart(12);
  if (frame < at || frame >= at + 40) {
    return null;
  }
  const seedU = eased(frame, at + 4, at + 34);
  const seedC = {x: (SK_SEED_FROM.x + SK_SEED_TO.x) / 2 + 180, y: SK_SEED_FROM.y + 260};
  const seed = {
    x: (1 - seedU) * (1 - seedU) * SK_SEED_FROM.x + 2 * (1 - seedU) * seedU * seedC.x + seedU * seedU * SK_SEED_TO.x,
    y: (1 - seedU) * (1 - seedU) * SK_SEED_FROM.y + 2 * (1 - seedU) * seedU * seedC.y + seedU * seedU * SK_SEED_TO.y,
  };
  const seedOp = Math.min(1, linear(frame, at + 4, at + 8, 0, 1)) * (1 - linear(frame, at + 26, at + 38, 0, 1));
  if (seedOp <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: seed.x,
        top: seed.y,
        width: 360,
        padding: "30px 16px 22px",
        boxSizing: "border-box",
        background: CARD,
        border: `2px solid ${INK}`,
        boxShadow: "0 16px 28px rgba(26,26,26,0.18)",
        transform: `translate(-50%, -50%) rotate(${-2 + 6 * seedU}deg) scale(${1 - 0.4 * seedU})`,
        opacity: seedOp,
        textAlign: "center",
      }}
    >
      <div style={{position: "absolute", top: -14, left: "50%", width: 110, height: 28, marginLeft: -55, background: "rgba(255,255,255,0.62)", transform: "rotate(2deg)"}} />
      <div style={{position: "absolute", top: 12, left: 16, fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: CINNABAR}}>02</div>
      <FeatureIcon k={1} />
      <div style={{marginTop: 10, fontFamily: MARKER, fontWeight: 800, fontSize: 33, lineHeight: 1.05, color: INK}}>
        {FEATURES[1].lines.map((line) => (
          <div key={line} style={{whiteSpace: "nowrap"}}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Beat 13 (screen space, 1920x1080): a side-view high-jump stage. The bar starts far too high, silhouettes fail and give up, AI skills arrives, the bar sinks, and a stream of silhouettes (some non-coders) clears it. */
const JP_GROUND = 820;
const JP_POSTS = [1100, 1420];
const JP_BAR_HIGH = 330;
const JP_BAR_LOW = 715;
const JP_POST_TOP = 250;
const JP_MAT = {x0: 1480, x1: 1800, h: 24};
const JP_S = 1.6;
/** Standing hip height in figure units, and the extra height of the landing mat in figure units. */
const JP_HIP = 44;
const JP_MAT_U = 15;
const JP_TAKE = 900;
const JP_SPOTS = [420, 540, 660];
const JP_PLATE = {x: 1735, y: 190};
const JP_CARD = {x: 1735, y: 420};
const JP_NOTE = {x: 520, y: 300};

/** Pose: lean, head droop, then thigh/knee for the near and far leg, then upper-arm/elbow for the near and far arm (degrees, 0 = hanging straight down, forward positive). */
type JpPose = number[];
const JP_STAND: JpPose = [0, 0, 3, 5, -3, 5, 8, 14, -6, 14];
const JP_TAKEOFF: JpPose = [-3, 0, 80, 100, -28, 45, 165, 10, 150, 20];
const JP_TUCK: JpPose = [8, 0, 100, 115, 88, 125, 140, 25, 150, 20];
const JP_LAND: JpPose = [12, 0, 45, 50, 20, 60, 80, 10, 40, 15];
const JP_FLAIL: JpPose = [-12, 0, 60, 30, -40, 70, 170, 40, 120, 60];
const JP_LIE: JpPose = [-2, 0, 20, 30, 5, 40, 60, 20, 100, 30];
const JP_SIT: JpPose = [40, 16, 88, 0, 84, 8, 28, 40, 18, 48];

const jpRun = (ph: number, amp: number): JpPose => {
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  return [
    10 * amp,
    0,
    46 * amp * s,
    18 + 70 * amp * Math.max(0, c),
    -46 * amp * s,
    18 + 70 * amp * Math.max(0, -c),
    -45 * amp * s,
    70 * amp + 10,
    45 * amp * s,
    70 * amp + 10,
  ];
};

type JpBlock = {
  f0: number;
  f1: number;
  x0: number;
  x1: number;
  h0?: number;
  h1?: number;
  rot0?: number;
  rot1?: number;
  d0?: number;
  d1?: number;
  arc?: number;
  dir?: 1 | -1;
  smooth?: boolean;
  poses: (JpPose | "run")[];
};

type JpState = {x: number; h: number; rot: number; d: number; dir: 1 | -1; pose: JpPose};

const jpEval = (frame: number, blocks: JpBlock[], seed: number): JpState | null => {
  let b: JpBlock | null = null;
  for (const c of blocks) {
    if (frame >= c.f0) {
      b = c;
    }
  }
  if (!b) {
    return null;
  }
  const u = Math.min(1, Math.max(0, (frame - b.f0) / Math.max(1, b.f1 - b.f0)));
  const e = b.smooth ? u * u * (3 - 2 * u) : u;
  const ph = 0.6 * frame + seed;
  const keys = b.poses.map((p) => (p === "run" ? jpRun(ph, 1) : p));
  const f = Math.min(keys.length - 1 - 1e-9, u * (keys.length - 1));
  const i = keys.length === 1 ? 0 : Math.floor(f);
  const k = keys.length === 1 ? 0 : f - i;
  const pose = keys.length === 1 ? keys[0] : keys[i].map((v, j) => v + (keys[i + 1][j] - v) * k);
  const running = b.poses[0] === "run" && b.arc === undefined;
  const h0 = b.h0 ?? JP_HIP;
  const h1 = b.h1 ?? h0;
  return {
    x: b.x0 + (b.x1 - b.x0) * e,
    h: h0 + (h1 - h0) * e + ((b.arc ?? 0) / JP_S) * 4 * u * (1 - u) - (running ? 3 * Math.abs(Math.sin(ph)) : 0),
    rot: (b.rot0 ?? 0) + ((b.rot1 ?? b.rot0 ?? 0) - (b.rot0 ?? 0)) * e,
    d: (b.d0 ?? 0) + ((b.d1 ?? b.d0 ?? 0) - (b.d0 ?? 0)) * e,
    dir: b.dir ?? 1,
    pose,
  };
};

/** A failed attempt: run up, jump far too short, tumble back, get up, jog back to the waiting spot at the back. */
const jpFail = (f0: number, fromX: number, spot: number, H: number, fromBack: boolean): JpBlock[] => {
  const out: JpBlock[] = [];
  let t = f0;
  if (fromBack) {
    out.push({f0: t, f1: t + 8, x0: fromX, x1: fromX, d0: 1, d1: 0, smooth: true, poses: [JP_STAND]});
    t += 8;
  }
  const n = Math.max(6, Math.round((JP_TAKE - fromX) / 22));
  out.push({f0: t, f1: t + n, x0: fromX, x1: JP_TAKE, poses: ["run"]});
  t += n;
  out.push({f0: t, f1: t + 22, x0: JP_TAKE, x1: 1000, arc: H, rot1: -30, poses: ["run", JP_TAKEOFF, JP_FLAIL, JP_FLAIL]});
  t += 22;
  out.push({f0: t, f1: t + 10, x0: 1000, x1: 970, h0: JP_HIP, h1: 10, rot0: -30, rot1: -88, smooth: true, poses: [JP_FLAIL, JP_LIE]});
  t += 10;
  out.push({f0: t, f1: t + 4, x0: 970, x1: 970, h0: 10, rot0: -88, poses: [JP_LIE]});
  t += 4;
  out.push({f0: t, f1: t + 10, x0: 970, x1: 970, h0: 10, h1: JP_HIP, rot0: -88, rot1: 0, smooth: true, poses: [JP_LIE, JP_STAND]});
  t += 10;
  out.push({f0: t, f1: t + 26, x0: 970, x1: spot, d0: 0, d1: 1, dir: -1, poses: ["run", "run", JP_STAND]});
  return out;
};

/** A clean jump over the low bar, landing on the mat and running off the right edge. */
const jpClear = (f0: number, fromX: number, H: number): JpBlock[] => {
  const n = Math.max(6, Math.round((JP_TAKE - fromX) / 24));
  return [
    {f0, f1: f0 + n, x0: fromX, x1: JP_TAKE, poses: ["run"]},
    {f0: f0 + n, f1: f0 + n + 32, x0: JP_TAKE, x1: 1530, h1: JP_HIP + JP_MAT_U, arc: H, poses: ["run", JP_TAKEOFF, JP_TUCK, JP_TUCK, JP_LAND]},
    {f0: f0 + n + 32, f1: f0 + n + 43, x0: 1530, x1: 1780, h0: JP_HIP + JP_MAT_U, poses: ["run"]},
    {f0: f0 + n + 43, f1: f0 + n + 52, x0: 1780, x1: 2040, h0: JP_HIP + JP_MAT_U, h1: JP_HIP, poses: ["run"]},
  ];
};

/** Figure geometry in figure units: origin at the hip, y down. */
const jpGeom = (pose: JpPose) => {
  const [lean, head, tA, kA, tB, kB, uA, eA, uB, eB] = pose;
  const r = (d: number) => (d * Math.PI) / 180;
  const L = r(lean);
  const neck = {x: 38 * Math.sin(L), y: -38 * Math.cos(L)};
  const hd = {x: neck.x + 13 * Math.sin(L) + head * 0.6, y: neck.y - 13 * Math.cos(L) + head * 0.5};
  const sh = {x: neck.x * 0.88, y: neck.y * 0.88};
  const leg = (t: number, k: number) => {
    const knee = {x: 22 * Math.sin(r(t)), y: 22 * Math.cos(r(t))};
    return [knee, {x: knee.x + 22 * Math.sin(r(t - k)), y: knee.y + 22 * Math.cos(r(t - k))}];
  };
  const arm = (u: number, e: number) => {
    const el = {x: sh.x + 16 * Math.sin(r(u)), y: sh.y + 16 * Math.cos(r(u))};
    return [el, {x: el.x + 16 * Math.sin(r(u + e)), y: el.y + 16 * Math.cos(r(u + e))}];
  };
  return {neck, hd, sh, legA: leg(tA, kA), legB: leg(tB, kB), armA: arm(uA, eA), armB: arm(uB, eB)};
};

type JpPlayer = {blocks: JpBlock[]; seed: number; cup?: boolean; tag?: boolean; at?: number};

const JpFigure: React.FC<{state: JpState; frame: number; cup?: boolean}> = ({state, frame, cup}) => {
  const g = jpGeom(state.pose);
  const sc = JP_S * (1 - 0.18 * state.d);
  const gy = JP_GROUND - 34 * state.d;
  const hipY = gy - state.h * sc;
  const pts = (a: {x: number; y: number}[]) => `0,0 ${a.map((p) => `${p.x},${p.y}`).join(" ")}`;
  const sholder = `${g.sh.x},${g.sh.y}`;
  const arm = (a: {x: number; y: number}[]) => `${sholder} ${a.map((p) => `${p.x},${p.y}`).join(" ")}`;
  const hand = g.armA[1];
  return (
    <g transform={`translate(${state.x} ${hipY}) rotate(${state.rot * state.dir}) scale(${state.dir * sc} ${sc})`} opacity={1 - 0.22 * state.d}>
      <polyline points={pts(g.legB)} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <polyline points={arm(g.armB)} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <line x1={0} y1={0} x2={g.neck.x} y2={g.neck.y} stroke={INK} strokeWidth={17} strokeLinecap="round" />
      <circle cx={g.hd.x} cy={g.hd.y} r={13} fill={INK} />
      <polyline points={pts(g.legA)} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={arm(g.armA)} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      {cup ? (
        <g transform={`translate(${hand.x} ${hand.y})`}>
          <path d="M -6 -9 L 6 -9 L 5 6 L -5 6 Z" fill={CARD} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M 6 -5 Q 13 -4 6 2" fill="none" stroke={INK} strokeWidth={2.2} />
          <path d={`M -2 -13 q 3 -4 0 -8 q -3 -4 0 -8`} fill="none" stroke={INK} strokeWidth={1.8} opacity={0.35 + 0.15 * Math.sin(frame / 5)} />
        </g>
      ) : null}
    </g>
  );
};

const JumpView: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const next = beatStart(13);
  const s1 = stepStart(12, 1);
  const s2 = stepStart(12, 2);
  const s3 = stepStart(12, 3);
  const s4 = stepStart(12, 4);
  if (frame < s1 || frame >= next + 30) {
    return null;
  }
  const exit = deskDrift(frame, next, {x: 1, y: -0.4});
  // Stage entrance (step 1).
  const groundP = linear(frame, s1, s1 + 16, 0, 1);
  const postsP = eased(frame, s1 + 8, s1 + 26);
  const barP = eased(frame, s1 + 22, s1 + 38);
  const labelP = slam(frame, fps, s1, 38);
  const matP = linear(frame, s1 + 16, s1 + 28, 0, 1);
  // The bar sinks when AI skills arrives (step 3); the label follows it.
  const barY = JP_BAR_HIGH + (JP_BAR_LOW - JP_BAR_HIGH) * eased(frame, s3 + 40, s3 + 94);
  // AI skills plate and card.
  const entry = interpolate(frame, [s3 + 4, s3 + 28], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5))});
  const entryX = 620 * (1 - entry);
  const burstT = linear(frame, s3 + 26, s3 + 46, 0, 1);
  const cardGlow = 0.55 + 0.45 * (0.5 - 0.5 * Math.cos((2 * Math.PI * Math.max(0, frame + idleF - (s3 + 28))) / 40));
  const note1P = slam(frame, fps, s2, 60);
  const note1Out = deskDrift(frame, s3, {x: -0.3, y: 1});
  const note2P = slam(frame, fps, s4, 70);

  // Players. The first three (coders) fail twice, give up, get up, then lead the stream; the rest only run in step 4.
  const fails = [130, 110, 90];
  const players: JpPlayer[] = [];
  JP_SPOTS.forEach((spot, i) => {
    const att1 = jpFail(s1 + 28 + 34 * i, -100, spot, 180 - 20 * i, false);
    const att2 = jpFail(s2 + 4 + 26 * i, spot, spot, fails[i], true);
    const sitAt = att2[att2.length - 1].f1;
    const blocks: JpBlock[] = [
      ...att1,
      ...att2,
      {f0: sitAt, f1: sitAt + 14, x0: spot, x1: spot, d0: 1, d1: 1, h0: JP_HIP, h1: 7, smooth: true, poses: [JP_STAND, JP_SIT]},
      {f0: s3 + 92, f1: s3 + 106, x0: spot, x1: spot, d0: 1, d1: 1, h0: 7, h1: JP_HIP, smooth: true, poses: [JP_SIT, JP_STAND]},
      {f0: s3 + 108, f1: s3 + 124, x0: spot, x1: spot, d0: 1, d1: 0, smooth: true, poses: [JP_STAND]},
      ...jpClear(s4 + 4 + 18 * (2 - i), spot, 150),
    ];
    players.push({blocks, seed: i * 2.1});
  });
  for (let k = 0; k < 6; k++) {
    players.push({
      blocks: jpClear(s4 + 58 + 18 * k, -100, 140 + 20 * (k % 3)),
      seed: 1.3 + k * 1.7,
      cup: k === 0 || k === 2 || k === 4,
      tag: k === 2 || k === 4,
    });
  }
  // Idle loop (final step only): after the last runner, the stream goes on forever with fresh runners.
  // They start at hold + 6 + 18m on the idle clock, so idle 0 is exactly the settled frame.
  if (idleF > 0 && frame >= s4) {
    const holdF = next - 1;
    const m1 = Math.floor((idleF - 6) / 18);
    const m0 = Math.max(0, Math.floor((idleF - 6 - 100) / 18));
    for (let m = m0; m <= m1; m++) {
      const c = m % 6;
      players.push({
        blocks: jpClear(holdF + 6 + 18 * m, -100, 140 + 20 * (m % 3)),
        seed: 1.3 + m * 1.7,
        cup: c === 0 || c === 2 || c === 4,
        tag: c === 2 || c === 4,
        at: holdF + idleF,
      });
    }
  }
  const states = players
    .map((p) => ({p, st: jpEval(p.at ?? frame, p.blocks, p.seed)}))
    .filter((q): q is {p: JpPlayer; st: JpState} => q.st !== null && q.st.x > -260 && q.st.x < 2200)
    .sort((a, b) => b.st.d - a.st.d);
  const postUp = (JP_GROUND - JP_POST_TOP) * postsP;
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={cssDrift(exit, 960, 540)}>
        <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          {/* Ground with a few ink ticks under it. */}
          <path d="M 60 820 L 1860 820" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - groundP} />
          {Array.from({length: 28}, (_, i) => 120 + i * 62).map((x) => (
            <line key={x} x1={x} y1={836} x2={x - 16} y2={852} stroke={INK} strokeWidth={2.5} opacity={0.3 * groundP} strokeLinecap="round" />
          ))}
          {/* Landing mat. */}
          <rect x={JP_MAT.x0} y={JP_GROUND - JP_MAT.h} width={JP_MAT.x1 - JP_MAT.x0} height={JP_MAT.h} rx={8} fill={FOLDER} stroke={INK} strokeWidth={4} opacity={matP} />
          {/* Posts with ruler ticks, and the bar. */}
          {JP_POSTS.map((x, pi) => (
            <g key={x}>
              <line x1={x} y1={JP_GROUND} x2={x} y2={JP_GROUND - postUp} stroke={INK} strokeWidth={9} strokeLinecap="round" />
              {Array.from({length: 8}, (_, i) => JP_GROUND - 70 * (i + 1)).map((y) =>
                JP_GROUND - y <= postUp ? <line key={y} x1={x + (pi === 0 ? -9 : 9)} y1={y} x2={x + (pi === 0 ? -26 : 26)} y2={y} stroke={INK} strokeWidth={3} opacity={0.5} strokeLinecap="round" /> : null,
              )}
            </g>
          ))}
          {barP > 0 ? (
            <g>
              <line x1={JP_POSTS[0]} y1={barY} x2={JP_POSTS[0] + (JP_POSTS[1] - JP_POSTS[0]) * barP} y2={barY} stroke={CINNABAR} strokeWidth={9} strokeLinecap="round" />
              <circle cx={JP_POSTS[0]} cy={barY} r={9} fill={INK} />
              {barP >= 1 ? <circle cx={JP_POSTS[1]} cy={barY} r={9} fill={INK} /> : null}
            </g>
          ) : null}
          {/* Players, back lane first. */}
          {states.map(({p, st}, i) => (
            <JpFigure key={i} state={st} frame={frame + idleF} cup={p.cup} />
          ))}
          {/* AI skills arrival burst. */}
          {burstT > 0 && burstT < 1 ? <ellipse cx={JP_CARD.x} cy={JP_CARD.y} rx={150 + 220 * burstT} ry={190 + 220 * burstT} fill="none" stroke="#E7B94C" strokeWidth={10 * (1 - burstT) + 1} opacity={1 - burstT} /> : null}
        </svg>
        {/* 'Threshold' tag hangs under the bar and follows it. */}
        {labelP > 0.02 && barP > 0.5 ? (
          <div style={{position: "absolute", left: 1260, top: barY, transform: "translate(-50%, 0)", opacity: Math.min(1, labelP * 2)}}>
            <div style={{position: "absolute", left: 38, top: 4, width: 2, height: 22, background: INK}} />
            <div style={{position: "absolute", right: 38, top: 4, width: 2, height: 22, background: INK}} />
            <div
              style={{
                marginTop: 24,
                padding: "5px 14px 4px",
                background: CARD,
                border: `2.5px solid ${INK}`,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "0.1em",
                color: INK,
                transform: `rotate(${-2 * (1 - Math.min(1, labelP))}deg) scale(${interpolate(labelP, [0, 1], [1.5, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
                whiteSpace: "nowrap",
              }}
            >
              Threshold
            </div>
          </div>
        ) : null}
        {/* 'non-coders' tags ride above two of the runners. */}
        {states.map(({p, st}, i) => {
          if (!p.tag) {
            return null;
          }
          const g = jpGeom(st.pose);
          const sc = JP_S * (1 - 0.18 * st.d);
          const hipY = JP_GROUND - 34 * st.d - st.h * sc;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: st.x + g.hd.x * sc * st.dir,
                top: hipY + g.hd.y * sc - 36,
                transform: "translate(-50%, -100%) rotate(-3deg)",
                padding: "3px 10px 2px",
                background: CARD,
                border: `2px solid ${INK}`,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.06em",
                color: INK,
                whiteSpace: "nowrap",
              }}
            >
              non-coders
            </div>
          );
        })}
        {/* Cinnabar plate and the AI skills card, arriving from the right in step 3. */}
        {frame >= s3 + 4 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: JP_PLATE.x + entryX,
                top: JP_PLATE.y,
                width: 300,
                height: 88,
                padding: 6,
                boxSizing: "border-box",
                borderRadius: 6,
                background: FOIL,
                boxShadow: "0 12px 20px rgba(26,26,26,0.22), 0 0 0 1px rgba(26,26,26,0.45)",
                transform: "translate(-50%, -50%) rotate(-3deg)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 3,
                  background: "linear-gradient(160deg, #FFFCF3, #F2E9D3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: "0.08em",
                  color: INK,
                }}
              >
                <span style={{marginRight: "-0.08em"}}>CINNABAR</span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: JP_CARD.x + entryX,
                top: JP_CARD.y,
                width: 210,
                height: 270,
                boxSizing: "border-box",
                transform: "translate(-50%, -50%) rotate(3deg)",
                background: "linear-gradient(170deg, #FFFDF5, #F6EBCF)",
                border: `3px solid ${INK}`,
                borderRadius: 6,
                boxShadow: `0 0 ${30 + 40 * cardGlow}px rgba(231,185,76,${0.5 * Math.min(1.4, cardGlow)}), 0 0 ${10 + 16 * cardGlow}px rgba(217,56,30,${0.3 * Math.min(1.4, cardGlow)})`,
                padding: "24px 16px",
                textAlign: "center",
              }}
            >
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: INK, letterSpacing: "-0.02em"}}>AI skills</div>
              <svg width={64} height={64} viewBox="-30 -30 60 60" style={{display: "block", margin: "16px auto 8px"}}>
                <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="#E7B94C" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
                <circle r={4} fill={CINNABAR} />
              </svg>
              {[130, 160, 110].map((w, i) => (
                <div key={i} style={{margin: "10px auto 0", width: w, height: 7, borderRadius: 4, background: INK, opacity: 0.25}} />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {frame >= s2 + 60 && note1Out.opacity > 0 ? (
        <div style={cssDrift(note1Out, JP_NOTE.x, JP_NOTE.y)}>
          <div style={cssDrift(exit, 960, 540)}>
            <BigNote x={JP_NOTE.x} y={JP_NOTE.y} width={560} tilt={-2} p={note1P} size={58}>
              Almost no one can jump over it.
            </BigNote>
          </div>
        </div>
      ) : null}
      {frame >= s4 + 70 ? (
        <div style={cssDrift(exit, 960, 540)}>
          <BigNote x={JP_NOTE.x + 40} y={JP_NOTE.y} width={600} tilt={2} p={note2P} size={58}>
            Even non-coders can jump it.
          </BigNote>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Beat 14: Inclusive verification tree. World coords around CAMERAS[13]. Root, a tree that grows, then three paths lit one by one. */
const TR_SEED_FROM = {x: 3700, y: 4560};
const TR_SEED_TO = {x: 720, y: 8420};
const TR_ROOT = {x: 1580, y: 8220};
const TR_SCALE = 1.1;
const TR_STICKY = {x: 2150, y: 8200};
/** The ALERT 'verification failed' label, relative to the Tip leaf: it sits to the lower-left in free space, joined by a red dotted guide. */
const TR_FAIL_NOTE = {dx: -185, dy: 220, w: 440, h: 98};
const TR_GREEN = "#1F7A4A";
const TR_GOLD = "#E7B94C";
type TrNode = {id: string; x: number; y: number; label: string; parent?: string; kind: "root" | "mid" | "leaf"; d: number};
/** The whole tree (placeholder labels). d = frames after the step starts when its branch begins to grow. */
const TR_TREE: TrNode[] = [
  {id: "root", x: 0, y: 0, label: "Root", kind: "root", d: 0},
  {id: "check", x: -260, y: -210, label: "Check", parent: "root", kind: "mid", d: 0},
  {id: "verify", x: 260, y: -210, label: "Verify", parent: "root", kind: "mid", d: 8},
  {id: "path", x: -400, y: -420, label: "Path", parent: "check", kind: "leaf", d: 24},
  {id: "hash", x: -140, y: -440, label: "Hash", parent: "check", kind: "leaf", d: 30},
  {id: "proof", x: 140, y: -440, label: "Proof", parent: "verify", kind: "leaf", d: 32},
  {id: "lock", x: 400, y: -420, label: "Lock", parent: "verify", kind: "leaf", d: 38},
  {id: "dep", x: 600, y: -380, label: "Dep", parent: "verify", kind: "leaf", d: 44},
  {id: "cell", x: -40, y: -600, label: "Cell", parent: "hash", kind: "leaf", d: 54},
  {id: "tip", x: -520, y: -560, label: "Tip", parent: "path", kind: "leaf", d: 50},
  {id: "sig", x: -280, y: -590, label: "Sig", parent: "path", kind: "leaf", d: 56},
  {id: "wit", x: 220, y: -600, label: "Wit", parent: "proof", kind: "leaf", d: 60},
  {id: "out", x: 480, y: -560, label: "Out", parent: "lock", kind: "leaf", d: 66},
];
/** Paths lit one per click (steps 3, 4, 5). */
const TR_PATHS: {ids: string[]; step: number; bad: boolean}[] = [
  {ids: ["root", "verify", "proof", "wit"], step: 3, bad: false},
  {ids: ["root", "check", "hash", "cell"], step: 4, bad: false},
  {ids: ["root", "check", "path", "tip"], step: 5, bad: true},
];

const Tree: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = beatStart(13);
  const next = beatStart(14);
  if (frame < at || frame >= next + 34) {
    return null;
  }
  const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
  const s1 = stepStart(13, 1);
  const s2 = stepStart(13, 2);
  const s6 = stepStart(13, 6);
  const out = deskDrift(frame, next, {x: 1, y: -0.35});
  const stickyOut = deskDrift(frame, next + 3, {x: 1, y: 0.3});
  // Step 0: the 03 feature card flies down and shrinks into the headline spot.
  const seedU = eased(frame, at + 4, at + 34);
  const seedC = {x: (TR_SEED_FROM.x + TR_SEED_TO.x) / 2 + 220, y: TR_SEED_FROM.y + 520};
  const seed = {
    x: (1 - seedU) * (1 - seedU) * TR_SEED_FROM.x + 2 * (1 - seedU) * seedU * seedC.x + seedU * seedU * TR_SEED_TO.x,
    y: (1 - seedU) * (1 - seedU) * TR_SEED_FROM.y + 2 * (1 - seedU) * seedU * seedC.y + seedU * seedU * TR_SEED_TO.y,
  };
  const seedOp = Math.min(1, linear(frame, at + 4, at + 8, 0, 1)) * (1 - linear(frame, at + 26, at + 38, 0, 1));
  const rootP = slam(frame, fps, s1, 4);
  // Idle glow pulse for lit paths (0 at idle 0).
  const gp = 0.5 - 0.5 * Math.cos((2 * Math.PI * idleF) / 84);
  // Organic sway while the tree grows; it settles to zero when growth is done.
  const swayAmp = 7 * Math.sin(Math.PI * linear(frame, s2, s2 + 140, 0, 1));
  const pos = (n: TrNode) => {
    const k = n.kind === "root" ? 0 : n.kind === "mid" ? 0.6 : 1;
    const i = TR_TREE.indexOf(n);
    return {
      x: n.x + swayAmp * k * Math.sin((2 * Math.PI * frame) / 80 + i * 1.7),
      y: n.y + swayAmp * 0.6 * k * Math.sin((2 * Math.PI * frame) / 96 + i * 2.3),
    };
  };
  const byId = (id: string) => TR_TREE.find((n) => n.id === id) ?? TR_TREE[0];
  const edgePts = (n: TrNode) => {
    const a = pos(byId(n.parent ?? "root"));
    const b = pos(n);
    return {a, b, m: {x: (a.x + b.x) / 2 + (b.x - a.x) * 0.05, y: (a.y + b.y) / 2 - 40}};
  };
  const edgeD = (n: TrNode) => {
    const {a, b, m} = edgePts(n);
    return `M ${a.x} ${a.y} Q ${m.x} ${m.y} ${b.x} ${b.y}`;
  };
  const quadAt = (n: TrNode, t: number) => {
    const {a, b, m} = edgePts(n);
    return {x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * m.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * m.y + t * t * b.y};
  };
  // Path animation helpers.
  const T0 = (p: (typeof TR_PATHS)[number]) => stepStart(13, p.step) + 6;
  const nodeLit = (p: (typeof TR_PATHS)[number], j: number) => linear(frame, T0(p) + j * 12 - 2, T0(p) + j * 12 + 8, 0, 1);
  const edgeLit = (p: (typeof TR_PATHS)[number], j: number) => linear(frame, T0(p) + (j - 1) * 12 + 2, T0(p) + j * 12 + 2, 0, 1);
  // Earlier success paths settle to a softer glow once the next path starts.
  const soft = (pi: number) => {
    const nextStart = stepStart(13, TR_PATHS[pi].step + 1);
    return pi < 2 ? 1 - 0.45 * linear(frame, nextStart, nextStart + 10, 0, 1) : 1;
  };
  const dimA = linear(frame, stepStart(13, 3), stepStart(13, 3) + 14, 0, 1);
  const dimB = linear(frame, s6, s6 + 14, 0, 1);
  const unlitOp = (1 - 0.35 * dimA) * (1 - 0.3 * dimB);
  const lastStep = (p: (typeof TR_PATHS)[number]) => stepStart(13, p.step);
  const tickAt = (p: (typeof TR_PATHS)[number]) => lastStep(p) + 56;
  const stickyP = slam(frame, fps, s6, 6);
  const failP = slam(frame, fps, stepStart(13, 5), 66);
  const pathsOf = (id: string) => TR_PATHS.map((p, pi) => ({p, pi, j: p.ids.indexOf(id)})).filter((x) => x.j >= 0);
  const card = (n: TrNode, popP: number) => {
    const w = n.kind === "root" ? 220 : n.kind === "mid" ? 150 : 118;
    const h = n.kind === "root" ? 72 : 56;
    const size = n.kind === "root" ? 36 : 26;
    const pp = pos(n);
    let okLit = 0;
    let badLit = 0;
    for (const x of pathsOf(n.id)) {
      const v = nodeLit(x.p, x.j) * soft(x.pi);
      if (x.p.bad) {
        badLit = Math.max(badLit, v);
      } else {
        okLit = Math.max(okLit, v);
      }
    }
    const badOnly = badLit > 0 && n.id !== "root" && okLit === 0;
    const lit = Math.max(okLit, badLit);
    const sc = interpolate(popP, [0, 1], [0.55, 1], clamp);
    const isRoot = n.kind === "root";
    const bg = isRoot ? INK : badOnly ? "#FADBD0" : okLit > 0 ? "#FFF2C6" : CARD;
    const border = badOnly ? CINNABAR : INK;
    const glow = badOnly
      ? `0 0 ${10 + (22 + 16 * gp) * badLit}px rgba(217,56,30,${0.8 * badLit})`
      : badLit > 0
        ? `0 0 ${6 + 10 * badLit}px rgba(217,56,30,${0.6 * badLit}), 0 0 ${10 + (20 + 10 * gp) * okLit}px rgba(231,185,76,${0.85 * okLit})`
        : `0 0 ${10 + (22 + 12 * gp) * okLit}px rgba(231,185,76,${0.9 * okLit})`;
    return (
      <div
        key={n.id}
        style={{
          position: "absolute",
          left: pp.x,
          top: pp.y,
          width: w,
          height: h,
          boxSizing: "border-box",
          background: bg,
          border: `${lit > 0 ? 3.5 : 2.5}px ${badOnly && n.kind === "leaf" ? "dashed" : "solid"} ${border}`,
          borderRadius: n.kind === "leaf" ? 28 : 8,
          color: isRoot ? PAPER : INK,
          fontFamily: isRoot ? SERIF : SANS,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: isRoot ? "-0.02em" : "0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: lit > 0 ? glow : "0 10px 18px rgba(26,26,26,0.14)",
          transform: `translate(-50%, -50%) scale(${sc})`,
          opacity: Math.min(1, Math.max(0, popP * 2.4)) * (isRoot || lit > 0 ? 1 : unlitOp),
        }}
      >
        {n.label}
      </div>
    );
  };
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      {seedOp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: seed.x,
            top: seed.y,
            width: 360,
            padding: "30px 16px 22px",
            boxSizing: "border-box",
            background: CARD,
            border: `2px solid ${INK}`,
            boxShadow: "0 16px 28px rgba(26,26,26,0.18)",
            transform: `translate(-50%, -50%) rotate(${3 - 7 * seedU}deg) scale(${1 - 0.4 * seedU})`,
            opacity: seedOp,
            textAlign: "center",
          }}
        >
          <div style={{position: "absolute", top: -14, left: "50%", width: 110, height: 28, marginLeft: -55, background: "rgba(255,255,255,0.62)", transform: "rotate(-2deg)"}} />
          <div style={{position: "absolute", top: 12, left: 16, fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: CINNABAR}}>03</div>
          <FeatureIcon k={2} />
          <div style={{marginTop: 10, fontFamily: MARKER, fontWeight: 800, fontSize: 33, lineHeight: 1.05, color: INK}}>
            {FEATURES[2].lines.map((line) => (
              <div key={line} style={{whiteSpace: "nowrap"}}>
                {line}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {frame >= s1 ? (
        <div style={cssDrift(out, TR_ROOT.x, TR_ROOT.y)}>
          <div style={{position: "absolute", left: TR_ROOT.x, top: TR_ROOT.y, transform: `scale(${TR_SCALE})`, transformOrigin: "0 0"}}>
            <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
              <ellipse cx={0} cy={48} rx={200} ry={18} fill={INK} opacity={0.1} />
              {/* Growing branches. */}
              {TR_TREE.filter((n) => n.parent).map((n) => {
                const g = interpolate(frame, [s2 + n.d, s2 + n.d + 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
                const lit = pathsOf(n.id).some((x) => edgeLit(x.p, x.j) > 0);
                return g > 0 ? (
                  <g key={n.id} opacity={Math.min(1, g * 1.5) * (lit ? 1 : unlitOp)}>
                    <path d={edgeD(n)} fill="none" stroke={INK} strokeWidth={n.kind === "mid" ? 6 : 4.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
                  </g>
                ) : null;
              })}
              {/* Lit paths: a gold (success) or red (failed) glow under a stronger ink line. */}
              {TR_PATHS.map((p, pi) =>
                p.ids.slice(1).map((id, jj) => {
                  const n = byId(id);
                  const j = jj + 1;
                  const e = edgeLit(p, j);
                  if (e <= 0) {
                    return null;
                  }
                  const sf = soft(pi);
                  const broken = p.bad && j === p.ids.length - 1;
                  const frac = broken ? Math.min(e, 0.42) : e;
                  return (
                    <g key={`${pi}-${id}`} opacity={sf}>
                      <path d={edgeD(n)} fill="none" stroke={p.bad ? CINNABAR : TR_GOLD} strokeWidth={20 + 4 * gp} opacity={p.bad ? 0.38 + 0.14 * gp : 0.6 + 0.2 * gp} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frac} />
                      <path d={edgeD(n)} fill="none" stroke={p.bad ? CINNABAR : INK} strokeWidth={p.bad ? 7 : 8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frac} />
                    </g>
                  );
                }),
              )}
              {/* The crack where the failed path breaks. */}
              {(() => {
                const p = TR_PATHS[2];
                const e = edgeLit(p, 3);
                if (e < 0.5) {
                  return null;
                }
                const c = quadAt(byId("tip"), 0.5);
                const k = slam(frame, fps, lastStep(p), 50);
                return (
                  <g transform={`translate(${c.x} ${c.y}) scale(${interpolate(k, [0, 1], [1.6, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`} opacity={Math.min(1, k * 3)}>
                    <path d="M -16 -20 L 4 -6 L -8 4 L 14 22" fill="none" stroke={PAPER} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M -16 -20 L 4 -6 L -8 4 L 14 22" fill="none" stroke={CINNABAR} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                );
              })()}
              {/* Green ticks at the leaves of the successful paths; a red cross at the failed leaf. */}
              {TR_PATHS.map((p, pi) => {
                const n = byId(p.ids[p.ids.length - 1]);
                const pp = pos(n);
                const t = slam(frame, fps, lastStep(p), 56);
                if (frame < tickAt(p)) {
                  return null;
                }
                const sc = interpolate(t, [0, 1], [1.8, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
                return (
                  <g key={`m${pi}`} transform={`translate(${pp.x + 76} ${pp.y - 40}) scale(${sc}) rotate(-6)`} opacity={Math.min(1, Math.max(0, t * 3))}>
                    {p.bad ? (
                      <>
                        <path d="M -17 -17 L 17 17 M 17 -17 L -17 17" fill="none" stroke={PAPER} strokeWidth={17} strokeLinecap="round" />
                        <path d="M -17 -17 L 17 17 M 17 -17 L -17 17" fill="none" stroke={CINNABAR} strokeWidth={10} strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        <path d="M -20 2 L -6 17 L 22 -17" fill="none" stroke={PAPER} strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M -20 2 L -6 17 L 22 -17" fill="none" stroke={TR_GREEN} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
            {frame >= s1 ? card(byId("root"), rootP) : null}
            {TR_TREE.filter((n) => n.parent).map((n) => (frame >= s2 + n.d + 16 ? card(n, slam(frame, fps, s2, n.d + 16)) : null))}
            {frame >= stepStart(13, 5) + 62 ? (() => {
              const tp = pos(byId("tip"));
              const land = stepStart(13, 5) + 66;
              const g0 = {x: tp.x - 120, y: tp.y + TR_FAIL_NOTE.dy - TR_FAIL_NOTE.h / 2};
              const g1 = {x: tp.x - 40, y: tp.y + 29};
              const gc = {x: g0.x - 10, y: g1.y + 70};
              const drawn = linear(frame, land - 4, land + 18, 0, 1);
              const shakeK = frame - (land + 5);
              const shakeX = shakeK >= 0 && shakeK < 8 ? Math.sin(shakeK * 2.6) * 11 * (1 - shakeK / 8) : 0;
              const ringT = linear(frame, land + 3, land + 28, 0, 1);
              const idleT = Math.max(0, frame + idleF - (land + 30));
              const idleAmp = linear(frame, land + 30, land + 44, 0, 1);
              const iconScale = 1 + 0.09 * idleAmp * (0.5 - 0.5 * Math.cos((idleT / fps) * Math.PI * 2 * 1.1));
              const RED_DEEP = "#A82612";
              return (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: tp.x + TR_FAIL_NOTE.dx,
                      top: tp.y + TR_FAIL_NOTE.dy,
                      width: TR_FAIL_NOTE.w,
                      height: TR_FAIL_NOTE.h,
                      transform: `translate(-50%, -50%) translate(${shakeX}px, ${(1 - Math.min(1, failP)) * -60}px) scale(${interpolate(failP, [0, 1], [1.45, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(-3deg)`,
                      opacity: Math.min(1, Math.max(0, failP * 3)),
                    }}
                  >
                    {ringT > 0 && ringT < 1 ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: -6,
                          borderRadius: 14,
                          border: `7px solid ${CINNABAR}`,
                          transform: `scale(${1 + 0.5 * ringT})`,
                          opacity: 0.85 * (1 - ringT),
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        boxSizing: "border-box",
                        overflow: "hidden",
                        background: CINNABAR,
                        borderRadius: 8,
                        boxShadow: `0 0 0 4px #FAF5E6, 0 0 0 10px ${CINNABAR}, 0 12px 22px rgba(120,24,10,0.35), 0 0 ${28 * (1 - ringT)}px rgba(217,56,30,${0.7 * (1 - ringT)})`,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          alignSelf: "stretch",
                          flex: "none",
                          background: `repeating-linear-gradient(45deg, #FAF5E6 0px, #FAF5E6 11px, ${RED_DEEP} 11px, ${RED_DEEP} 22px)`,
                          borderRight: "3px solid #FAF5E6",
                        }}
                      />
                      <svg width={62} height={56} viewBox="0 0 60 54" style={{flex: "none", marginLeft: 14, transform: `scale(${iconScale})`, transformOrigin: "50% 60%"}}>
                        <polygon points="30,4 57,50 3,50" fill="#FAF5E6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                        <line x1={30} y1={19} x2={30} y2={34} stroke={CINNABAR} strokeWidth={7} strokeLinecap="round" />
                        <circle cx={30} cy={43} r={4} fill={CINNABAR} />
                      </svg>
                      <div
                        style={{
                          marginLeft: 14,
                          color: "#FFF8EA",
                          fontFamily: SANS,
                          fontWeight: 800,
                          fontSize: 31,
                          letterSpacing: 0.2,
                          whiteSpace: "nowrap",
                          textShadow: "0 2px 0 rgba(90,16,6,0.4)",
                        }}
                      >
                        verification failed
                      </div>
                    </div>
                  </div>
                  <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
                    {Array.from({length: 16}, (_, i) => {
                      const t = i / 15;
                      if (t > drawn) {
                        return null;
                      }
                      const x = (1 - t) * (1 - t) * g0.x + 2 * (1 - t) * t * gc.x + t * t * g1.x;
                      const y = (1 - t) * (1 - t) * g0.y + 2 * (1 - t) * t * gc.y + t * t * g1.y;
                      return <circle key={i} cx={x} cy={y} r={i === 15 ? 8 : 4.5} fill={CINNABAR} opacity={i === 15 ? 0.95 : 0.85} />;
                    })}
                  </svg>
                </>
              );
            })() : null}
          </div>
        </div>
      ) : null}
      {frame >= s6 + 6 ? (
        <div style={cssDrift(stickyOut, TR_STICKY.x, TR_STICKY.y)}>
          <BigNote x={TR_STICKY.x} y={TR_STICKY.y} width={560} tilt={3} p={stickyP} size={52}>
            It's structural verification
          </BigNote>
        </div>
      ) : null}
    </div>
  );
};

/** Beat 15: The first SSRI-integrated contract framework. Screen-to-world mapping for CAMERAS[14]: world = screen + (2340, 7500). */
const fw = (x: number, y: number) => ({x: x + 2340, y: y + 7500});
const FW_SEED_FROM = {x: 4090, y: 4830};
const FW_SEED_TO = fw(200, 960);
const FW_CONTRACT = {...fw(250, 440), w: 330, h: 250};
const FW_CALCS = [
  {...fw(604, 190), rot: -2},
  {...fw(618, 340), rot: 1.5},
  {...fw(596, 490), rot: -1},
  {...fw(612, 640), rot: 2},
];
const FW_CALC = {w: 270, h: 130};
const FW_HUB = fw(820, 415);
const FW_GH = {...fw(1330, 200), w: 340, h: 150};
const FW_CKB = {...fw(1330, 710), w: 340, h: 150};
const FW_STICKY = fw(1580, 445);
const FW_TAG_DEFAULT = fw(990, 307);
const FW_TAG_SSRI = fw(990, 553);
type FwPt = {x: number; y: number};
const fwEnd = (d: {x: number; y: number; w: number}): FwPt => ({x: d.x - d.w / 2, y: d.y});
const fwCtl = (d: {x: number; y: number; w: number}): [FwPt, FwPt, FwPt, FwPt] => {
  const e = fwEnd(d);
  return [FW_HUB, {x: FW_HUB.x + 170, y: FW_HUB.y}, {x: e.x - 190, y: e.y}, e];
};
const fwPathD = (d: {x: number; y: number; w: number}): string => {
  const [a, b, c, e] = fwCtl(d);
  return `M ${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${e.x} ${e.y}`;
};
const fwAt = (d: {x: number; y: number; w: number}, t: number): FwPt => {
  const [a, b, c, e] = fwCtl(d);
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * e.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * e.y,
  };
};

/** Four Tx Assembler cards, each with its own paper, border, tape, tilt and glyph, still in the page 12 card family. */
const FW_CALC_STYLES = [
  {bg: CARD, border: `2px solid ${INK}`, radius: 0, tape: "rgba(255,255,255,0.62)", title: INK, rot: -2.5, bar: null as string | null},
  {bg: "#FBEFD2", border: `2px solid ${CINNABAR}`, radius: 14, tape: "rgba(217,56,30,0.3)", title: CINNABAR, rot: 1.6, bar: null as string | null},
  {bg: "#E4ECF1", border: `2px solid ${COBALT}`, radius: 2, tape: "rgba(43,78,139,0.26)", title: COBALT, rot: -0.8, bar: COBALT as string | null},
  {bg: "#EFE7C9", border: `5px double ${INK}`, radius: 0, tape: "rgba(231,185,76,0.6)", title: GOLD, rot: 2.6, bar: null as string | null},
];

const FwCalcGlyph: React.FC<{k: number}> = ({k}) => (
  <svg width={210} height={30} viewBox="0 0 210 30" style={{display: "block", marginTop: 8}}>
    {k === 0 ? (
      <>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={4 + i * 26} y={4} width={20} height={20} rx={3} fill="none" stroke={INK} strokeWidth={2.5} />
        ))}
        <path d="M 90 14 L 134 14 M 124 7 L 134 14 L 124 21" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={150} y={4} width={50} height={20} rx={3} fill={INK} opacity={0.85} />
      </>
    ) : k === 1 ? (
      <>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={14 + i * 26} cy={14} r={10} fill={i === 1 ? CINNABAR : "none"} stroke={CINNABAR} strokeWidth={2.5} />
        ))}
        <path d="M 90 14 L 134 14 M 124 7 L 134 14 L 124 21" fill="none" stroke={CINNABAR} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={175} cy={14} r={13} fill={CINNABAR} opacity={0.85} />
      </>
    ) : k === 2 ? (
      <>
        {[10, 18, 26].map((h, i) => (
          <rect key={i} x={6 + i * 22} y={28 - h} width={14} height={h} fill={COBALT} opacity={0.75} />
        ))}
        <path d="M 90 14 L 134 14 M 124 7 L 134 14 L 124 21" fill="none" stroke={COBALT} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={150} y={8} width={56} height={12} rx={2} fill={COBALT} opacity={0.85} />
      </>
    ) : (
      <>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={4 + i * 26} y={4} width={20} height={20} fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray="4 3" />
        ))}
        <path d="M 90 14 L 134 14 M 124 7 L 134 14 L 124 21" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={150} y={3} width={50} height={22} fill="none" stroke={GOLD} strokeWidth={2.5} />
        <rect x={156} y={9} width={38} height={10} fill={GOLD} opacity={0.85} />
      </>
    )}
  </svg>
);

const FwCalcCard: React.FC<{k: number; p: number}> = ({k, p}) => {
  const c = FW_CALCS[k];
  const v = FW_CALC_STYLES[k];
  return (
    <div style={{position: "absolute", left: 0, top: 0, opacity: Math.min(1, Math.max(0, p * 2.5)), transform: `translateY(${(1 - Math.min(1, p)) * -46}px)`}}>
      <div
        style={{
          position: "absolute",
          left: c.x,
          top: c.y,
          width: FW_CALC.w,
          height: FW_CALC.h,
          boxSizing: "border-box",
          padding: "28px 28px",
          background: v.bg,
          border: v.border,
          borderLeft: v.bar ? `12px solid ${v.bar}` : undefined,
          borderRadius: v.radius,
          boxShadow: "0 16px 30px rgba(26,26,26,0.14)",
          transform: `translate(-50%, -50%) rotate(${v.rot}deg)`,
        }}
      >
        <div style={{position: "absolute", top: -14, left: k === 1 ? "30%" : k === 3 ? "68%" : "50%", width: 120, height: 28, marginLeft: -60, background: v.tape, transform: `rotate(${k % 2 === 0 ? -2 : 4}deg)`}} />
        {k === 3 ? <div style={{position: "absolute", top: -3, right: -3, width: 0, height: 0, borderTop: "26px solid " + PAPER, borderLeft: "26px solid rgba(26,26,26,0.25)"}} /> : null}
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: "36px", color: v.title, letterSpacing: "-0.02em", whiteSpace: "nowrap"}}>Tx Assembler</div>
        <FwCalcGlyph k={k} />
      </div>
    </div>
  );
};

/** GitHub's mark (Octicons mark-github, 16x16 grid). */
const GITHUB_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
const CKB_GREEN = "#3CC68A";

const FwDest: React.FC<{d: {x: number; y: number; w: number; h: number}; p: number; rot: number; brand: "github" | "ckb"; children: React.ReactNode}> = ({d, p, rot, brand, children}) => {
  const gh = brand === "github";
  return (
    <div style={{position: "absolute", left: 0, top: 0, opacity: Math.min(1, Math.max(0, p * 2.5)), transform: `scale(${interpolate(p, [0, 1], [0.7, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`, transformOrigin: `${d.x}px ${d.y}px`}}>
      <div
        style={{
          position: "absolute",
          left: d.x,
          top: d.y,
          width: d.w,
          height: d.h,
          boxSizing: "border-box",
          background: gh ? "#24292f" : "#0E2420",
          border: gh ? "2px solid #0d1117" : `3px solid ${CKB_GREEN}`,
          boxShadow: "0 16px 30px rgba(26,26,26,0.22)",
          transform: `translate(-50%, -50%) rotate(${rot}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div style={{position: "absolute", top: -14, left: "50%", width: 120, height: 28, marginLeft: -60, background: gh ? "rgba(255,255,255,0.4)" : "rgba(60,198,138,0.4)", transform: "rotate(-2deg)"}} />
        {gh ? (
          <svg width={70} height={70} viewBox="0 0 16 16" style={{flex: "none"}}>
            <path d={GITHUB_MARK} fill="#FFFFFF" />
          </svg>
        ) : (
          <svg width={58} height={58} viewBox="0 0 207.7 206.3" style={{flex: "none"}}>
            <polygon points="0,0 0,206.3 53.2,206.3 53.2,93.9 93.9,93.9" fill={CKB_GREEN} />
            <polygon points="154.5,0 154.5,112.4 113.8,112.4 207.7,206.3 207.7,0" fill={CKB_GREEN} />
          </svg>
        )}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: "-0.01em", color: gh ? "#FFFFFF" : "#E8FFF5", whiteSpace: "nowrap"}}>{children}</div>
      </div>
    </div>
  );
};

const Framework: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = beatStart(14);
  const next = beatStart(15);
  if (frame < at || frame >= next + 34) {
    return null;
  }
  const s1 = stepStart(14, 1);
  const s2 = stepStart(14, 2);
  const s3 = stepStart(14, 3);
  const s4 = stepStart(14, 4);
  const out = deskDrift(frame, next, {x: 1, y: -0.35});
  const stickyOut = deskDrift(frame, next + 3, {x: 1, y: 0.3});
  // Step 0: the 04 feature card flies down and shrinks into the headline spot.
  const seedU = eased(frame, at + 4, at + 34);
  const seedC = {x: (FW_SEED_FROM.x + FW_SEED_TO.x) / 2 + 220, y: FW_SEED_FROM.y + 520};
  const seed = {
    x: (1 - seedU) * (1 - seedU) * FW_SEED_FROM.x + 2 * (1 - seedU) * seedU * seedC.x + seedU * seedU * FW_SEED_TO.x,
    y: (1 - seedU) * (1 - seedU) * FW_SEED_FROM.y + 2 * (1 - seedU) * seedU * seedC.y + seedU * seedU * FW_SEED_TO.y,
  };
  const seedOp = Math.min(1, linear(frame, at + 4, at + 8, 0, 1)) * (1 - linear(frame, at + 20, at + 31, 0, 1));
  // Step 1: the Contract card, then its Tx Assemblers one by one, tied by thin forks.
  const contractP = slam(frame, fps, s1, 4);
  const calcP = (k: number) => slam(frame, fps, s1, 24 + k * 10);
  const forks = eased(frame, s1 + 58, s1 + 78);
  // Step 2: the default path draws to GitHub; Tx Assemblers ride along it.
  const gather = eased(frame, s2, s2 + 14);
  const drawA = eased(frame, s2 + 6, s2 + 46);
  const ghP = slam(frame, fps, s2, 40);
  const defaultP = slam(frame, fps, s2, 52);
  // Step 3: the SSRI path draws to the CKB chain and the switch flips on.
  const drawB = eased(frame, s3 + 4, s3 + 50);
  const ckbP = slam(frame, fps, s3, 44);
  const ssriP = slam(frame, fps, s3, 8);
  const flipAt = s3 + 34;
  const on = eased(frame, flipAt, flipAt + 10);
  const pulse = linear(frame, flipAt + 8, flipAt + 30, 0, 1);
  // Idle: the switch keeps glowing and a ring radiates every 80 frames (both zero at idle 0).
  const gp = on >= 1 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * idleF) / 80) : 0;
  const loopRing = on >= 1 && idleF > 0 ? (idleF % 80) / 80 : 0;
  const stickyP = slam(frame, fps, s4, 6);
  const chips = (d: {x: number; y: number; w: number}, draw: number, start: number, ssri: boolean) =>
    frame < start
      ? null
      : [0, 1, 2].map((i) => {
          const tt = (((frame + idleF - start) / 64 + i / 3) % 1 + 1) % 1;
          if (tt > draw) {
            return null;
          }
          const q = fwAt(d, tt);
          return (
            <g key={i} transform={`translate(${q.x} ${q.y})`} opacity={Math.min(1, tt * 8) * (1 - linear(tt, 0.9, 1, 0, 1))}>
              <rect x={-19} y={-14} width={38} height={28} rx={5} fill={CARD} stroke={ssri ? CINNABAR : INK} strokeWidth={3.5} />
              <line x1={-11} y1={-5} x2={11} y2={-5} stroke={ssri ? CINNABAR : INK} strokeWidth={3} strokeLinecap="round" />
              <line x1={-11} y1={5} x2={4} y2={5} stroke={ssri ? CINNABAR : INK} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        });
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      {seedOp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: seed.x,
            top: seed.y,
            width: 360,
            padding: "30px 16px 22px",
            boxSizing: "border-box",
            background: CARD,
            border: `2px solid ${INK}`,
            boxShadow: "0 16px 28px rgba(26,26,26,0.18)",
            transform: `translate(-50%, -50%) rotate(${5 - 11 * seedU}deg) scale(${1 - 0.4 * seedU})`,
            opacity: seedOp,
            textAlign: "center",
          }}
        >
          <div style={{position: "absolute", top: -14, left: "50%", width: 110, height: 28, marginLeft: -55, background: "rgba(255,255,255,0.62)", transform: "rotate(2deg)"}} />
          <div style={{position: "absolute", top: 12, left: 16, fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: CINNABAR}}>04</div>
          <FeatureIcon k={3} />
          <div style={{marginTop: 10, fontFamily: MARKER, fontWeight: 800, fontSize: 29, lineHeight: 1.05, color: INK}}>
            {FEATURES[3].lines.map((line) => (
              <div key={line} style={{whiteSpace: "nowrap"}}>
                {line}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {frame >= s1 + 4 ? (
        <div style={cssDrift(out, fw(900, 440).x, fw(900, 440).y)}>
          {/* Paths, forks and travelling Tx Assemblers. */}
          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            {forks > 0
              ? FW_CALCS.map((c, k) => {
                  const a = {x: FW_CONTRACT.x + FW_CONTRACT.w / 2, y: FW_CONTRACT.y};
                  const e = {x: c.x - FW_CALC.w / 2, y: c.y};
                  return (
                    <path
                      key={k}
                      d={`M ${a.x} ${a.y} C ${a.x + 40} ${a.y}, ${e.x - 40} ${e.y}, ${e.x} ${e.y}`}
                      fill="none"
                      stroke={INK}
                      strokeWidth={3}
                      opacity={0.55}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - forks}
                    />
                  );
                })
              : null}
            {gather > 0
              ? FW_CALCS.map((c, k) => {
                  const a = {x: c.x + FW_CALC.w / 2, y: c.y};
                  return (
                    <path
                      key={k}
                      d={`M ${a.x} ${a.y} C ${a.x + 30} ${a.y}, ${FW_HUB.x - 30} ${FW_HUB.y}, ${FW_HUB.x} ${FW_HUB.y}`}
                      fill="none"
                      stroke={INK}
                      strokeWidth={4}
                      opacity={0.7}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - gather}
                    />
                  );
                })
              : null}
            {gather > 0.6 ? <circle cx={FW_HUB.x} cy={FW_HUB.y} r={11} fill={INK} /> : null}
            {drawA > 0 ? (
              <>
                <path d={fwPathD(FW_GH)} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawA} />
                {drawA >= 1 ? <circle cx={fwEnd(FW_GH).x} cy={fwEnd(FW_GH).y} r={9} fill={INK} /> : null}
              </>
            ) : null}
            {drawB > 0 ? (
              <>
                <path d={fwPathD(FW_CKB)} fill="none" stroke={CINNABAR} strokeWidth={22} opacity={0.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawB} />
                <path d={fwPathD(FW_CKB)} fill="none" stroke={CINNABAR} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawB} />
                {drawB >= 1 ? <circle cx={fwEnd(FW_CKB).x} cy={fwEnd(FW_CKB).y} r={10} fill={CINNABAR} /> : null}
              </>
            ) : null}
            {chips(FW_GH, drawA, s2 + 10, false)}
            {chips(FW_CKB, drawB, s3 + 10, true)}
          </svg>
          <div style={{opacity: Math.min(1, Math.max(0, contractP * 2.5))}}>
            <CalcCard x={FW_CONTRACT.x} y={FW_CONTRACT.y - (1 - Math.min(1, contractP)) * 50} w={FW_CONTRACT.w} h={FW_CONTRACT.h} rot={-1.5}>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: INK, letterSpacing: "-0.02em"}}>Contract</div>
              {[220, 260, 180, 240, 150].map((w, i) => (
                <div key={i} style={{marginTop: i === 0 ? 22 : 15, marginLeft: i % 2 === 1 ? 24 : 0, width: w - (i % 2 === 1 ? 24 : 0), height: 10, borderRadius: 5, background: INK, opacity: 0.55}} />
              ))}
            </CalcCard>
          </div>
          {[0, 1, 2, 3].map((k) => (frame >= s1 + 24 + k * 10 ? <FwCalcCard key={k} k={k} p={calcP(k)} /> : null))}
          {frame >= s2 + 40 ? (
            <FwDest d={FW_GH} p={ghP} rot={1} brand="github">
              GitHub
            </FwDest>
          ) : null}
          {frame >= s3 + 44 ? (
            <FwDest d={FW_CKB} p={ckbP} rot={-1} brand="ckb">
              CKB chain
            </FwDest>
          ) : null}
          {frame >= s2 + 52 ? (
            <div
              style={{
                position: "absolute",
                left: FW_TAG_DEFAULT.x,
                top: FW_TAG_DEFAULT.y,
                padding: "8px 26px 10px",
                background: "#FAF5E6",
                border: "2px solid rgba(110,94,74,0.5)",
                borderRadius: 4,
                color: QUIET_INK,
                fontFamily: MARKER,
                fontWeight: 800,
                fontSize: 38,
                lineHeight: 1,
                boxShadow: "0 6px 14px rgba(26,26,26,0.12)",
                transform: `translate(-50%, -50%) translateY(${(1 - Math.min(1, defaultP)) * -40}px) scale(${interpolate(defaultP, [0, 1], [1.25, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(-3deg)`,
                opacity: Math.min(1, Math.max(0, defaultP * 2.5)),
              }}
            >
              Default
            </div>
          ) : null}
          {frame >= s3 + 8 ? (
            <div
              style={{
                position: "absolute",
                left: FW_TAG_SSRI.x,
                top: FW_TAG_SSRI.y,
                transform: `translate(-50%, -50%) translateY(${(1 - Math.min(1, ssriP)) * -50}px) scale(${interpolate(ssriP, [0, 1], [1.3, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})}) rotate(-2deg)`,
                opacity: Math.min(1, Math.max(0, ssriP * 2.5)),
              }}
            >
              {pulse > 0 && pulse < 1 ? (
                <div style={{position: "absolute", inset: -8, borderRadius: 18, border: `6px solid ${CINNABAR}`, transform: `scale(${1 + 0.18 * pulse})`, opacity: 0.85 * (1 - pulse)}} />
              ) : null}
              {loopRing > 0 ? (
                <div style={{position: "absolute", inset: -8, borderRadius: 18, border: `6px solid ${CINNABAR}`, transform: `scale(${1 + 0.2 * loopRing})`, opacity: 0.7 * (1 - loopRing) * Math.min(1, loopRing * 10)}} />
              ) : null}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "14px 26px 14px 18px",
                  background: CARD,
                  border: `5px solid ${CINNABAR}`,
                  outline: `2px solid ${CINNABAR}`,
                  outlineOffset: 3,
                  borderRadius: 16,
                  boxShadow: `0 12px 22px rgba(26,26,26,0.2), 0 0 ${(30 + 14 * gp) * on}px rgba(217,56,30,${(0.55 + 0.2 * gp) * on})`,
                }}
              >
                <div style={{position: "relative", width: 104, height: 54, flex: "none", borderRadius: 27, background: interpolateColors(on, [0, 1], ["#B8B2A2", CINNABAR]), boxShadow: "inset 0 3px 6px rgba(26,26,26,0.3)"}}>
                  <div style={{position: "absolute", top: 5, left: 5 + 50 * on, width: 44, height: 44, borderRadius: "50%", background: CARD, boxShadow: "0 3px 6px rgba(26,26,26,0.35)"}} />
                </div>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.01em", color: CINNABAR, whiteSpace: "nowrap"}}>SSRI Switch On</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {frame >= s4 + 6 ? (
        <div style={cssDrift(stickyOut, FW_STICKY.x, FW_STICKY.y)}>
          <BigNote x={FW_STICKY.x} y={FW_STICKY.y} width={580} tilt={3} p={stickyP} size={46}>
            The first
            <br />
            SSRI-integrated
            <br />
            contract framework.
          </BigNote>
        </div>
      ) : null}
    </div>
  );
};

/** Beat 16: The meaning of Cinnabar. World = screen + (2340, 8860) for CAMERAS[15]. */
const pw = (x: number, y: number) => ({x: x + 2340, y: y + 8860});

const smudgePath = (r: number, seed: number): string => {
  const n = 14;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.7 + 0.38 * Math.abs(Math.sin(seed * 3.1 + i * 1.9)) * (0.6 + 0.4 * Math.cos(seed + i * 0.7));
    return {x: Math.cos(a) * r * k, y: Math.sin(a) * r * k};
  });
  const mid = (a: {x: number; y: number}, b: {x: number; y: number}) => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M ${m0.x.toFixed(1)} ${m0.y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`;
  }
  return d + " Z";
};

/** A raw cinnabar specimen: dark brown-grey rock matrix, clusters of red prisms, and druzy patches. Drawn in a 460 x 380 box. */
type ClPrism = {x: number; y: number; deg: number; h: number; w: number};
const CL_PRISMS: ClPrism[] = [
  {x: 340, y: 160, deg: 26, h: 58, w: 26},
  {x: 150, y: 182, deg: -32, h: 58, w: 24},
  {x: 300, y: 176, deg: 12, h: 88, w: 32},
  {x: 205, y: 190, deg: -20, h: 82, w: 30},
  {x: 252, y: 182, deg: -6, h: 112, w: 38},
  {x: 104, y: 206, deg: -42, h: 38, w: 20},
  {x: 378, y: 198, deg: 40, h: 40, w: 20},
  {x: 124, y: 262, deg: -64, h: 40, w: 20},
  {x: 296, y: 262, deg: 58, h: 44, w: 24},
];
const clPrismFaces = (p: ClPrism) => {
  const t = (p.deg * Math.PI) / 180;
  const ax = Math.sin(t);
  const ay = -Math.cos(t);
  const nx = Math.cos(t);
  const ny = Math.sin(t);
  const P = (k: number, m: number) => `${(p.x + ax * k + nx * m).toFixed(1)},${(p.y + ay * k + ny * m).toFixed(1)}`;
  const hw = p.w / 2;
  const tip = p.h + p.w * 0.9;
  return {
    left: [P(0, -hw), P(0, 0), P(p.h, 0), P(p.h, -hw)].join(" "),
    right: [P(0, 0), P(0, hw), P(p.h, hw), P(p.h, 0)].join(" "),
    tl: [P(p.h, -hw), P(p.h, 0), P(tip, 0)].join(" "),
    tr: [P(p.h, 0), P(p.h, hw), P(tip, 0)].join(" "),
    ridge: `M ${P(0, 0)} L ${P(p.h, 0)} L ${P(tip, 0)}`,
    tipAt: P(tip - p.w * 0.25, -hw * 0.2),
  };
};
const CL_ROCK_BODY = "30,318 22,270 52,228 48,190 86,160 120,172 150,150 205,168 250,140 300,152 338,128 372,160 398,200 392,240 420,268 410,312 368,336 300,330 250,346 190,338 120,350 70,338";
const CL_ROCK_PLANES: {pts: string; fill: string}[] = [
  {pts: "22,270 52,228 48,190 86,160 120,172 110,230 70,262", fill: "#5B5148"},
  {pts: "120,172 150,150 205,168 250,140 240,200 170,215 110,230", fill: "#6A5F54"},
  {pts: "250,140 300,152 338,128 372,160 398,200 340,215 240,200", fill: "#4B423A"},
  {pts: "398,200 392,240 420,268 410,312 350,300 340,215", fill: "#3F372F"},
  {pts: "70,262 110,230 170,215 240,200 340,215 350,300 410,312 368,336 300,330 250,346 190,338 120,350 70,338 30,318 22,270", fill: "#52483F"},
];
const CL_DRUZY = [
  {cx: 166, cy: 278, rx: 62, ry: 28, rot: -8, n: 30, seed: 2.2},
  {cx: 338, cy: 262, rx: 46, ry: 26, rot: 12, n: 22, seed: 5.1},
  {cx: 258, cy: 314, rx: 34, ry: 13, rot: -2, n: 13, seed: 8.3},
].map((p) => ({
  ...p,
  d: smudgePath(50, p.seed),
  glints: Array.from({length: p.n}, (_, i) => {
    const ang = i * 2.399;
    const rr = Math.sqrt((i + 0.5) / p.n) * 0.82;
    const rot = (p.rot * Math.PI) / 180;
    const lx = p.rx * rr * Math.cos(ang);
    const ly = p.ry * rr * Math.sin(ang);
    return {
      x: p.cx + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: p.cy + lx * Math.sin(rot) + ly * Math.cos(rot),
      s: 3 + 2.6 * Math.abs(Math.sin(i * 7.3 + p.seed)),
      c: ["#FFD9CB", "#E8634A", "#FF8F73", "#C93A20"][i % 4],
    };
  }),
}));

const CinnabarLump: React.FC<{glow: number}> = ({glow}) => {
  const ink = {stroke: INK, strokeLinejoin: "round" as const, strokeLinecap: "round" as const};
  return (
    <svg width={636} height={525} viewBox="0 0 460 380" style={{display: "block", overflow: "visible", filter: `drop-shadow(0 0 ${34 * glow}px rgba(255,84,48,${0.95 * glow})) brightness(${1 + 0.1 * glow})`}}>
      <ellipse cx={226} cy={352} rx={208} ry={18} fill={INK} opacity={0.16} />
      {/* Rock matrix: uneven planes of dark brown-grey stone. */}
      {CL_ROCK_PLANES.map((p, i) => (
        <polygon key={i} points={p.pts} fill={p.fill} strokeWidth={3} {...ink} />
      ))}
      <polygon points={CL_ROCK_BODY} fill="rgba(217,56,30,0.16)" opacity={glow} />
      <polygon points={CL_ROCK_BODY} fill="none" strokeWidth={5} {...ink} />
      {/* Pale highlight facets and cracks on the stone. */}
      <path d="M 52 228 L 86 164 L 118 174 M 154 152 L 205 170 L 248 143 M 303 154 L 338 131" fill="none" stroke="#9A8D7C" strokeWidth={3} opacity={0.7} strokeLinecap="round" />
      <path d="M 70 300 L 96 318 L 92 340 M 372 318 L 352 296 L 362 276 M 214 206 L 226 238 L 208 262" fill="none" stroke={INK} strokeWidth={2.4} opacity={0.55} strokeLinecap="round" />
      {[[60, 296, 84, 280], [132, 330, 160, 318], [388, 300, 404, 282], [300, 340, 330, 322], [120, 196, 142, 190]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />
      ))}
      {/* Druzy patches: a carpet of tiny red crystals. */}
      {CL_DRUZY.map((p, i) => (
        <g key={i}>
          <g transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot}) scale(${p.rx / 50} ${p.ry / 50})`}>
            <path d={p.d} fill="#8E1F10" stroke={INK} strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </g>
          {p.glints.map((g, k) => (
            <path key={k} d={`M ${g.x} ${g.y - g.s} L ${g.x + g.s * 0.7} ${g.y} L ${g.x} ${g.y + g.s} L ${g.x - g.s * 0.7} ${g.y} Z`} fill={g.c} opacity={0.95} />
          ))}
        </g>
      ))}
      {/* Clusters of deep red prisms, back to front. */}
      {CL_PRISMS.map((p, i) => {
        const f = clPrismFaces(p);
        return (
          <g key={i}>
            <polygon points={f.left} fill="#B92B14" strokeWidth={3} {...ink} />
            <polygon points={f.right} fill="#7E1A0D" strokeWidth={3} {...ink} />
            <polygon points={f.tl} fill="#E8634A" strokeWidth={3} {...ink} />
            <polygon points={f.tr} fill="#D9381E" strokeWidth={3} {...ink} />
            <path d={f.ridge} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
            <polygon points={f.left} fill="#FF8A6A" opacity={0.3 * glow} />
            <polygon points={f.tl} fill="#FFC2AE" opacity={0.35 * glow} />
          </g>
        );
      })}
      {/* Glints on the prism tips. */}
      {CL_PRISMS.slice(2, 5).map((p, i) => {
        const [gx, gy] = clPrismFaces(p).tipAt.split(",").map(Number);
        return <path key={i} d={`M ${gx} ${gy - 8} L ${gx + 3.5} ${gy} L ${gx} ${gy + 8} L ${gx - 3.5} ${gy} Z`} fill="#FFE9DF" opacity={0.9} />;
      })}
    </svg>
  );
};

/** Ghost silhouettes (screen coords). Each has an edge start, a point near the rock, and a hover point just outside the CKB card's ring. */
const CL_CENTER = pw(900, 430);
const CL_CARD_C = pw(900, 440);
const CL_GHOSTS = [
  {ang: 160, sx: -120, sy: 200},
  {ang: 200, sx: -120, sy: 700},
  {ang: 110, sx: 500, sy: -180},
  {ang: 70, sx: 1300, sy: -180},
  {ang: 20, sx: 2050, sy: 200},
  {ang: 340, sx: 2050, sy: 700},
].map((g) => {
  const a = (g.ang * Math.PI) / 180;
  return {start: pw(g.sx, g.sy), near: pw(900 + 520 * Math.cos(a), 430 - 330 * Math.sin(a))};
});
/** Click 3: five ghosts keep to the left, top and lower right so they stay clear of the final sticky. */
const CL_CARD_RX = 345;
const CL_CARD_RY = 225;
const CL_WAVE_T = 66;
const CL_GHOSTS3 = [
  {ang: 60, sx: 1700, sy: -150},
  {ang: 120, sx: 500, sy: -150},
  {ang: 175, sx: -130, sy: 420},
  {ang: 240, sx: -120, sy: 850},
  {ang: 300, sx: 1500, sy: 1000},
].map((g) => ({start: pw(g.sx, g.sy), cs: Math.cos((g.ang * Math.PI) / 180), sn: Math.sin((g.ang * Math.PI) / 180)}));

/** A wavering ghost: pale translucent sheet figure with a wavy hem and hollow eyes. Drawn in a 110 x 150 box. */
const ClGhost: React.FC<{frame: number; seed: number}> = ({frame, seed}) => {
  const w = 12 * Math.sin(frame / 6 + seed * 1.7);
  const arm = 6 * Math.sin(frame / 9 + seed);
  const d = `M 8 70 C 8 -8 102 -8 102 70 L 102 138 Q 91 ${152 + w} 80 138 Q 68 ${124 - w} 55 138 Q 43 ${152 - w} 30 138 Q 19 ${124 + w} 8 138 Z`;
  return (
    <svg width={110} height={150} viewBox="0 0 110 150" style={{display: "block", overflow: "visible", filter: "drop-shadow(0 0 12px rgba(150,172,205,0.75))"}}>
      <path d={`M 10 88 Q -14 ${96 + arm} -10 ${122 + arm}`} fill="none" stroke="#6C7A8E" strokeWidth={9} strokeLinecap="round" opacity={0.55} />
      <path d={`M 100 88 Q 124 ${96 - arm} 120 ${122 - arm}`} fill="none" stroke="#6C7A8E" strokeWidth={9} strokeLinecap="round" opacity={0.55} />
      <path d={d} fill="rgba(222,231,243,0.7)" stroke="#6C7A8E" strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={38} cy={58} rx={9} ry={13} fill="#3A4659" opacity={0.75} />
      <ellipse cx={72} cy={58} rx={9} ry={13} fill="#3A4659" opacity={0.75} />
      <ellipse cx={55} cy={92} rx={8} ry={11} fill="#3A4659" opacity={0.6} />
    </svg>
  );
};

const Closing: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = beatStart(15);
  const next = beatStart(16);
  if (frame < at || frame >= next + 34) {
    return null;
  }
  const exitD = deskDrift(frame, next, {x: -1, y: -0.6});
  const s1 = stepStart(15, 1);
  const s2 = stepStart(15, 2);
  const s3 = stepStart(15, 3);
  const tSlam = (p: number, from = 1.35) => interpolate(p, [0, 1], [from, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  const R = CL_CENTER;
  // Step 1: the raw rock drops in; its seal is stamped; a small sticky.
  const dropP = slam(frame, fps, s1, 4);
  const sealP = slam(frame, fps, s1, 30);
  const dust = linear(frame, s1 + 8, s1 + 26, 0, 1);
  const smallNoteP = slam(frame, fps, s1, 50);
  const noteOut = deskDrift(frame, s2 + 2, {x: -1, y: -0.4});
  // Step 2: the rock glows red and pushes the ghosts back out.
  const glow = eased(frame, s2 + 28, s2 + 52) * (1 - 0.5 * eased(frame, s2 + 100, s2 + 128));
  const pulse = frame >= s2 + 52 ? 0.07 * Math.sin((frame + idleF - s2) / 5) * (1 - eased(frame, s2 + 100, s2 + 128)) : 0;
  const g = Math.max(0, glow + pulse);
  // Step 3: the rock turns into the CKB card; ghosts hover outside its ring.
  const rockOut = 1 - linear(frame, s3 + 6, s3 + 22, 0, 1);
  const burst = linear(frame, s3 + 2, s3 + 24, 0, 1);
  const cardP = slam(frame, fps, s3, 14);
  const finalP = slam(frame, fps, s3, 84);
  const wave0 = s3 + 30;
  const ph = frame >= wave0 ? ((frame + idleF - wave0) % CL_WAVE_T) / CL_WAVE_T : 0;
  const ghosts = CL_GHOSTS.map((gh, i) => {
    let x = gh.start.x;
    let y = gh.start.y;
    let op = 0;
    if (frame < s3) {
      const a = eased(frame, s2 + 14 + i * 4, s2 + 56 + i * 4);
      const push = eased(frame, s2 + 58 + i * 2, s2 + 104 + i * 2);
      const k = a * (1 - push);
      x += (gh.near.x - gh.start.x) * k;
      y += (gh.near.y - gh.start.y) * k;
      op = 0.85 * linear(frame, s2 + 14 + i * 4, s2 + 30 + i * 4, 0, 1) * (1 - linear(frame, s2 + 76 + i * 2, s2 + 106 + i * 2, 0, 1));
    } else if (i < CL_GHOSTS3.length) {
      // Each ghost creeps toward the card, is caught by the light wave, pushed back and flickers, then drifts in again.
      const g3 = CL_GHOSTS3[i];
      const base = 1.55 + 0.04 * (i % 3);
      const app = base - 0.25 * Math.min(1, ph / 0.45);
      let rho = app;
      let ref = app;
      if (ph < 0.8) {
        rho = Math.max(app, 1 + 0.8 * Easing.inOut(Easing.cubic)(ph / 0.8) + 0.07);
      } else {
        ref = base;
        rho = 1.87 + (base - 1.87) * Easing.inOut(Easing.cubic)((ph - 0.8) / 0.2);
      }
      const pushAmt = Math.min(1, Math.max(0, (rho - ref) / 0.35));
      const a = eased(frame, s3 + 30 + i * 4, s3 + 66 + i * 4);
      const tx = CL_CARD_C.x + CL_CARD_RX * rho * g3.cs;
      const ty = CL_CARD_C.y - CL_CARD_RY * rho * g3.sn;
      x = g3.start.x + (tx - g3.start.x) * a;
      y = g3.start.y + (ty - g3.start.y) * a;
      op = 0.85 * linear(frame, s3 + 30 + i * 4, s3 + 46 + i * 4, 0, 1) * (1 - 0.45 * pushAmt) * (1 - 0.2 * pushAmt * (0.5 + 0.5 * Math.sin((frame + idleF) * 1.9 + i)));
    }
    return {x: x + 5 * Math.sin((frame + idleF) / 17 + i), y: y + 7 * Math.sin((frame + idleF) / 12 + i * 1.3), op};
  });
  const lit = linear(frame, s3 + 14, s3 + 34, 0, 1);
  const cardGlow = lit * (0.7 + 0.3 * Math.sin((frame + idleF) / 10));
  return (
    <div style={cssDrift(exitD, CL_CARD_C.x, CL_CARD_C.y)}>
      {/* Step 2: halo, rays and rings from the rock. */}
      {g > 0.01 && frame < s3 + 24 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: R.x,
              top: R.y,
              width: 1000,
              height: 820,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse at center, rgba(255,84,48,0.5) 0%, rgba(255,84,48,0.22) 38%, rgba(255,84,48,0) 70%)",
              opacity: g * rockOut,
            }}
          />
          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            <g opacity={g * rockOut} stroke={CINNABAR} strokeWidth={7} strokeLinecap="round">
              {Array.from({length: 18}, (_, k) => {
                const a = (k * 20 * Math.PI) / 180;
                const r0 = 1.0 + 0.1 * Math.sin((frame + idleF) / 4 + k);
                return (
                  <line key={k} x1={R.x + 400 * r0 * Math.cos(a)} y1={R.y + 300 * r0 * Math.sin(a)} x2={R.x + (400 + 58 + 14 * Math.sin((frame + idleF) / 5 + k * 2)) * r0 * Math.cos(a)} y2={R.y + (300 + 44 + 10 * Math.sin((frame + idleF) / 5 + k * 2)) * r0 * Math.sin(a)} opacity={0.7} />
                );
              })}
            </g>
            {[0, 1, 2].map((q) => {
              const t = linear(frame, s2 + 48 + q * 12, s2 + 88 + q * 12, 0, 1);
              if (t <= 0 || t >= 1) {
                return null;
              }
              return <ellipse key={q} cx={R.x} cy={R.y} rx={340 + 380 * t} ry={250 + 280 * t} fill="none" stroke={CINNABAR} strokeWidth={8} opacity={(1 - t) * 0.75} />;
            })}
          </svg>
        </>
      ) : null}
      {/* Step 1-2: the rock and its seal. */}
      {frame >= s1 && rockOut > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: R.x,
              top: R.y,
              transform: `translate(-50%, -50%) translateY(${(1 - Math.min(1, dropP)) * -140}px) scale(${tSlam(dropP, 1.25) * (1 - 0.35 * (1 - rockOut))})`,
              opacity: Math.min(1, Math.max(0, dropP * 3)) * rockOut,
            }}
          >
            <CinnabarLump glow={g} />
          </div>
          {dust > 0 && dust < 1 ? (
            <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
              <g opacity={1 - dust} stroke={INK} strokeWidth={6} strokeLinecap="round">
                {[-1, 1].flatMap((side) =>
                  [0, 1, 2].map((k) => (
                    <line key={`${side}${k}`} x1={R.x + side * (300 + 30 * dust)} y1={R.y + 180 - k * 30} x2={R.x + side * (340 + 60 * dust)} y2={R.y + 180 - k * 30 + (k - 1) * 10} />
                  )),
                )}
              </g>
            </svg>
          ) : null}
          {frame >= s1 + 30 ? (
            <div
              style={{
                position: "absolute",
                left: R.x + 278,
                top: R.y + 208,
                width: 206,
                height: 206,
                boxSizing: "border-box",
                border: `12px solid ${CINNABAR}`,
                background: "rgba(247,246,241,0.94)",
                color: CINNABAR,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: CJK,
                fontWeight: 700,
                fontSize: 78,
                lineHeight: 1,
                transform: `translate(-50%, -50%) rotate(-8deg) scale(${tSlam(sealP, 1.7)})`,
                opacity: Math.min(0.96, Math.max(0, sealP * 3)) * rockOut,
              }}
            >
              朱砂
            </div>
          ) : null}
        </>
      ) : null}
      {/* Step 3: burst, then the CKB card that gives off cinnabar light. */}
      {burst > 0 && burst < 1 ? (
        <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <ellipse cx={R.x} cy={R.y} rx={120 + 300 * burst} ry={90 + 220 * burst} fill="none" stroke={CINNABAR} strokeWidth={10} opacity={1 - burst} />
        </svg>
      ) : null}
      {frame >= s3 + 14 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: CL_CARD_C.x,
              top: CL_CARD_C.y,
              width: 1100,
              height: 780,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse at center, rgba(255,84,48,0.55) 0%, rgba(255,84,48,0.24) 40%, rgba(255,84,48,0) 70%)",
              opacity: cardGlow,
            }}
          />
          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            {/* Rays. */}
            <g stroke={CINNABAR} strokeWidth={6} strokeLinecap="round" opacity={lit * 0.75}>
              {Array.from({length: 28}, (_, k) => {
                const a = (k * 360 * Math.PI) / (28 * 180);
                const r0 = 1.06;
                const r1 = 1.16 + 0.06 * Math.sin((frame + idleF) / 5 + k * 2);
                return <line key={k} x1={CL_CARD_C.x + CL_CARD_RX * r0 * Math.cos(a)} y1={CL_CARD_C.y + CL_CARD_RY * r0 * Math.sin(a)} x2={CL_CARD_C.x + CL_CARD_RX * r1 * Math.cos(a)} y2={CL_CARD_C.y + CL_CARD_RY * r1 * Math.sin(a)} opacity={0.5 + 0.3 * Math.sin(frame / 7 + k)} />;
              })}
            </g>
            <defs>
              <linearGradient id="clWaveFade" gradientUnits="userSpaceOnUse" x1={CL_CARD_C.x + 330} y1={0} x2={CL_CARD_C.x + 410} y2={0}>
                <stop offset="0" stopColor={CINNABAR} stopOpacity={1} />
                <stop offset="1" stopColor={CINNABAR} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Expanding light waves, one every wave period, with two trailing echoes. */}
            {frame >= wave0 && ph < 0.8
              ? [0, 1, 2].map((k) => {
                  const rho = 1 + 0.8 * Easing.inOut(Easing.cubic)(ph / 0.8) - 0.12 * k;
                  if (rho < 1) {
                    return null;
                  }
                  const fade = (1 - ph / 0.8) * (1 - 0.3 * k) * (1 - Math.min(1, Math.max(0, (rho - 1.35) / 0.45)) * 0.6);
                  return <ellipse key={k} cx={CL_CARD_C.x} cy={CL_CARD_C.y} rx={CL_CARD_RX * rho} ry={CL_CARD_RY * rho} fill="none" stroke="url(#clWaveFade)" strokeWidth={10 - 2 * k} opacity={0.85 * fade} />;
                })
              : null}
          </svg>
          <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible", filter: `drop-shadow(0 0 ${14 + 16 * cardGlow}px rgba(255,84,48,${0.4 + 0.4 * cardGlow}))`}}>
            <g transform={`translate(${CL_CARD_C.x} ${CL_CARD_C.y}) scale(${tSlam(cardP, 0.7)})`} opacity={Math.min(1, cardP * 3)}>
              <rect x={-218} y={-148} width={460} height={320} rx={24} fill={INK} opacity={0.16} />
              <rect x={-230} y={-160} width={460} height={320} rx={24} fill="#0E2420" stroke={CKB_GREEN} strokeWidth={7} />
              <rect x={-205} y={-135} width={410} height={270} rx={14} fill="none" stroke={CKB_GREEN} strokeWidth={2.5} opacity={0.45} />
              <svg x={-62} y={-118} width={124} height={123} viewBox="0 0 207.7 206.3">
                <polygon points="0,0 0,206.3 53.2,206.3 53.2,93.9 93.9,93.9" fill={CKB_GREEN} />
                <polygon points="154.5,0 154.5,112.4 113.8,112.4 207.7,206.3 207.7,0" fill={CKB_GREEN} />
              </svg>
              <text x={0} y={92} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={84} letterSpacing={4} fill="#E8FFF5">
                CKB
              </text>
              <rect x={-70} y={-176} width={140} height={34} fill="rgba(255,255,255,0.7)" transform="rotate(-2)" />
            </g>
          </svg>
        </>
      ) : null}
      {/* Ghosts. */}
      {ghosts.map((q, i) =>
        q.op > 0.01 ? (
          <div key={i} style={{position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -50%)", opacity: q.op}}>
            <ClGhost frame={frame + idleF} seed={i} />
          </div>
        ) : null,
      )}
      {/* Stickies. */}
      {frame >= s1 + 50 && frame < s2 + 40 ? (
        <div style={cssDrift(noteOut, pw(300, 330).x, pw(300, 330).y)}>
          <BigNote x={pw(300, 330).x} y={pw(300, 330).y} width={440} tilt={-2} p={smallNoteP} size={40}>
            In reality,
            <br />
            cinnabar drives
            <br />
            evil away.
          </BigNote>
        </div>
      ) : null}
      {frame >= s3 + 84 ? (
        <BigNote x={pw(1610, 450).x} y={pw(1610, 450).y} width={520} tilt={3} p={finalP} size={46}>
          Cinnabar fills
          <br />
          the gap, and keeps
          <br />
          the bad out.
        </BigNote>
      ) : null}
    </div>
  );
};

/** Hand-drawn loop around "not ready.", in the poster's own coordinates. */
const NOT_READY_LOOP =
  "M 150 38 C 380 -8, 840 0, 968 66 C 1050 110, 1000 204, 770 226 C 520 250, 160 240, 56 188 C -24 148, 4 70, 160 40 C 250 30, 340 32, 420 38";

/** Beat 3 (screen-fixed): "But people go away." and, on step 2, the "Because we were not ready" poster. */
const NotReady: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(2);
  const next = beatStart(3);
  if (frame < at || frame >= next + 20) {
    return null;
  }
  // Fade both out during the glide to beat 4 so nothing lingers there.
  const out = interpolate(frame, [next, next + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const head = reveal(frame, fps, at, 26);
  const posterAt = stepStart(2, 2) + 4;
  const poster = slam(frame, fps, posterAt, 0);
  const loop = interpolate(frame, [posterAt + 20, posterAt + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const wipe = interpolate(head, [0, 1], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 92,
          paddingBottom: 22,
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: COPY[2].titleSize,
          color: INK,
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
          opacity: Math.min(1, Math.max(0, head * 1.4)) * (1 - out),
          clipPath: `inset(0 ${wipe / 2}% 0 ${wipe / 2}%)`,
          transform: `translateY(${(1 - Math.min(1, head)) * 18 - 40 * out}px)`,
        }}
      >
        {COPY[2].title}
      </div>
      {frame >= posterAt ? (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 640,
            width: 1180,
            transform: `translate(-50%, -50%) translateY(${60 * out}px) scale(${interpolate(poster, [0, 1], [1.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "extend",
            }) * (1 - 0.12 * out)}) rotate(${interpolate(poster, [0, 1], [-9, -2.5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "extend",
            })}deg)`,
            opacity: Math.min(1, Math.max(0, poster * 3)) * (1 - out),
          }}
        >
          <svg
            width={1180}
            height={440}
            style={{position: "absolute", left: 26, top: 30, overflow: "visible"}}
          >
            <rect x={0} y={0} width={1180} height={440} fill="url(#halftoneRed)" />
          </svg>
          <div
            style={{
              position: "relative",
              filter: "drop-shadow(0 26px 30px rgba(26,26,26,0.22))",
            }}
          >
            <div
              style={{
                position: "relative",
                height: 440,
                boxSizing: "border-box",
                padding: "62px 90px 0",
                background: "#FBFAF6",
                clipPath: TORN,
                color: INK,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 76,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Because we were
              </div>
              <div
                style={{
                  position: "relative",
                  marginTop: 34,
                  fontFamily: SERIF,
                  fontWeight: 900,
                  fontSize: 176,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                }}
              >
                not ready.
                <svg
                  viewBox="0 0 1024 250"
                  width={940}
                  height={230}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    marginLeft: -470,
                    marginTop: -100,
                    overflow: "visible",
                  }}
                >
                  <path
                    d={NOT_READY_LOOP}
                    fill="none"
                    stroke={CINNABAR}
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - loop}
                    opacity={loop > 0 ? 1 : 0}
                  />
                </svg>
              </div>
            </div>
            {[-1, 1].map((side) => (
              <div
                key={side}
                style={{
                  position: "absolute",
                  top: -16,
                  left: side < 0 ? 40 : undefined,
                  right: side > 0 ? 40 : undefined,
                  width: 150,
                  height: 36,
                  background: "rgba(252,232,101,0.85)",
                  transform: `rotate(${side * 6}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

/**
 * Market thermometer, one desk object shared by beats 2 and 3. It sits at the right edge of the beat-3 close-up
 * (world coords found by inverting that camera) so the camera glide carries it. No numbers on it.
 * Beat 2: it pops in with the curve and its mercury rises with the red dot. Beat 3: it falls with the crowd.
 */
const THERMO_WORLD = {x: 3010, y: 747, scale: 1 / 1.9};
const Thermometer: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = stepStart(1, 1);
  const next = beatStart(3);
  if (frame < at || frame >= next + 20) {
    return null;
  }
  // Fade out during the glide to beat 4 so nothing lingers there.
  const out = interpolate(frame, [next, next + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const drop = slam(frame, fps, at, 0);
  // Beat 2: the mercury climbs exactly with the curve's red dot (same window and easing as the draw).
  const drawn = interpolate(frame, [at + 4, at + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  // Beat 3 starts from this full level and falls with the crowd, so it speeds up as the removals do.
  const fill = 0.1 + 0.8 * drawn;
  const level = fill - 0.82 * crowdGone(frame);
  const color = interpolateColors(level, [0.08, 0.9], [COBALT, CINNABAR]);
  const heat = interpolate(level, [0.45, 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lastGone = stepStart(2, 1) + goneStart(RGB_CROWD.length - 1) + 10;
  const frost = interpolate(frame, [lastGone, lastGone + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dim = interpolate(frame, [stepStart(2, 2) + 4, stepStart(2, 2) + 16], [1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const top = 60;
  const bottom = 490;
  const mercuryTop = bottom - level * (bottom - top);
  const rise = (frame * 0.8) % 18;
  const ticks = Array.from({length: 11}, (_, i) => top + 10 + i * 42);
  return (
    <div style={{position: "absolute", left: THERMO_WORLD.x, top: THERMO_WORLD.y, width: 0, height: 0, transform: `scale(${THERMO_WORLD.scale})`, transformOrigin: "0 0"}}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 140,
        height: 640,
        transform: `translateY(${(1 - Math.min(1, drop)) * -80}px) scale(${interpolate(drop, [0, 1], [1.2, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "extend",
        })}) rotate(2deg)`,
        transformOrigin: "50% 80%",
        opacity: Math.min(1, Math.max(0, drop * 2.5)) * dim * (1 - out),
      }}
    >
      <svg width={140} height={600} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <defs>
          <radialGradient id="thermoGlow">
            <stop offset="0%" stopColor={CINNABAR} stopOpacity={0.55} />
            <stop offset="100%" stopColor={CINNABAR} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={70} cy={513} r={110} fill="url(#thermoGlow)" opacity={heat * (0.85 + 0.15 * Math.sin(frame / 4))} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${52 + i * 18} ${18 - rise - i * 6} q 6 -8 0 -16 q -6 -8 0 -16`}
            fill="none"
            stroke={CINNABAR}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={heat * 0.7 * (1 - rise / 24)}
          />
        ))}
        <path
          d="M 46 44 A 24 24 0 0 1 94 44 L 94 474 A 46 46 0 1 1 46 474 Z"
          fill="#FBFAF6"
        />
        <rect x={60} y={mercuryTop} width={20} height={bottom + 20 - mercuryTop} rx={10} fill={color} />
        <circle cx={70} cy={513} r={34} fill={color} />
        <path
          d="M 46 44 A 24 24 0 0 1 94 44 L 94 474 A 46 46 0 1 1 46 474 Z"
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <line x1={54} y1={64} x2={54} y2={440} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        {ticks.map((y, i) => (
          <line
            key={y}
            x1={100}
            x2={i % 2 === 0 ? 120 : 111}
            y1={y}
            y2={y}
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <g opacity={frost}>
          {[
            {x: 58, y: 486, r: -30},
            {x: 82, y: 498, r: 25},
            {x: 66, y: 530, r: 70},
          ].map((mark) => (
            <line
              key={`${mark.x}-${mark.y}`}
              x1={mark.x - 7}
              y1={mark.y}
              x2={mark.x + 7}
              y2={mark.y}
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinecap="round"
              transform={`rotate(${mark.r} ${mark.x} ${mark.y})`}
            />
          ))}
          <g transform="translate(18 440)" stroke={COBALT} strokeWidth={3} strokeLinecap="round">
            {[0, 60, 120].map((r) => (
              <g key={r} transform={`rotate(${r})`}>
                <line x1={-16} y1={0} x2={16} y2={0} />
                <line x1={10} y1={0} x2={15} y2={-5} />
                <line x1={10} y1={0} x2={15} y2={5} />
                <line x1={-10} y1={0} x2={-15} y2={-5} />
                <line x1={-10} y1={0} x2={-15} y2={5} />
              </g>
            ))}
          </g>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 580,
          padding: "8px 16px 6px",
          background: STICKY,
          fontFamily: '"Marker Felt", "Chalkboard SE", "Bradley Hand", "Comic Neue", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 30,
          color: INK,
          transform: "rotate(-6deg)",
          boxShadow: "0 8px 14px rgba(26,26,26,0.16)",
        }}
      >
        market
      </div>
    </div>
    </div>
  );
};

/** Slide-off-the-desk exit used between beats: speeds up along dir, small spin, fades near the end. */
type Drift = {dx: number; dy: number; spin: number; opacity: number};

const deskDrift = (frame: number, start: number, dir: {x: number; y: number}): Drift => {
  const t = interpolate(frame, [start, start + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const len = Math.hypot(dir.x, dir.y) || 1;
  return {
    dx: (dir.x / len) * 720 * t,
    dy: (dir.y / len) * 720 * t,
    spin: (dir.x < 0 ? -1 : 1) * 12 * t,
    opacity:
      1 -
      interpolate(t, [0.55, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
  };
};

const svgDrift = (d: Drift, cx: number, cy: number): string =>
  `translate(${d.dx} ${d.dy}) rotate(${d.spin} ${cx} ${cy})`;

const cssDrift = (d: Drift, cx: number, cy: number): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  transformOrigin: `${cx}px ${cy}px`,
  transform: `translate(${d.dx}px, ${d.dy}px) rotate(${d.spin}deg)`,
  opacity: d.opacity,
});

/** Red crack across the journey circle at an angle (degrees), with a paper gap cut into the arc. */
const ArcCrack: React.FC<{deg: number; drawn: number}> = ({deg, drawn}) => {
  const theta = (deg * Math.PI) / 180;
  const cx = 1520 + 482 * Math.cos(theta);
  const cy = 3180 + 482 * Math.sin(theta);
  const rx = Math.cos(theta);
  const ry = Math.sin(theta);
  const tx = -Math.sin(theta);
  const ty = Math.cos(theta);
  const zig = [
    [-58, 2],
    [-34, 14],
    [-12, -12],
    [10, 12],
    [32, -10],
    [58, 6],
  ]
    .map(([along, side], i) => `${i === 0 ? "M" : "L"} ${cx + rx * along + tx * side} ${cy + ry * along + ty * side}`)
    .join(" ");
  if (drawn <= 0) {
    return null;
  }
  return (
    <>
      <line x1={cx - tx * 20} y1={cy - ty * 20} x2={cx + tx * 20} y2={cy + ty * 20} stroke={PAPER} strokeWidth={16} />
      <path
        d={zig}
        fill="none"
        stroke={CINNABAR}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
      />
    </>
  );
};

/** Beat 6 wall geometry (world). Bricks are drawn bottom row first. */
const WALL = {left: 2260, width: 240, base: 3640, rows: 13, row: 40};

/** Beat 6: a brick wall rises beside Build, the figure walks up, a ladder that is too short; then the sticky and the crack. */
const BuildWall: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const wallAt = stepStart(5, 1);
  const next = beatStart(6);
  if (frame < wallAt || frame >= next + 34) {
    return null;
  }
  // Glide into beat 7: everything slides off, away from Success (lower left).
  const wallOut = deskDrift(frame, next, {x: 1, y: -0.15});
  const noteOut = deskDrift(frame, next + 3, {x: 0.15, y: -1});
  const markOut = deskDrift(frame, next + 2, {x: 1, y: 0.1});
  const walk = interpolate(frame, [wallAt + 30, wallAt + 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const shown = linear(frame, wallAt + 30, wallAt + 36, 0, 1);
  const px = 2030 + (2140 - 2030) * walk;
  const stepping = walk > 0 && walk < 1;
  const bob = stepping ? Math.abs(Math.sin(frame * 0.9)) * -7 : 0;
  const lean = stepping ? Math.sin(frame * 0.9) * 3 : 0;
  const ladderAt = wallAt + 70;
  const ladder = slam(frame, fps, ladderAt, 0);
  const breakAt = stepStart(5, 2);
  const crack = interpolate(frame, [breakAt + 20, breakAt + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <g transform={svgDrift(wallOut, 2300, 3400)} opacity={wallOut.opacity}>
          {Array.from({length: WALL.rows}, (_, k) => {
            const at = wallAt + 4 + k * 3;
            if (frame < at) {
              return null;
            }
            const p = slam(frame, fps, at, 0);
            const y = WALL.base - (k + 1) * WALL.row;
            const widths = k % 2 === 0 ? [80, 80, 80] : [40, 80, 80, 40];
            let x = WALL.left;
            return (
              <g key={k} transform={`translate(0 ${(1 - p) * -70})`} opacity={Math.min(1, Math.max(0, p * 3))}>
                {widths.map((w, j) => {
                  const bx = x;
                  x += w;
                  return (
                    <rect
                      key={j}
                      x={bx}
                      y={y}
                      width={w}
                      height={WALL.row}
                      fill={(k + j) % 3 === 0 ? FOLDER : CARD}
                      stroke={INK}
                      strokeWidth={2.5}
                    />
                  );
                })}
              </g>
            );
          })}
          {frame >= ladderAt ? (
            <g
              transform={`translate(2222 ${WALL.base}) rotate(${interpolate(ladder, [0, 1], [34, 14], {
                extrapolateLeft: "clamp",
                extrapolateRight: "extend",
              })})`}
              opacity={Math.min(1, Math.max(0, ladder * 3))}
            >
              <line x1={-22} y1={0} x2={-22} y2={-232} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <line x1={22} y1={0} x2={22} y2={-232} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <line key={r} x1={-22} y1={-24 - r * 36} x2={22} y2={-24 - r * 36} stroke={INK} strokeWidth={5} />
              ))}
            </g>
          ) : null}
          {shown > 0 ? (
            <g transform={`translate(${px} ${WALL.base + bob}) rotate(${lean}) scale(1.5)`} opacity={shown}>
              <circle cx={0} cy={-84} r={13} fill={INK} />
              <path
                d="M-23 -64 C-26 -40 -20 -12 -17 0 L17 0 C20 -12 26 -40 23 -64 C15 -73 0 -75 0 -75 C0 -75 -15 -73 -23 -64 Z"
                fill={INK}
              />
            </g>
          ) : null}
        </g>
        <g transform={svgDrift(markOut, 1604, 3655)} opacity={markOut.opacity}>
          <ArcCrack deg={80} drawn={crack} />
        </g>
      </svg>
      {frame >= breakAt + 6 ? (
        <div style={cssDrift(noteOut, 1500, 3330)}>
          <BigNote x={1500} y={3330} width={400} tilt={2.5} p={slam(frame, fps, breakAt + 6, 0)} size={46}>
            Not enough SDKs
          </BigNote>
        </div>
      ) : null}
      <div style={cssDrift(markOut, 1650, 3770)}>
        <Stamp text="BREAK" x={1650} y={3770} frame={frame} fps={fps} at={breakAt} delay={30} />
      </div>
    </div>
  );
};

/** Beat 7 road geometry (world): runs left from a start line beside Success to a finish flag. */
const ROAD = {start: 1250, end: 470, top: 3700, bottom: 3790};
/** The chasm across the road, about two thirds of the way to the flag. */
const CHASM_X = 735;
const CHASM_YS = [3664, 3684, 3704, 3724, 3744, 3764, 3784, 3804, 3826];
const CHASM_JAG = [0, 8, -6, 10, -4, 9, -7, 5, 0];
const CHASM_HALF = [1, 15, 26, 33, 36, 33, 26, 15, 1];
/** Near-side crowd, front of the pile first (arrival order). y is the feet line. */
const ROAD_CROWD: {x: number; y: number; s: number; lean: number; mill?: boolean}[] = [
  {x: 812, y: 3724, s: 1.0, lean: -10},
  {x: 838, y: 3790, s: 1.12, lean: -7},
  {x: 884, y: 3752, s: 0.95, lean: -4},
  {x: 930, y: 3718, s: 1.05, lean: 0},
  {x: 952, y: 3798, s: 1.18, lean: -2},
  {x: 990, y: 3756, s: 1.0, lean: 1, mill: true},
  {x: 1030, y: 3720, s: 1.15, lean: -1},
  {x: 1062, y: 3796, s: 0.98, lean: 2},
  {x: 1098, y: 3748, s: 1.08, lean: 0, mill: true},
  {x: 1138, y: 3718, s: 1.0, lean: 3},
  {x: 1146, y: 3800, s: 1.12, lean: 0},
  {x: 1176, y: 3758, s: 0.95, lean: 2},
];
/** The very few who made it across, beside the flag. */
const ROAD_FAR = [
  {x: 568, y: 3756, s: 1.1, at: 128},
  {x: 628, y: 3730, s: 1.0, at: 136},
];
const PEBBLES = [
  {x: 722, y: 3700, r: 5, at: 56},
  {x: 752, y: 3788, r: 4, at: 60},
  {x: 740, y: 3745, r: 6, at: 66},
];

/**
 * One road figure. `ghost` draws it unfinished: a broken dashed outline over an almost clear body,
 * so what is behind it (the chasm, the road) stays visible. `gap` shifts where the outline breaks.
 */
const Walker: React.FC<{
  x: number;
  y: number;
  scale: number;
  bob: number;
  lean: number;
  opacity: number;
  ghost?: boolean;
  gap?: number;
}> = ({x, y, scale, bob, lean, opacity, ghost, gap = 0}) => {
  const body = "M-23 -64 C-26 -40 -20 -12 -17 0 L17 0 C20 -12 26 -40 23 -64 C15 -73 0 -75 0 -75 C0 -75 -15 -73 -23 -64 Z";
  const outline = {
    fill: PAPER,
    fillOpacity: 0.16,
    stroke: INK,
    strokeWidth: 2.6,
    strokeDasharray: "8 5 8 5 8 5 8 5 8 26",
    strokeDashoffset: gap,
    strokeLinecap: "round" as const,
  };
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${lean}) scale(${scale})`} opacity={opacity}>
      {ghost ? (
        <>
          <circle cx={0} cy={-84} r={13} {...outline} strokeDasharray="6 5" strokeDashoffset={gap * 0.5} />
          <path d={body} {...outline} />
        </>
      ) : (
        <>
          <circle cx={0} cy={-84} r={13} fill={INK} />
          <path d={body} fill={INK} />
        </>
      )}
    </g>
  );
};

/** Beat 7: a road split by a chasm, a crowd stuck at its edge and very few at the flag; then the sticky and the cut loop back to Discover. */
const SuccessRoad: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const roadAt = stepStart(6, 1);
  const next = beatStart(7);
  if (frame < roadAt || frame >= next + 34) {
    return null;
  }
  // Glide into beat 8 (to the right): everything slides off to the left.
  const roadOut = deskDrift(frame, next, {x: -1, y: 0.2});
  const noteOut = deskDrift(frame, next + 3, {x: -0.4, y: -1});
  const markOut = deskDrift(frame, next + 2, {x: -1, y: -0.15});
  const drawn = interpolate(frame, [roadAt + 4, roadAt + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const startLine = slam(frame, fps, roadAt + 4, 0);
  const pole = interpolate(frame, [roadAt + 30, roadAt + 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cloth = interpolate(frame, [roadAt + 40, roadAt + 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });
  const mid = (ROAD.top + ROAD.bottom) / 2;
  const reach = ROAD.start - (ROAD.start - ROAD.end) * drawn;
  const dashes = Array.from({length: 13}, (_, i) => ROAD.start - 60 - i * 56).filter((x) => x - 28 > ROAD.end);
  const poleTop = mid - 190;
  const breakAt = stepStart(6, 2);
  const crack = interpolate(frame, [breakAt + 20, breakAt + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // The road splits: a short jolt, then the chasm opens with an eased width.
  const open = interpolate(frame, [roadAt + 52, roadAt + 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });
  const joltT = frame - (roadAt + 50);
  const jolt = joltT >= 0 && joltT < 14 ? Math.sin(joltT * 2.4) * 7 * (1 - joltT / 14) : 0;
  const chasmPath =
    CHASM_YS.map((y, i) => `${i === 0 ? "M" : "L"} ${CHASM_X + CHASM_JAG[i] - CHASM_HALF[i] * open} ${y}`).join(" ") +
    " " +
    CHASM_YS.map((_, j) => {
      const i = CHASM_YS.length - 1 - j;
      return `L ${CHASM_X + CHASM_JAG[i] + CHASM_HALF[i] * open} ${CHASM_YS[i]}`;
    }).join(" ") +
    " Z";
  const walkIn = (at: number, dist: number, len: number) =>
    interpolate(frame, [at, at + len], [dist, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const people: {key: string; x: number; y: number; s: number; bob: number; lean: number; opacity: number; ghost?: boolean; gap?: number}[] = [];
  ROAD_CROWD.forEach((c, i) => {
    const at = roadAt + 72 + i * 4;
    if (frame < at) {
      return;
    }
    const off = walkIn(at, 230, 26);
    const moving = off > 1;
    const idle = (frame + idleF - at) * 0.13 + i * 1.7;
    people.push({
      key: `c${i}`,
      ghost: true,
      gap: (i * 37) % 96,
      x: c.x + off + (c.mill && !moving ? Math.sin(idle * 0.6) * 6 : 0),
      y: c.y,
      s: c.s,
      bob: moving ? -Math.abs(Math.sin(frame * 0.9 + i)) * 6 : Math.sin(idle) * 1.5,
      lean: moving ? -3 + Math.sin(frame * 0.9 + i) * 2 : c.lean + Math.sin(idle * 0.8) * (c.lean < -5 ? 2.5 : 1),
      opacity: Math.min(1, (frame - at) / 8),
    });
  });
  ROAD_FAR.forEach((c, i) => {
    const at = roadAt + c.at;
    if (frame < at) {
      return;
    }
    const off = walkIn(at, 60, 20);
    people.push({
      key: `f${i}`,
      x: c.x + off,
      y: c.y,
      s: c.s,
      bob: off > 1 ? -Math.abs(Math.sin(frame * 0.9 + i)) * 5 : 0,
      lean: off > 1 ? -3 : 0,
      opacity: Math.min(1, (frame - at) / 8),
    });
  });
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <g transform={svgDrift(roadOut, 860, mid)} opacity={roadOut.opacity}>
          <g transform={`translate(${jolt} ${jolt * 0.4})`}>
          {drawn > 0 ? (
            <>
              <line x1={ROAD.start} y1={ROAD.top} x2={reach} y2={ROAD.top} stroke={INK} strokeWidth={4} strokeLinecap="round" />
              <line x1={ROAD.start} y1={ROAD.bottom} x2={reach} y2={ROAD.bottom} stroke={INK} strokeWidth={4} strokeLinecap="round" />
              {dashes
                .filter((x) => x - 28 >= reach)
                .map((x) => (
                  <line key={x} x1={x} y1={mid} x2={x - 28} y2={mid} stroke="#BDB8AA" strokeWidth={5} strokeLinecap="round" />
                ))}
            </>
          ) : null}
          {frame >= roadAt + 4 ? (
            <g
              transform={`translate(1222 ${mid}) scale(${interpolate(startLine, [0, 1], [0.4, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "extend",
              })})`}
              opacity={Math.min(1, Math.max(0, startLine * 3))}
            >
              {Array.from({length: 12}, (_, i) => (
                <rect
                  key={i}
                  x={(i % 2) * 15 - 15}
                  y={Math.floor(i / 2) * 15 - 45}
                  width={15}
                  height={15}
                  fill={(i + Math.floor(i / 2)) % 2 === 0 ? INK : "#FBFAF6"}
                  stroke={INK}
                  strokeWidth={1.5}
                />
              ))}
            </g>
          ) : null}
          {pole > 0 ? (
            <>
              <line x1={500} y1={mid + 20} x2={500} y2={mid + 20 - (mid + 20 - poleTop) * pole} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <circle cx={500} cy={mid + 20 - (mid + 20 - poleTop) * pole} r={7} fill={INK} />
            </>
          ) : null}
          {cloth > 0 ? (
            <g transform={`translate(500 ${poleTop + 8 + (1 - Math.min(1, cloth)) * 120})`}>
              <path
                d={`M 0 0 C 30 ${-10 * cloth} 60 ${10 * cloth} ${96 * Math.min(1.1, cloth)} 6 L ${96 * Math.min(1.1, cloth)} 62 C 60 ${70 + 8 * cloth} 30 ${52 - 6 * cloth} 0 60 Z`}
                fill={CINNABAR}
                stroke={INK}
                strokeWidth={3}
                strokeLinejoin="round"
              />
            </g>
          ) : null}
          {open > 0 ? (
            <g>
              <path d={chasmPath} fill={INK} stroke={PAPER} strokeWidth={6} strokeLinejoin="miter" />
              {[0.3, 0.5, 0.7].map((k) => (
                <line
                  key={k}
                  x1={CHASM_X - 14 * open}
                  y1={3700 + k * 90}
                  x2={CHASM_X + 12 * open}
                  y2={3706 + k * 90}
                  stroke="#4A4740"
                  strokeWidth={2}
                />
              ))}
              <path
                d={`M ${CHASM_X - 20} 3668 l -16 -14 l -8 -16 M ${CHASM_X + 18} 3820 l 14 12 l 4 16 M ${CHASM_X + 14} 3672 l 18 -10`}
                stroke={INK}
                strokeWidth={2}
                fill="none"
                strokeDasharray={120}
                strokeDashoffset={120 * (1 - open)}
                strokeLinecap="round"
              />
              <path
                d={`M ${CHASM_X - 26 * open} 3700 l -12 -9 M ${CHASM_X + 24 * open} 3700 l 10 -10 M ${CHASM_X - 22 * open} 3790 l -10 9 M ${CHASM_X + 26 * open} 3790 l 12 8`}
                stroke={INK}
                strokeWidth={4}
                strokeLinecap="round"
              />
            </g>
          ) : null}
          {PEBBLES.map((p) => {
            const at = roadAt + p.at;
            if (frame < at || frame > at + 24) {
              return null;
            }
            const k = (frame - at) / 24;
            return (
              <circle key={p.at} cx={p.x + (CHASM_X - p.x) * k} cy={p.y + 70 * k * k} r={p.r * (1 - 0.6 * k)} fill={INK} opacity={1 - k} />
            );
          })}
          {people
            .sort((p, q) => p.y - q.y)
            .map((p) => (
              <Walker key={p.key} x={p.x} y={p.y} scale={p.s} bob={p.bob} lean={p.lean} opacity={p.opacity} ghost={p.ghost} gap={p.gap} />
            ))}
          </g>
        </g>
        <g transform={svgDrift(markOut, 1038, 3180)} opacity={markOut.opacity}>
          <ArcCrack deg={180} drawn={crack} />
        </g>
      </svg>
      {frame >= breakAt + 6 ? (
        <div style={cssDrift(noteOut, 1500, 3300)}>
          <BigNote x={1500} y={3300} width={420} tilt={-2.5} p={slam(frame, fps, breakAt + 6, 0)} size={46}>
            Success is rarely seen
          </BigNote>
        </div>
      ) : null}
      <div style={cssDrift(markOut, 1370, 3540)}>
        <Stamp text="BREAK" x={1370} y={3540} frame={frame} fps={fps} at={breakAt} delay={30} />
      </div>
    </div>
  );
};

const MARKER = '"Marker Felt", "Chalkboard SE", "Bradley Hand", "Comic Neue", ui-sans-serif, system-ui, sans-serif';

/** Beat 8 needs stickies, beside Learn and Build. */
const AI_NOTES = [
  {x: 2340, y: 2870, tilt: 2.5, thing: "DOCs"},
  {x: 2340, y: 3490, tilt: -2, thing: "SDKs"},
];
const AI_CAPTION = {x: 1490, y: 3180};

/** Beat 8 (world): red loops on Learn and Build with a pen caption, then the two needs stickies and their AI-friendly rewrite. */
const NeedsAi: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const s = (k: number) => stepStart(7, k);
  const next = beatStart(8);
  if (frame < s(1) || frame >= next + 34) {
    return null;
  }
  const ease = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  // Glide into beat 9 (far to the right): loops and caption slide off left, stickies off top and bottom.
  const loopOut = deskDrift(frame, next, {x: -1, y: -0.2});
  const captionOut = deskDrift(frame, next + 2, {x: -1, y: 0.15});
  const loops = [
    {card: CIRCLE.learn, drawn: ease(s(1) + 8, s(1) + 30), rot: 3},
    {card: CIRCLE.build, drawn: ease(s(1) + 34, s(1) + 56), rot: -4},
  ];
  const write = linear(frame, s(1) + 58, s(1) + 84, 0, 1);
  const pointer = ease(s(1) + 82, s(1) + 96);
  // Step 6 (Learn < Build) clears the middle of the circle.
  const capFade = 1 - ease(s(6) + 2, s(6) + 16);
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <g transform={svgDrift(loopOut, 1880, 3180)} opacity={loopOut.opacity}>
          {loops.map((l) =>
            l.drawn > 0 ? (
              <path
                key={l.card.y}
                transform={`translate(${l.card.x} ${l.card.y}) rotate(${l.rot})`}
                d={JOURNEY_LOOP}
                fill="none"
                stroke={CINNABAR}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - l.drawn}
              />
            ) : null,
          )}
        </g>
        {pointer > 0 ? (
          <g transform={svgDrift(captionOut, AI_CAPTION.x, AI_CAPTION.y)} opacity={captionOut.opacity * capFade}>
            {[
              {d: "M 1790 3128 Q 1852 3070 1846 2994", head: "M 1832 3008 L 1846 2992 L 1860 3006"},
              {d: "M 1790 3226 Q 1852 3290 1846 3366", head: "M 1832 3352 L 1846 3368 L 1860 3354"},
            ].map((a) => (
              <g key={a.d}>
                <path
                  d={a.d}
                  fill="none"
                  stroke={CINNABAR}
                  strokeWidth={4}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - pointer}
                />
                <path
                  d={a.head}
                  fill="none"
                  stroke={CINNABAR}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={pointer > 0.9 ? 1 : 0}
                />
              </g>
            ))}
          </g>
        ) : null}
      </svg>
      {write > 0 && capFade > 0 ? (
        <div style={cssDrift(captionOut, AI_CAPTION.x, AI_CAPTION.y)}>
          <div
            style={{
              position: "absolute",
              left: AI_CAPTION.x,
              top: AI_CAPTION.y,
              transform: "translate(-50%, -50%) rotate(-3deg)",
              whiteSpace: "nowrap",
              fontFamily: MARKER,
              fontWeight: 800,
              fontSize: 56,
              color: CINNABAR,
              clipPath: `inset(-30% ${(1 - write) * 100}% -30% -2%)`,
              opacity: capFade,
            }}
          >
            The problem lies on them.
          </div>
        </div>
      ) : null}
      {AI_NOTES.map((n, i) => {
        const at = s(2 + i) + 4;
        if (frame < at) {
          return null;
        }
        const out = deskDrift(frame, next + 4 + i * 3, {x: 0.2, y: i === 0 ? -1 : 1});
        const grow = ease(s(5) + 18 + i * 6, s(5) + 36 + i * 6);
        const hl = interpolate(frame, [s(5) + 36 + i * 6, s(5) + 50 + i * 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        });
        return (
          <div key={n.thing} style={cssDrift(out, n.x, n.y)}>
            <BigNote x={n.x} y={n.y} width={420} tilt={n.tilt} p={slam(frame, fps, at, 0)} size={52}>
              <div>We need more</div>
              {grow > 0 ? (
                <div style={{height: 54 * grow, overflow: grow < 1 ? "hidden" : "visible"}}>
                  <span style={{position: "relative", display: "inline-block", opacity: grow}}>
                    <span
                      style={{
                        position: "absolute",
                        left: -8,
                        right: -8,
                        top: "16%",
                        bottom: "4%",
                        background: CINNABAR,
                        opacity: 0.72,
                        borderRadius: 6,
                        transformOrigin: "0 50%",
                        transform: `rotate(-1.5deg) scaleX(${hl})`,
                      }}
                    />
                    <span style={{position: "relative"}}>AI-friendly</span>
                  </span>
                </div>
              ) : null}
              <div>{n.thing}</div>
            </BigNote>
          </div>
        );
      })}
    </div>
  );
};

/** Beat 8 steps 4-5 (screen): "But in AI era" slams over a dimmed circle, then shrinks to a header. */
const AiEra: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = stepStart(7, 4);
  const shrinkAt = stepStart(7, 5);
  const next = beatStart(8);
  if (frame < at || frame >= next + 24) {
    return null;
  }
  const p = slam(frame, fps, at, 6);
  const dim = linear(frame, at, at + 14, 0, 1) * (1 - eased(frame, shrinkAt, shrinkAt + 22));
  const h = eased(frame, shrinkAt, shrinkAt + 24);
  const under = interpolate(frame, [at + 20, at + 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const burst = slam(frame, fps, at, 36);
  const out = eased(frame, next, next + 18);
  const scaleIn = interpolate(p, [0, 1], [1.3, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <AbsoluteFill style={{background: PAPER, opacity: 0.8 * dim}} />
      {frame >= at + 6 ? (
        <div
          style={{
            position: "absolute",
            left: 960 + (64 - 960) * h,
            top: 500 + (78 - 500) * h,
            transformOrigin: "0 0",
            transform: `translate(${-420 * out}px, ${-220 * out}px) translate(${-50 * (1 - h)}%, ${-50 * (1 - h)}%) scale(${1 - 0.58 * h})`,
            opacity: Math.min(1, Math.max(0, p * 2.5)) * (1 - out),
            whiteSpace: "nowrap",
          }}
        >
          <div style={{position: "relative", transformOrigin: "50% 50%", transform: `scale(${scaleIn}) rotate(${-2 * (1 - h)}deg)`}}>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 210,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: INK,
                paddingBottom: "0.1em",
              }}
            >
              But in AI era
            </div>
            <svg
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                left: "-2%",
                width: "104%",
                bottom: -16,
                height: 46,
                overflow: "visible",
                clipPath: `inset(-20% ${(1 - under) * 100}% -20% 0)`,
              }}
            >
              <path
                d="M 8 34 C 180 18 420 26 620 20 C 780 15 900 22 992 12 L 990 32 C 880 40 760 36 600 42 C 400 48 200 44 12 52 Z"
                fill={CINNABAR}
              />
            </svg>
            {frame >= at + 36 ? (
              <svg
                width={150}
                height={150}
                viewBox="-75 -75 150 150"
                style={{
                  position: "absolute",
                  right: -120,
                  top: -64,
                  transform: `scale(${interpolate(burst, [0, 1], [0.3, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"})})`,
                  opacity: Math.min(1, Math.max(0, burst * 3)),
                }}
              >
                {[-160, -125, -90, -55, -20, 15, 50].map((deg) => {
                  const a = (deg * Math.PI) / 180;
                  return (
                    <line
                      key={deg}
                      x1={24 * Math.cos(a)}
                      y1={24 * Math.sin(a)}
                      x2={64 * Math.cos(a)}
                      y2={64 * Math.sin(a)}
                      stroke={CINNABAR}
                      strokeWidth={9}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            ) : null}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Beat 8 step 6 (screen): a big "But", then "Learn < Build" in the middle of the dimmed circle. */
const LTB = {but: {x: 820, y: 350}, y: 640, learn: {x: 628, w: 210, h: 84}, sign: {x: 838, w: 150}, build: {x: 1058, w: 230, h: 96}};
const LessBuild: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const at = stepStart(7, 6);
  const next = beatStart(8);
  if (frame < at || frame >= next + 24) {
    return null;
  }
  const butP = slam(frame, fps, at, 4);
  const dim = linear(frame, at, at + 16, 0, 1);
  const out = eased(frame, next, next + 18);
  const under = eased(frame, at + 20, at + 38);
  const learnP = slam(frame, fps, at, 34);
  const buildP = slam(frame, fps, at, 46);
  const draw = eased(frame, at + 58, at + 88);
  const draw2 = eased(frame, at + 66, at + 90);
  const thump = slam(frame, fps, at, 90);
  const shock = linear(frame, at + 90, at + 108, 0, 1);
  const grow = eased(frame, at + 96, at + 118);
  // Idle (zero at idle 0): the sign and the Build chip breathe gently.
  const gp = 0.5 - 0.5 * Math.cos((2 * Math.PI * idleF) / 80);
  const pop = (p: number) => interpolate(p, [0, 1], [1.35, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  const group = {transform: `translate(${-420 * out}px, ${-220 * out}px)`, opacity: 1 - out};
  const signScale = (thump < 1 ? interpolate(thump, [0, 1], [1.28, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"}) : 1) * (1 + 0.05 * gp);
  const chip = (x: number, w: number, h: number, p: number, extra: React.CSSProperties, label: string, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: x - w / 2,
        top: LTB.y - h / 2,
        width: w,
        height: h,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 48,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        opacity: Math.min(1, Math.max(0, p * 3)),
        ...extra,
      }}
    >
      {label}
    </div>
  );
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <AbsoluteFill style={{background: PAPER, opacity: 0.93 * dim * (1 - out)}} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, ...group}}>
        {frame >= at + 6 ? (
          <div
            style={{
              position: "absolute",
              left: LTB.but.x,
              top: LTB.but.y,
              transform: `translate(-50%, -50%) scale(${pop(butP)}) rotate(-3deg)`,
              opacity: Math.min(1, Math.max(0, butP * 2.5)),
              whiteSpace: "nowrap",
            }}
          >
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 210, letterSpacing: "-0.04em", lineHeight: 1, color: INK, paddingBottom: "0.1em"}}>But</div>
            <svg
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              style={{position: "absolute", left: "-4%", width: "108%", bottom: -6, height: 40, overflow: "visible", clipPath: `inset(-20% ${(1 - under) * 100}% -20% 0)`}}
            >
              <path d="M 8 34 C 180 18 420 26 620 20 C 780 15 900 22 992 12 L 990 32 C 880 40 760 36 600 42 C 400 48 200 44 12 52 Z" fill={CINNABAR} />
            </svg>
          </div>
        ) : null}
        {frame >= at + 34
          ? chip(
              LTB.learn.x,
              LTB.learn.w,
              LTB.learn.h,
              learnP,
              {background: "#E4ECF1", border: `3px solid ${COBALT}`, color: COBALT, borderRadius: 6, boxShadow: "0 8px 16px rgba(26,26,26,0.12)", transform: `scale(${pop(learnP) * (1 - 0.04 * grow)}) rotate(-1.5deg)`},
              "Learn",
              "learn",
            )
          : null}
        {frame >= at + 46
          ? chip(
              LTB.build.x,
              LTB.build.w,
              LTB.build.h,
              buildP,
              {
                background: CINNABAR,
                border: `3px solid ${INK}`,
                color: "#FFF8EE",
                borderRadius: 6,
                boxShadow: `0 0 ${28 * grow + 18 * gp * grow}px rgba(217,56,30,${0.55 * grow}), 0 10px 18px rgba(26,26,26,0.18)`,
                transform: `scale(${pop(buildP) * (1 + 0.1 * grow + 0.03 * gp * grow)}) rotate(1.2deg)`,
              },
              "Build",
              "build",
            )
          : null}
        {draw > 0 ? (
          <svg
            width={LTB.sign.w}
            height={130}
            viewBox="0 0 150 130"
            style={{position: "absolute", left: LTB.sign.x - LTB.sign.w / 2, top: LTB.y - 65, overflow: "visible", transform: `scale(${signScale})`, transformOrigin: "50% 50%"}}
          >
            <path d="M 122 14 Q 70 38 26 66 Q 74 92 124 118" fill="none" stroke={CINNABAR} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            <path d="M 118 20 Q 72 42 34 66 Q 76 88 118 112" fill="none" stroke="#8E1F0C" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
            {shock > 0 && shock < 1 ? (
              <g opacity={1 - shock} stroke={CINNABAR} strokeWidth={6} strokeLinecap="round">
                {[-150, -180, -210].map((deg) => {
                  const a = (deg * Math.PI) / 180;
                  const r0 = 34 + 20 * shock;
                  return <line key={deg} x1={26 + r0 * Math.cos(a)} y1={66 + r0 * Math.sin(a)} x2={26 + (r0 + 20) * Math.cos(a)} y2={66 + (r0 + 20) * Math.sin(a)} />;
                })}
              </g>
            ) : null}
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Beat 9: the AI chip core (world, upper center of the beat-9 view) and its steady pulse. */
const CORE = {x: 4560, y: 3040};
const CORE_P = 40;
/** Pulse phase is anchored so the step-2 hold lands with the wave mid-sweep across the rows. */
const coreBase = (): number => stepStart(8, 3) - 19 - CORE_P * 10;
const corePhase = (frame: number): number => (frame - coreBase() + CORE_P * 1000) % CORE_P;
/** Radius of this beat's light wave: leaves the core rim and sweeps out across the rows. */
const waveR = (ph: number): number => 150 + (ph / CORE_P) * 760;

/** Chip traces for one side, from the red center out to the die edge pads; rotated for the other three sides. */
const CHIP_TRACES = [-30, -18, -6, 6, 18, 30].map((x) => {
  const px = Number((x * 2.3).toFixed(1));
  return {d: `M ${x} -42 L ${x} -56 L ${px} -74 L ${px} -86`, px};
});

/** A newsprint CPU: pinned package, corner dot, die with circuit traces, glowing red center with the AI mark. */
const ChipDrawing: React.FC<{glow: number; ph: number; live: number}> = ({glow, ph, live}) => {
  // Each beat sends a light pulse along every trace, from the center out to the pins.
  const u = ph / 16;
  return (
    <g transform="rotate(-3)">
      {[0, 90, 180, 270].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          {Array.from({length: 8}, (_, k) => (
            <rect key={k} x={-91 + k * 26 - 6} y={-150} width={12} height={34} rx={2} fill={CARD} stroke={INK} strokeWidth={2.5} />
          ))}
        </g>
      ))}
      <rect x={-120} y={-120} width={240} height={240} rx={16} fill={INK} />
      <rect x={-112} y={-112} width={224} height={224} rx={12} fill="none" stroke="#5A564E" strokeWidth={2} />
      <circle cx={-99} cy={-99} r={7} fill={PAPER} opacity={0.85} />
      <rect x={-86} y={-86} width={172} height={172} rx={6} fill={CARD} stroke={INK} strokeWidth={3} />
      {[0, 90, 180, 270].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          {CHIP_TRACES.map((t) => (
            <g key={t.px}>
              <path d={t.d} fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
              <circle cx={t.px} cy={-81} r={3.5} fill={INK} />
              {live > 0 && u < 1 ? (
                <path
                  d={t.d}
                  fill="none"
                  stroke={CINNABAR}
                  strokeWidth={5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="0.14 2"
                  strokeDashoffset={-u}
                  opacity={live * (1 - 0.4 * u)}
                />
              ) : null}
            </g>
          ))}
        </g>
      ))}
      <rect x={-42} y={-42} width={84} height={84} rx={6} fill={CINNABAR} stroke={INK} strokeWidth={3} />
      <rect x={-42} y={-42} width={84} height={84} rx={6} fill="#FF9A6B" opacity={0.6 * glow} />
      <path d="M 40 -6 L 40 40 L -6 40 Z" fill="url(#halftone)" opacity={0.3} />
      <text x={0} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={PAPER} letterSpacing="0.02em">
        AI
      </text>
    </g>
  );
};

type Pose = "up" | "palms" | "bow" | "still";

/** Congregation rows: arcs below the core, front row nearest (smaller, seated lower), back rows larger. */
const FLOCK_ROWS = [
  {r: 325, n: 6, s: 0.95},
  {r: 440, n: 7, s: 1.12},
  {r: 580, n: 7, s: 1.3},
];
const FLOCK_TEAM = [2, 9, 16];
const FLOCK = FLOCK_ROWS.flatMap((row, k) =>
  Array.from({length: row.n}, (_, j) => {
    const i = FLOCK_ROWS.slice(0, k).reduce((sum, r) => sum + r.n, 0) + j;
    const a = ((18 + (144 * (j + 0.5)) / row.n) * Math.PI) / 180;
    const s = row.s * (1 + (((j * 37 + k * 11) % 5) - 2) * 0.04);
    const x = CORE.x + row.r * Math.cos(a);
    const y = CORE.y + row.r * Math.sin(a);
    const pose: Pose = i % 5 === 1 ? "up" : i % 5 === 3 ? "palms" : i % 7 === 4 ? "bow" : "still";
    // Mid-body point and its distance from the core, for the light wave and the motes.
    const mx = x;
    const my = y - 70 * s;
    return {i, k, j, x, y, s, pose, toward: -Math.cos(a), team: FLOCK_TEAM.includes(i), d: Math.hypot(mx - CORE.x, my - CORE.y), mx, my};
  }),
);

const BELIEVER_BODY =
  "M-23 -64 C-26 -40 -20 -12 -17 0 L17 0 C20 -12 26 -40 23 -64 C15 -73 0 -75 0 -75 C0 -75 -15 -73 -23 -64 Z";

/**
 * One member of the congregation, drawn at the feet point. toward: -1..1, the core's side.
 * cheer (0..1, from the passing wave): both arms go up, a hop, the head tips back, confetti ticks at the hands.
 */
const Believer: React.FC<{s: number; lean: number; toward: number; pose: Pose; lit: number; team: number; seed: number}> = ({
  s,
  lean,
  toward,
  pose,
  lit,
  team,
  seed,
}) => {
  const c = lit;
  const extra = team > 0 ? 1 : 0;
  const color = interpolateColors(lit, [0, 1], [INK, "#7A3320"]);
  const hx = toward * (pose === "bow" ? 7 : 4) * (1 - c) - toward * 3 * c;
  const hy = (pose === "bow" ? -76 : -88) * (1 - c) - 93 * c;
  const base = (side: number): [number, number] =>
    pose === "up" ? [side * 31, -93] : pose === "palms" ? [side * 40, -62] : [side * 20, -30];
  const top = (side: number): [number, number] => [side * (34 + 6 * extra), -124 - 18 * extra];
  const showArms = pose === "up" || pose === "palms" || c > 0.04;
  const hop = (16 + 6 * extra) * c;
  return (
    <g transform={`rotate(${lean * (1 - 0.6 * c)}) scale(${s}) translate(0 ${-hop})`}>
      {lit > 0.02 ? <circle cx={hx} cy={hy} r={34} fill="#F6C66E" opacity={0.75 * lit} filter="url(#promptGlow)" /> : null}
      {showArms
        ? [-1, 1].map((side) => {
            const [bx, by] = base(side);
            const [tx, ty] = top(side);
            const ex = bx + (tx - bx) * c;
            const ey = by + (ty - by) * c;
            return (
              <g key={side}>
                <line x1={side * 18} y1={-62} x2={ex} y2={ey} stroke={color} strokeWidth={8} strokeLinecap="round" />
                <circle cx={ex} cy={ey - 3} r={5.5} fill={color} />
                {c > 0.35
                  ? [0, 1, 2, 3].map((q) => {
                      const a = (((seed * 47 + q * 80 + side * 25) % 360) * Math.PI) / 180;
                      const r0 = 12 + 18 * c;
                      return (
                        <line
                          key={q}
                          x1={ex + r0 * Math.cos(a)}
                          y1={ey - 3 + r0 * Math.sin(a)}
                          x2={ex + (r0 + 9) * Math.cos(a)}
                          y2={ey - 3 + (r0 + 9) * Math.sin(a)}
                          stroke={q % 2 === 0 ? CINNABAR : INK}
                          strokeWidth={3}
                          strokeLinecap="round"
                          opacity={Math.min(1, (c - 0.35) * 2.5)}
                        />
                      );
                    })
                  : null}
              </g>
            );
          })
        : null}
      <path d={BELIEVER_BODY} fill={color} />
      <circle cx={hx} cy={hy} r={13} fill={color} />
      {team > 0 ? <circle cx={0} cy={-46} r={6.5 * Math.min(1, team)} fill={CINNABAR} /> : null}
    </g>
  );
};

/** Beat 9 (world): the AI core lands and pulses; the congregation fills in and is lit by each wave. */
const AiCore: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const idleF = useIdle();
  const s1 = stepStart(8, 1);
  const s2 = stepStart(8, 2);
  const next = beatStart(9);
  if (frame < s1 || frame >= next + 34) {
    return null;
  }
  // Glide into beat 10 (back left to the circle): everything slides off to the right.
  const out = deskDrift(frame, next, {x: 1, y: 0.1});
  const coreOut = deskDrift(frame, next + 3, {x: 1, y: -0.3});
  const at = s1 + 4;
  const p = slam(frame, fps, at, 0);
  const live = linear(frame, at + 20, at + 28, 0, 1);
  const ph = corePhase(frame + idleF);
  const glow = (ph < 10 ? 1 - ph / 10 : 0) * live;
  const grow = (v: number, from: number) =>
    interpolate(v, [0, 1], [from, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  const drop = (1 - Math.min(1, p)) * -180;
  const wave = waveR(ph);
  const echo = waveR(Math.max(0, ph - 6));
  const sway = (k: number) => Math.sin(((frame + idleF - s2) * 2 * Math.PI) / 80 + k * 0.5) * 2;
  const motesOn = linear(frame, s2 + 44, s2 + 54, 0, 1);
  return (
    <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <defs>
        <filter id="promptGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <filter id="coreGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={30} />
        </filter>
      </defs>
      {live > 0 ? (
        <g transform={svgDrift(coreOut, CORE.x, CORE.y)} opacity={coreOut.opacity * live}>
          <circle cx={CORE.x} cy={CORE.y} r={wave} fill="none" stroke={CINNABAR} strokeWidth={5} opacity={0.75 * (1 - ph / CORE_P) ** 2} />
          {ph >= 6 ? (
            <circle
              cx={CORE.x}
              cy={CORE.y}
              r={echo}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={2}
              strokeDasharray="14 12"
              opacity={0.5 * (1 - ph / CORE_P) ** 2}
            />
          ) : null}
        </g>
      ) : null}
      {frame >= at ? (
        <g transform={svgDrift(coreOut, CORE.x, CORE.y)} opacity={coreOut.opacity}>
          <circle
            cx={CORE.x}
            cy={CORE.y}
            r={210}
            fill={CINNABAR}
            opacity={(0.12 + 0.25 * glow) * Math.min(1, Math.max(0, p))}
            filter="url(#coreGlow)"
          />
          <g
            transform={`translate(${CORE.x} ${CORE.y + drop}) scale(${grow(p, 0.3) * (1 + 0.03 * glow)})`}
            opacity={Math.min(1, Math.max(0, p * 3))}
          >
            <ChipDrawing glow={glow} ph={ph} live={live} />
          </g>
        </g>
      ) : null}
      <g transform={svgDrift(out, CORE.x, CORE.y + 300)} opacity={out.opacity}>
        {motesOn > 0
          ? FLOCK.map((f) => {
              const u = ((ph + f.i * 5) % CORE_P) / CORE_P;
              const dx = f.mx - CORE.x;
              const dy = f.my - CORE.y;
              const len = Math.hypot(dx, dy);
              const sx = CORE.x + (dx / len) * 160;
              const sy = CORE.y + (dy / len) * 160;
              const k = Easing.out(Easing.quad)(u);
              return (
                <circle
                  key={f.i}
                  cx={sx + (f.mx - sx) * k}
                  cy={sy + (f.my - 30 * f.s - sy) * k}
                  r={4}
                  fill="#F2A23A"
                  opacity={motesOn * 0.85 * Math.sin(Math.PI * u)}
                />
              );
            })
          : null}
        {FLOCK.map((f) => {
          const fAt = s2 + 6 + f.k * 16 + f.j * 2;
          if (frame < fAt) {
            return null;
          }
          const fp = slam(frame, fps, fAt, 0);
          const after = wave - f.d;
          const lit =
            frame < s2 + 44 ? 0 : after >= 0 ? Math.max(0, 1 - after / 320) : Math.max(0, 1 + after / 50);
          const teamAt = s2 + 64 + FLOCK_TEAM.indexOf(f.i) * 6;
          return (
            <g key={f.i} transform={`translate(${f.x} ${f.y}) scale(${grow(fp, 0.5)})`} opacity={Math.min(1, Math.max(0, fp * 3))}>
              <Believer
                s={f.s}
                lean={f.toward * 10 + sway(f.k)}
                toward={f.toward}
                pose={f.pose}
                lit={lit}
                team={f.team && frame >= teamAt ? slam(frame, fps, teamAt, 0) : 0}
                seed={f.i}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Beat 9 step 3: a short desk jolt when the catch-up poster lands. */
const catchUpShake = (frame: number): {x: number; y: number} => {
  const t = frame - (stepStart(8, 3) + 9);
  if (t < 0 || t > 14) {
    return {x: 0, y: 0};
  }
  const k = 1 - t / 14;
  return {x: Math.sin(t * 2.9) * 14 * k, y: Math.cos(t * 3.7) * 9 * k};
};

/** Beat 9 step 3 (screen): a huge taped poster slams on over a red sunburst, with speed lines and a running arrow. */
const CatchUp: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const s3 = stepStart(8, 3);
  const next = beatStart(9);
  if (frame < s3 || frame >= next + 24) {
    return null;
  }
  const at = s3 + 4;
  const p = slam(frame, fps, at, 0);
  const wash = linear(frame, s3, s3 + 10, 0, 1);
  const out = eased(frame, next, next + 12);
  const rays = slam(frame, fps, at, 4);
  const under = interpolate(frame, [at + 16, at + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const arrow = slam(frame, fps, at, 30);
  const speed = linear(frame, at + 6, at + 14, 0, 1);
  const sh = catchUpShake(frame);
  const grow = (v: number, from: number) =>
    interpolate(v, [0, 1], [from, 1], {extrapolateLeft: "clamp", extrapolateRight: "extend"});
  const cx = 1000;
  const cy = 580;
  return (
    <AbsoluteFill style={{pointerEvents: "none", opacity: 1 - out}}>
      <AbsoluteFill style={{background: PAPER, opacity: 0.74 * wash}} />
      <AbsoluteFill style={{transform: `translate(${sh.x - 500 * out}px, ${sh.y - 200 * out}px)`}}>
        {frame >= at ? (
          <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: "absolute", left: 0, top: 0}}>
            <g
              transform={`translate(${cx} ${cy}) scale(1 0.45) rotate(${(frame - at) * 0.25}) scale(${grow(rays, 0.2)})`}
              opacity={Math.min(1, Math.max(0, rays * 3)) * 0.85}
            >
              {Array.from({length: 18}, (_, i) => {
                const a = (i * 2 * Math.PI) / 18;
                const half = Math.PI / 36;
                const r = 860;
                return (
                  <path
                    key={i}
                    d={`M 0 0 L ${r * Math.cos(a - half)} ${r * Math.sin(a - half)} L ${r * Math.cos(a + half)} ${r * Math.sin(a + half)} Z`}
                    fill={CINNABAR}
                  />
                );
              })}
            </g>
            <g opacity={speed} stroke={INK} strokeWidth={7} strokeLinecap="round">
              {Array.from({length: 8}, (_, k) => {
                const y = 400 + k * 46;
                const x1 = 70 + ((k * 61) % 150);
                return (
                  <line
                    key={k}
                    x1={x1}
                    y1={y}
                    x2={x1 + 230 + ((k * 97) % 160)}
                    y2={y}
                    strokeDasharray="70 34"
                    strokeDashoffset={(frame - at) * 16 + k * 23}
                  />
                );
              })}
            </g>
          </svg>
        ) : null}
        {frame >= at ? (
          <div
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: 1100,
              padding: "78px 80px 70px",
              boxSizing: "border-box",
              background: STICKY,
              color: INK,
              fontFamily: MARKER,
              fontWeight: 800,
              fontSize: 128,
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
              boxShadow: "0 40px 70px rgba(26,26,26,0.28)",
              transform: `translate(-50%, -50%) rotate(-4deg) scale(${grow(p, 2.1)})`,
              opacity: Math.min(1, Math.max(0, p * 3)),
            }}
          >
            {[{left: 70, r: -8}, {right: 70, r: 6}].map((tp, k) => (
              <div
                key={k}
                style={{
                  position: "absolute",
                  top: -18,
                  ...(tp.left != null ? {left: tp.left} : {right: tp.right}),
                  width: 170,
                  height: 40,
                  background: "rgba(255,255,255,0.62)",
                  transform: `rotate(${tp.r}deg)`,
                }}
              />
            ))}
            <div>So we have to</div>
            <div style={{position: "relative", display: "inline-block"}}>
              catch up.
              <svg
                viewBox="0 0 1000 60"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  left: "-3%",
                  width: "106%",
                  bottom: -22,
                  height: 40,
                  overflow: "visible",
                  clipPath: `inset(-30% ${(1 - under) * 100}% -30% 0)`,
                }}
              >
                <path d="M 8 34 C 180 18 420 26 620 20 C 780 15 900 22 992 12 L 990 32 C 880 40 760 36 600 42 C 400 48 200 44 12 52 Z" fill={CINNABAR} />
              </svg>
              {frame >= at + 30 ? (
                <svg
                  width={230}
                  height={120}
                  viewBox="0 0 230 120"
                  style={{
                    position: "absolute",
                    left: "104%",
                    top: "18%",
                    overflow: "visible",
                    transformOrigin: "0 50%",
                    transform: `translateX(${(1 - Math.min(1, arrow)) * -60}px) scale(${grow(arrow, 0.3)})`,
                    opacity: Math.min(1, Math.max(0, arrow * 3)),
                  }}
                >
                  <path d="M 6 66 C 60 52 120 54 168 58" fill="none" stroke={CINNABAR} strokeWidth={20} strokeLinecap="round" />
                  <path d="M 140 18 L 222 58 L 138 100 Z" fill={CINNABAR} stroke={CINNABAR} strokeWidth={8} strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Beat 5 doc pile, bottom sheet first. dx leans the pile right as it grows. */
const DOC_STACK = [
  {dx: 0, r: -3},
  {dx: 8, r: 4},
  {dx: 4, r: -6},
  {dx: 18, r: 2},
  {dx: 14, r: -4},
  {dx: 28, r: 6},
  {dx: 24, r: -2},
  {dx: 38, r: 5},
];

/** Loose sheets that land on top of the pile, then slide off onto the desk. */
const DOC_LOOSE = [
  {from: {x: 2350, y: 2560, r: 4}, to: {x: 2565, y: 2925, r: 24}, at: 50},
  {from: {x: 2330, y: 2575, r: -3}, to: {x: 2480, y: 3075, r: -12}, at: 60},
];

const DOC_LINES = [118, 96, 124, 104, 84, 120, 70];

const DocSheet: React.FC<{x: number; y: number; r: number; dogEar?: boolean}> = ({x, y, r, dogEar}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path
      d={dogEar ? "M -90 -115 L 58 -115 L 90 -83 L 90 115 L -90 115 Z" : "M -90 -115 L 90 -115 L 90 115 L -90 115 Z"}
      fill="#FBFAF6"
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    {DOC_LINES.map((w, k) => (
      <line
        key={k}
        x1={-66}
        x2={-66 + w}
        y1={-78 + k * 24}
        y2={-78 + k * 24}
        stroke="#BDB8AA"
        strokeWidth={6}
        strokeLinecap="round"
      />
    ))}
    {dogEar ? (
      <path d="M 58 -115 L 58 -83 L 90 -83 Z" fill={FOLDER} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    ) : null}
  </g>
);

/** Beat 5: a leaning pile of docs beside Learn, a confused reader, then the sticky and the BREAK mark. */
const LearnDocs: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const pileAt = stepStart(4, 1);
  const next = beatStart(5);
  if (frame < pileAt || frame >= next + 34) {
    return null;
  }
  // Glide into beat 6: the pile group, sticky, stamp and crack slide off the desk, staggered.
  const pileOut = deskDrift(frame, next, {x: 0.5, y: -0.86});
  const noteOut = deskDrift(frame, next + 3, {x: -0.7, y: -0.7});
  const stampOut = deskDrift(frame, next + 6, {x: -1, y: -0.3});
  const crackOut = deskDrift(frame, next + 6, {x: 1, y: -0.3});
  const baseX = 2300;
  const baseY = 2875;
  const person = interpolate(frame, [pileAt + 44, pileAt + 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const askAt = pileAt + 66;
  const ask = slam(frame, fps, askAt, 0);
  const breakAt = stepStart(4, 2);
  const crack = interpolate(frame, [breakAt + 20, breakAt + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Crack sits on the Learn -> Build arc just below the Learn card.
  const theta = (-8 * Math.PI) / 180;
  const cx = 1520 + 482 * Math.cos(theta);
  const cy = 3180 + 482 * Math.sin(theta);
  const rx = Math.cos(theta);
  const ry = Math.sin(theta);
  const tx = -Math.sin(theta);
  const ty = Math.cos(theta);
  const zig = [
    [-58, 2],
    [-34, 14],
    [-12, -12],
    [10, 12],
    [32, -10],
    [58, 6],
  ]
    .map(([along, side], i) => `${i === 0 ? "M" : "L"} ${cx + rx * along + tx * side} ${cy + ry * along + ty * side}`)
    .join(" ");
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={1} height={1} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <g transform={svgDrift(pileOut, 2330, 2800)} opacity={pileOut.opacity}>
        {DOC_STACK.map((sheet, i) => {
          const at = pileAt + 4 + i * 5;
          if (frame < at) {
            return null;
          }
          const p = slam(frame, fps, at, 0);
          return (
            <g key={i} opacity={Math.min(1, Math.max(0, p * 3))} transform={`translate(0 ${(1 - p) * -140})`}>
              <DocSheet x={baseX + sheet.dx} y={baseY - i * 28} r={sheet.r} dogEar={i === DOC_STACK.length - 1} />
            </g>
          );
        })}
        {DOC_LOOSE.map((sheet) => {
          const at = pileAt + sheet.at;
          if (frame < at) {
            return null;
          }
          const p = slam(frame, fps, at, 0);
          const slide = interpolate(frame, [at + 8, at + 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const x = sheet.from.x + (sheet.to.x - sheet.from.x) * slide;
          const y = sheet.from.y + (sheet.to.y - sheet.from.y) * slide;
          const r = sheet.from.r + (sheet.to.r - sheet.from.r) * slide;
          return (
            <g key={sheet.at} opacity={Math.min(1, Math.max(0, p * 3))} transform={`translate(0 ${(1 - Math.min(1, p)) * -120})`}>
              <DocSheet x={x} y={y} r={r} />
            </g>
          );
        })}
        {person > 0 ? (
          <g transform={`translate(2205 ${3050 + (1 - person) * 30}) scale(1.5)`} opacity={person}>
            <circle cx={0} cy={-84} r={13} fill={INK} />
            <path
              d="M-23 -64 C-26 -40 -20 -12 -17 0 L17 0 C20 -12 26 -40 23 -64 C15 -73 0 -75 0 -75 C0 -75 -15 -73 -23 -64 Z"
              fill={INK}
            />
          </g>
        ) : null}
        {frame >= askAt ? (
          <text
            x={2186}
            y={2876}
            textAnchor="middle"
            fontFamily={SERIF}
            fontWeight={900}
            fontSize={84}
            fill={CINNABAR}
            transform={`translate(2186 2876) scale(${interpolate(ask, [0, 1], [0.3, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "extend",
            })}) translate(-2186 -2876)`}
            opacity={Math.min(1, Math.max(0, ask * 3))}
          >
            ?
          </text>
        ) : null}
        </g>
        {crack > 0 ? (
          <g transform={svgDrift(crackOut, cx, cy)} opacity={crackOut.opacity}>
            <line
              x1={cx - tx * 20}
              y1={cy - ty * 20}
              x2={cx + tx * 20}
              y2={cy + ty * 20}
              stroke={PAPER}
              strokeWidth={16}
            />
            <path
              d={zig}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - crack}
            />
          </g>
        ) : null}
      </svg>
      {frame >= breakAt + 6 ? (
        <div style={cssDrift(noteOut, 1580, 3110)}>
          <BigNote x={1580} y={3110} width={400} tilt={-3} p={slam(frame, fps, breakAt + 6, 0)} size={46}>
            Docs weren&apos;t efficient
          </BigNote>
        </div>
      ) : null}
      <div style={cssDrift(stampOut, 1950, 2955)}>
        <Stamp text="BREAK" x={1950} y={2955} frame={frame} fps={fps} at={breakAt} delay={30} />
      </div>
    </div>
  );
};

/** Screen-fixed yellow sticky, same look as the title note. Drops on with an overshoot, then holds. */
const BigNote: React.FC<{
  x: number;
  y: number;
  width: number;
  tilt: number;
  p: number;
  mark?: boolean;
  size?: number;
  children: React.ReactNode;
}> = ({x, y, width, tilt, p, mark, size = 58, children}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      padding: "52px 34px 32px",
      boxSizing: "border-box",
      background: STICKY,
      color: INK,
      fontFamily: '"Marker Felt", "Chalkboard SE", "Bradley Hand", "Comic Neue", ui-sans-serif, system-ui, sans-serif',
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.04,
      letterSpacing: "-0.01em",
      boxShadow: "0 22px 36px rgba(26,26,26,0.2)",
      transform: `translate(-50%, -50%) translateY(${(1 - Math.min(1, p)) * -60}px) scale(${interpolate(p, [0, 1], [1.35, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "extend",
      })}) rotate(${tilt}deg)`,
      opacity: Math.min(1, Math.max(0, p * 2.5)),
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -14,
        left: "50%",
        width: 128,
        height: 30,
        marginLeft: -64,
        background: "rgba(255,255,255,0.6)",
        transform: "rotate(-2deg)",
      }}
    />
    {mark ? (
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 26,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: CINNABAR,
        }}
      />
    ) : null}
    {children}
  </div>
);

/** Shared lower-left headline slot. Individual beats can override it below. */
const DEFAULT_HEADLINE_SLOT: React.CSSProperties = {left: 64, right: 80, bottom: 64};

/** Per-beat headline placement. Beats not listed use the shared lower-left slot. */
const HEADLINE_SLOT: Partial<Record<number, React.CSSProperties>> = {
  1: {left: 64, right: 80, top: 96},
  3: {left: 64, right: 80, top: 72},
  4: {left: 64, right: 80, top: 72},
  5: {left: 64, right: 80, top: 72},
  6: {left: 64, right: 80, top: 72},
  8: {left: 64, right: 80, top: 72},
  17: {left: 0, right: 0, top: 372, textAlign: "center"},
};

const Overlay: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const beat = beatOf(frame);
  const copy = COPY[beat];
  const tool = linear(frame, beatStart(10), beatStart(10) + 10, 0, 1);
  // Beat 4 waits for beat 3's top headline to fade before its own lands in the same area.
  // Beat 5 waits until the Success card has left the lower-left headline area during the glide.
  const titleP = reveal(
    frame,
    fps,
    beat === 9 ? stepStart(9, 1) : beatStart(beat),
    beat === 9
      ? 6
      : beat === 3
        ? 20
        : beat === 17
          ? 34
          : beat >= 4 && beat <= 16
            ? 26
            : 2,
  );
  // Beat 9 delays its subline with its headline so neither crosses the circle mid-glide.
  const subP = reveal(frame, fps, beatStart(beat), beat === 8 || beat === 10 ? 38 : 14);
  // Title page: the sentence arrives on click 2, then a red-pen highlight sweeps 'AI-friendly' and an underline is drawn.
  const titleSentence = beat === 0 ? reveal(frame, fps, stepStart(0, 2), 4) : 0;
  const hlSweep = beat === 0 ? eased(frame, stepStart(0, 2) + 28, stepStart(0, 2) + 52) : 0;
  const hlLine = beat === 0 ? eased(frame, stepStart(0, 2) + 46, stepStart(0, 2) + 72) : 0;
  const bullAt = stepStart(1, 1) + 26;
  const peopleAt = stepStart(1, 2) + 40;
  const bullNote = beat === 1 ? slam(frame, fps, bullAt, 0) : 1;
  const peopleNote = beat === 1 ? slam(frame, fps, peopleAt, 0) : 1;
  // Beat 3 glide: beat 2's headline and stickies move off the frame instead of cutting.
  const rgbLeave =
    beat === 2
      ? interpolate(frame, [beatStart(2), beatStart(2) + 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;
  const rgbLeaving = beat === 2 && rgbLeave < 1;
  const wipe = (p: number) =>
    interpolate(p, [0, 1], [100, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: SANS,
          fontSize: 14,
          letterSpacing: "0.18em",
          color: INK,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: CINNABAR,
          }}
        />
        <span>CINNABAR</span>
        <span style={{opacity: 0.35}}>/</span>
        <span style={{position: "relative", display: "inline-block", width: 132}}>
          <span style={{opacity: 1 - tool}}>DEVREL</span>
          <span style={{position: "absolute", left: 0, top: 0, opacity: tool}}>
            THE TOOL
          </span>
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          ...(HEADLINE_SLOT[beat] ?? DEFAULT_HEADLINE_SLOT),
          // Beat 4: once the camera pushes in on a stage, the headline shrinks to a running header.
          transformOrigin: "0 0",
          transform:
            beat === 3
              ? `scale(${
                  1 -
                  0.4 *
                    eased(frame, stepStart(3, 1), stepStart(3, 1) + 24) +
                  0.4 * eased(frame, stepStart(3, 5) + 14, stepStart(3, 5) + 16)
                })`
              : undefined,
          // Step 5 pull-back: the headline dips out while notes sweep under it, then returns full size.
          opacity:
            beat === 16
              ? 1 - eased(frame, stepStart(16, 1), stepStart(16, 1) + 10)
              : beat === 3
              ? 1 -
                linear(frame, stepStart(3, 5), stepStart(3, 5) + 8, 0, 1) +
                linear(frame, stepStart(3, 5) + 26, stepStart(3, 5) + 40, 0, 1)
              : undefined,
        }}
      >
        {copy.title && beat !== 0 && beat !== 1 && beat !== 2 ? (
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: copy.titleSize,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              paddingBottom: "0.2em",
              marginBottom: "-0.2em",
              display: beat === 17 ? "inline-block" : undefined,
              textShadow: beat === 17 ? "0 0 4px rgba(247,246,241,1), 0 0 16px rgba(247,246,241,0.95), 0 0 36px rgba(247,246,241,0.7)" : undefined,
              opacity: Math.min(1, Math.max(0, titleP * 1.4)),
              clipPath: `inset(0 ${wipe(titleP)}% 0 0)`,
            }}
          >
            {copy.title}
          </div>
        ) : null}
        {beat === 0 ? (
          <div
            style={{
              maxWidth: 1200,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 56,
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
              color: INK,
              opacity: Math.min(1, Math.max(0, titleSentence)),
              transform: `translateY(${(1 - Math.min(1, titleSentence)) * 14}px)`,
            }}
          >
            <span style={{position: "relative", display: "inline-block"}}>
              {"An "}
              <span style={{position: "relative", display: "inline-block"}}>
                {hlSweep > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      left: -10,
                      right: -10,
                      top: "14%",
                      bottom: "4%",
                      background: "rgba(217,56,30,0.3)",
                      borderRadius: 5,
                      mixBlendMode: "multiply",
                      transform: `skewX(-5deg) scaleX(${hlSweep})`,
                      transformOrigin: "0 50%",
                    }}
                  />
                ) : null}
                <span style={{position: "relative"}}>AI-friendly</span>
              </span>
              {" tool to write CKB scripts"}
              {hlLine > 0 ? (
                <svg viewBox="0 0 1000 24" preserveAspectRatio="none" style={{position: "absolute", left: 0, bottom: -20, width: "100%", height: 24, overflow: "visible"}}>
                  <path d="M 4 14 C 140 4, 300 20, 470 10 S 760 18, 996 8" fill="none" stroke={CINNABAR} strokeWidth={5} strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - hlLine} />
                </svg>
              ) : null}
            </span>
          </div>
        ) : null}
        {beat === 1 ? (
          <>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: copy.titleSize,
                color: INK,
                letterSpacing: "-0.03em",
                lineHeight: 0.98,
                paddingBottom: "0.2em",
                marginBottom: "-0.2em",
                opacity: Math.min(1, Math.max(0, titleP * 1.4)),
                clipPath: `inset(0 ${wipe(titleP)}% 0 0)`,
              }}
            >
              {copy.title}
            </div>
          </>
        ) : null}
        {beat !== 0 && copy.sub ? (
          <div
            style={{
              marginTop: 12,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 30,
              color: copy.subRed ? CINNABAR : INK,
              opacity: Math.min(1, Math.max(0, subP)),
              clipPath: `inset(0 ${wipe(subP)}% 0 0)`,
            }}
          >
            {copy.sub}
          </div>
        ) : null}
      </div>
      {rgbLeaving ? (
        <div
          style={{
            position: "absolute",
            ...HEADLINE_SLOT[1],
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: COPY[1].titleSize,
            color: INK,
            letterSpacing: "-0.03em",
            lineHeight: 0.98,
            transform: `translate(${-420 * rgbLeave}px, ${-300 * rgbLeave}px)`,
            opacity: 1 - rgbLeave,
          }}
        >
          {COPY[1].title}
        </div>
      ) : null}
      {(beat === 1 && frame >= bullAt) || rgbLeaving ? (
        <BigNote
          x={620 - 1000 * rgbLeave}
          y={440 - 260 * rgbLeave}
          width={460}
          tilt={-3 - 10 * rgbLeave}
          p={bullNote}
        >
          The strongest
          <br />
          bull market
        </BigNote>
      ) : null}
      {(beat === 1 && frame >= peopleAt) || rgbLeaving ? (
        <BigNote
          x={1580 + 900 * rgbLeave}
          y={330 - 100 * rgbLeave}
          width={470}
          tilt={3 + 10 * rgbLeave}
          p={peopleNote}
          mark
        >
          People
          <br />
          discovered us.
        </BigNote>
      ) : null}
      <NotReady frame={frame} fps={fps} />
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 32,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: "0.08em",
          color: INK,
        }}
      >
        {String(beat + 1).padStart(2, "0")} / {String(BEAT_COUNT).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

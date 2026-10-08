import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
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
import {BEAT_FRAMES, TOTAL_FRAMES, beatOf, beatStart} from "./timing";

export type TalkProps = {
  onlyBeat?: number;
};

const TORN =
  "polygon(0 0, 100% 0, 100% 14%, 97% 30%, 100% 46%, 98% 62%, 100% 78%, 95% 93%, 82% 100%, 66% 95%, 50% 100%, 34% 95%, 18% 100%, 4% 92%, 0 78%, 3% 62%, 0 46%, 3% 30%, 0 14%)";

export const Talk: React.FC<TalkProps> = ({onlyBeat}) => {
  const shift = onlyBeat == null ? 0 : onlyBeat * BEAT_FRAMES;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: "hidden"}}>
      <Sequence
        from={-shift}
        durationInFrames={TOTAL_FRAMES}
        style={{overflow: "hidden"}}
      >
        <Scene />
      </Sequence>
    </AbsoluteFill>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam = cameraAt(frame);
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
          transform: `translate(960px, 540px) scale(${cam.scale}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <Desk />
        <Patterns />
        <OpeningFile frame={frame} fps={fps} />
        <Clipping frame={frame} fps={fps} />
        <Chart frame={frame} />
        <Note
          x={4320}
          y={900}
          text="CKB"
          rotate={3}
          frame={frame}
          fps={fps}
          at={beatStart(2)}
          delay={50}
        />
        <Figures frame={frame} />
        <Stamp
          text="NOT READY"
          x={2480}
          y={1640}
          frame={frame}
          fps={fps}
          at={beatStart(4)}
          delay={18}
        />
        <CircleCards frame={frame} fps={fps} />
        <Arrows frame={frame} />
        <Ring
          cx={CIRCLE.learn.x}
          cy={CIRCLE.learn.y}
          frame={frame}
          at={beatStart(6)}
        />
        <Note
          x={2140}
          y={2620}
          text="docs"
          rotate={2.5}
          frame={frame}
          fps={fps}
          at={beatStart(6)}
          delay={28}
        />
        <Wall frame={frame} fps={fps} />
        <Ring
          cx={CIRCLE.build.x}
          cy={CIRCLE.build.y}
          frame={frame}
          at={beatStart(7)}
        />
        <Note
          x={1680}
          y={3720}
          text="not enough SDKs"
          rotate={3.5}
          wide
          frame={frame}
          fps={fps}
          at={beatStart(7)}
          delay={30}
        />
        <Cross
          cx={CIRCLE.success.x}
          cy={CIRCLE.success.y}
          frame={frame}
          at={beatStart(8)}
        />
        <Notebook frame={frame} fps={fps} />
        <Keyboard frame={frame} fps={fps} />
        <GapStamp frame={frame} fps={fps} />
        <ToolFile frame={frame} fps={fps} />
        <Calculators frame={frame} fps={fps} />
        <Skills frame={frame} fps={fps} />
        <Tree frame={frame} fps={fps} />
        <Stamp
          text="FIRST"
          x={3180}
          y={7920}
          frame={frame}
          fps={fps}
          at={beatStart(16)}
          delay={20}
        />
        <Finale frame={frame} fps={fps} />
      </div>
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
        height: 13000,
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

const OpeningFile: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const p = enter(frame, fps, 0, 0);
  const slide = interpolate(p, [0, 1], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  const flip = enter(frame, fps, 0, 12);
  const angle = interpolate(flip, [0, 1], [-78, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 1100,
        top: 680,
        width: 740,
        height: 470,
        transform: `translate(-50%, -50%) translateX(${slide}px)`,
        opacity: Math.min(1, Math.max(0, p * 2)),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 34,
          top: -36,
          padding: "8px 18px 6px",
          background: FOLDER,
          border: `1px solid ${INK}`,
          borderBottom: "none",
          fontFamily: SANS,
          fontSize: 13,
          letterSpacing: "0.18em",
          color: INK,
          transform: `perspective(600px) rotateX(${angle}deg)`,
          transformOrigin: "bottom left",
        }}
      >
        DEVREL
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: FOLDER,
          border: `1px solid ${INK}`,
          boxShadow: "0 18px 40px rgba(26,26,26,0.12)",
        }}
      />
    </div>
  );
};

const Clipping: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(1);
  const p = enter(frame, fps, at, 4);
  if (frame < at) {
    return null;
  }
  const drop = interpolate(p, [0, 1], [-50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 2480,
        top: 660,
        width: 560,
        height: 380,
        transform: `translate(-50%, -50%) translateY(${drop}px) rotate(1.5deg)`,
        opacity: Math.min(1, Math.max(0, p)),
        background: "#F7F4EA",
        clipPath: TORN,
        boxShadow: "0 16px 30px rgba(26,26,26,0.12)",
      }}
    >
      <div style={{height: 16, background: COBALT}} />
      <div
        style={{
          margin: "28px 36px",
          height: 10,
          background: INK,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          margin: "14px 36px",
          height: 8,
          width: "70%",
          background: INK,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          margin: "14px 36px",
          height: 8,
          width: "84%",
          background: INK,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          margin: "28px 36px 0",
          height: 3,
          width: "46%",
          background: CINNABAR,
          transform: `scaleX(${linear(frame, at + 16, at + 36, 0, 1)})`,
          transformOrigin: "left center",
        }}
      />
    </div>
  );
};

const Chart: React.FC<{frame: number}> = ({frame}) => {
  const at = beatStart(2);
  if (frame < at) {
    return null;
  }
  const off = linear(frame, at + 8, at + 50, 1, 0);
  return (
    <svg
      width={980}
      height={560}
      viewBox="0 0 980 560"
      style={{position: "absolute", left: 3480, top: 300}}
    >
      <path
        d="M30 500 C 170 490, 230 390, 360 330 S 560 160, 690 120 S 840 60, 950 28"
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={off}
      />
    </svg>
  );
};

const Figures: React.FC<{frame: number}> = ({frame}) => {
  const at = beatStart(3);
  if (frame < at) {
    return null;
  }
  const local = frame - at;
  return (
    <svg
      width={1100}
      height={460}
      style={{position: "absolute", left: 3460, top: 1460, overflow: "visible"}}
    >
      <line
        x1={0}
        y1={250}
        x2={1040}
        y2={250}
        stroke={INK}
        strokeWidth={2}
        opacity={linear(local, 4, 20, 0, 0.45)}
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const travel = linear(local, i * 3, 30 + i * 2, -640, 0);
        const h = 118 + (i % 3) * 22;
        const x = 70 + i * 140 + travel;
        return (
          <g key={i} transform={`translate(${x} 70)`}>
            <circle cx={0} cy={-6} r={20} fill={INK} />
            <rect
              x={-18}
              y={28}
              width={36}
              height={h}
              rx={10}
              fill="url(#halftone)"
              stroke={INK}
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
};

const CircleCards: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(5);
  const red = linear(frame, beatStart(12), beatStart(12) + 14, 0, 1);
  const cards = [
    {n: "01", label: "Discover", at: CIRCLE.discover, delay: 0, rot: -2},
    {n: "02", label: "Learn", at: CIRCLE.learn, delay: 10, rot: 2},
    {n: "03", label: "Build", at: CIRCLE.build, delay: 20, rot: -1.5},
    {n: "04", label: "Success", at: CIRCLE.success, delay: 30, rot: 2.5},
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
  frame: number;
  fps: number;
  at: number;
  delay: number;
}> = ({x, y, n, label, rot, red, frame, fps, at, delay}) => {
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
        opacity: Math.min(1, Math.max(0, p)),
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

const Arrows: React.FC<{frame: number}> = ({frame}) => {
  const at = beatStart(5);
  if (frame < at) {
    return null;
  }
  const segs = [
    {x1: 1295, y1: 2860, x2: 1745, y2: 2860, delay: 14},
    {x1: 1880, y1: 2945, x2: 1880, y2: 3415, delay: 24},
    {x1: 1745, y1: 3500, x2: 1295, y2: 3500, delay: 34},
    {x1: 1160, y1: 3415, x2: 1160, y2: 2945, delay: 46},
  ];
  return (
    <svg width={1} height={1} style={{position: "absolute", overflow: "visible"}}>
      <defs>
        <marker
          id="desk-arrow"
          markerWidth={8}
          markerHeight={8}
          refX={6}
          refY={3}
          orient="auto"
        >
          <path d="M0 0 L7 3 L0 6 Z" fill={INK} />
        </marker>
      </defs>
      {segs.map((seg, i) => {
        const off = linear(frame, at + seg.delay, at + seg.delay + 14, 1, 0);
        return (
          <line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={INK}
            strokeWidth={2.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={off}
            markerEnd="url(#desk-arrow)"
            opacity={1 - off}
          />
        );
      })}
    </svg>
  );
};

const Ring: React.FC<{
  cx: number;
  cy: number;
  frame: number;
  at: number;
}> = ({cx, cy, frame, at}) => {
  if (frame < at) {
    return null;
  }
  const r = 168;
  const c = 2 * Math.PI * r;
  const off = linear(frame, at + 4, at + 34, c, 0);
  const box = (r + 16) * 2;
  return (
    <svg
      width={box}
      height={box}
      style={{position: "absolute", left: cx - box / 2, top: cy - box / 2}}
    >
      <circle
        cx={box / 2}
        cy={box / 2}
        r={r}
        fill="none"
        stroke={CINNABAR}
        strokeWidth={5}
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${box / 2} ${box / 2})`}
      />
    </svg>
  );
};

const Wall: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(7);
  if (frame < at) {
    return null;
  }
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const p = enter(frame, fps, at, 6 + i * 5);
        const h = 52 + i * 38;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 2148 + i * 44,
              top: 3572 - h,
              width: 36,
              height: h,
              background: INK,
              transform: `scaleY(${Math.max(0, Math.min(1, p))})`,
              transformOrigin: "bottom center",
              opacity: Math.max(0, Math.min(1, p)),
            }}
          />
        );
      })}
    </>
  );
};

const Cross: React.FC<{
  cx: number;
  cy: number;
  frame: number;
  at: number;
}> = ({cx, cy, frame, at}) => {
  if (frame < at) {
    return null;
  }
  const a = linear(frame, at + 6, at + 18, 1, 0);
  const b = linear(frame, at + 16, at + 30, 1, 0);
  return (
    <svg
      width={240}
      height={160}
      style={{position: "absolute", left: cx - 120, top: cy - 80}}
    >
      <line
        x1={22}
        y1={18}
        x2={218}
        y2={142}
        stroke={CINNABAR}
        strokeWidth={8}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={a}
      />
      <line
        x1={218}
        y1={18}
        x2={22}
        y2={142}
        stroke={CINNABAR}
        strokeWidth={8}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={b}
      />
    </svg>
  );
};

const Notebook: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(9);
  const p = enter(frame, fps, at, 2);
  if (frame < at) {
    return null;
  }
  const drop = interpolate(p, [0, 1], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 3300,
        top: 3120,
        width: 520,
        height: 360,
        transform: `translate(-50%, -50%) translateY(${drop}px) rotate(-1.5deg)`,
        opacity: Math.min(1, Math.max(0, p)),
        background: "#F6F1E4",
        backgroundImage:
          "repeating-linear-gradient(#F6F1E4, #F6F1E4 31px, rgba(217,56,30,0.28) 32px)",
        clipPath: TORN,
        boxShadow: "0 16px 30px rgba(26,26,26,0.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 0,
          bottom: 0,
          width: 2,
          background: "rgba(217,56,30,0.45)",
        }}
      />
    </div>
  );
};

const Keyboard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(10);
  const keys = enter(frame, fps, at, 4);
  const win = enter(frame, fps, at, 16);
  if (frame < at) {
    return null;
  }
  return (
    <>
      <svg
        width={640}
        height={230}
        style={{
          position: "absolute",
          left: 4300,
          top: 3080,
          opacity: Math.min(1, Math.max(0, keys)),
          transform: `translateY(${interpolate(keys, [0, 1], [24, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <rect
          x={6}
          y={6}
          width={628}
          height={218}
          rx={12}
          fill={PAPER}
          stroke={INK}
          strokeWidth={3}
        />
        {Array.from({length: 4}, (_, row) =>
          Array.from({length: 11}, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={16 + col * 56}
              y={16 + row * 52}
              width={46}
              height={40}
              rx={4}
              fill="url(#halftone)"
              stroke={INK}
              strokeWidth={1.5}
            />
          )),
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 4780,
          top: 3000,
          width: 300,
          background: CARD,
          border: `1px solid ${INK}`,
          boxShadow: "0 14px 28px rgba(26,26,26,0.12)",
          opacity: Math.min(1, Math.max(0, win)),
          transform: `translateY(${interpolate(win, [0, 1], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px) rotate(2deg)`,
        }}
      >
        <div style={{height: 28, background: COBALT}} />
        <div style={{padding: "16px 18px 8px"}}>
          {[210, 160, 230, 120].map((w, i) => (
            <div
              key={i}
              style={{
                height: 8,
                width: w,
                background: INK,
                opacity: 0.8,
                marginBottom: 12,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const GapStamp: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const red = linear(frame, beatStart(12), beatStart(12) + 14, 0, 1);
  const color = red > 0.65 ? PAPER : CINNABAR;
  return (
    <Stamp
      text="GAP"
      x={CIRCLE.build.x + 78}
      y={CIRCLE.build.y + 48}
      frame={frame}
      fps={fps}
      at={beatStart(11)}
      delay={12}
      color={color}
    />
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

const Note: React.FC<{
  x: number;
  y: number;
  text: string;
  rotate: number;
  frame: number;
  fps: number;
  at: number;
  delay: number;
  wide?: boolean;
}> = ({x, y, text, rotate, frame, fps, at, delay, wide}) => {
  const p = enter(frame, fps, at, delay);
  if (frame < at + delay) {
    return null;
  }
  const drop = interpolate(p, [0, 1], [-36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: wide ? 250 : 180,
        minHeight: 96,
        padding: "26px 16px 16px",
        background: STICKY,
        color: INK,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 22,
        lineHeight: 1.25,
        boxShadow: "0 12px 22px rgba(26,26,26,0.14)",
        transform: `translate(-50%, -50%) translateY(${drop}px) rotate(${rotate}deg)`,
        opacity: Math.min(1, Math.max(0, p)),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          width: 62,
          height: 16,
          marginLeft: -31,
          background: "rgba(255,255,255,0.55)",
        }}
      />
      {text}
    </div>
  );
};

const ToolFile: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(12);
  const p = enter(frame, fps, at, 8);
  const close = eased(frame, beatStart(17) + 18, beatStart(17) + 48);
  const fade = linear(frame, beatStart(18), beatStart(18) + 12, 1, 0);
  if (frame < at || fade <= 0) {
    return null;
  }
  const h = 490 - close * 270;
  const seal = slam(frame, fps, beatStart(17), 40);
  const showSeal = frame >= beatStart(17) + 40 && close > 0.35;
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
        {showSeal ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              borderRadius: "50%",
              border: `6px solid ${CINNABAR}`,
              color: CINNABAR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: CJK,
              fontSize: 36,
              fontWeight: 700,
              transform: `scale(${interpolate(seal, [0, 1], [1.7, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "extend",
              })})`,
              opacity: Math.min(0.92, Math.max(0, seal * 3)),
            }}
          >
            朱砂
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Calculators: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(13);
  if (frame < at) {
    return null;
  }
  const local = frame - at;
  const spread = linear(local, 10, 42, 0, 54);
  const left = enter(frame, fps, at, 2);
  const right = slam(frame, fps, at, 18);
  const label = enter(frame, fps, at, 0);
  return (
    <>
      <DeskLabel
        x={900}
        y={6000}
        text="Before"
        opacity={Math.min(1, Math.max(0, label))}
      />
      <PlainCard
        x={900}
        y={6240 - spread}
        title="Contract"
        width={380}
        opacity={Math.min(1, Math.max(0, left))}
      />
      <svg
        width={4}
        height={80 + spread * 2}
        style={{
          position: "absolute",
          left: 898,
          top: 6360 - spread,
          opacity: linear(local, 12, 36, 0, 0.8),
        }}
      >
        <line
          x1={2}
          y1={0}
          x2={2}
          y2={80 + spread * 2}
          stroke={INK}
          strokeWidth={2}
          strokeDasharray="7 8"
        />
      </svg>
      <PlainCard
        x={900}
        y={6560 + spread}
        title="Transaction assembler (client)"
        width={460}
        opacity={Math.min(1, Math.max(0, left))}
      />
      <DeskLabel
        x={2140}
        y={6080}
        text="Cinnabar"
        color={CINNABAR}
        opacity={Math.min(1, Math.max(0, right))}
      />
      <PlainCard
        x={2140}
        y={6380}
        title="Contract + Calculator"
        width={440}
        opacity={Math.min(1, Math.max(0, right))}
        scale={interpolate(right, [0, 1], [1.18, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "extend",
        })}
      />
      <Note
        x={2520}
        y={6120}
        text="Ethereum: account model"
        rotate={2.5}
        wide
        frame={frame}
        fps={fps}
        at={at}
        delay={48}
      />
    </>
  );
};

const DeskLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  opacity: number;
  color?: string;
}> = ({x, y, text, opacity, color = INK}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        fontFamily: SANS,
        letterSpacing: "0.18em",
        fontSize: 16,
        color,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const PlainCard: React.FC<{
  x: number;
  y: number;
  title: string;
  width: number;
  opacity: number;
  scale?: number;
}> = ({x, y, title, width, opacity, scale = 1}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        minHeight: 110,
        padding: "28px 22px",
        background: CARD,
        border: `1px solid ${INK}`,
        boxShadow: "0 12px 24px rgba(26,26,26,0.1)",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 30,
        color: INK,
        letterSpacing: "-0.02em",
      }}
    >
      {title}
    </div>
  );
};

const Skills: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(14);
  const p = enter(frame, fps, at, 4);
  if (frame < at) {
    return null;
  }
  return (
    <>
      <svg
        width={220}
        height={320}
        style={{
          position: "absolute",
          left: 4080,
          top: 6240,
          opacity: Math.min(1, Math.max(0, p)),
        }}
      >
        <circle cx={110} cy={48} r={32} fill="url(#halftone)" />
        <rect x={70} y={96} width={80} height={150} rx={12} fill="url(#halftone)" />
      </svg>
      <Note
        x={4560}
        y={6320}
        text="built-in AI skills"
        rotate={3}
        wide
        frame={frame}
        fps={fps}
        at={at}
        delay={16}
      />
    </>
  );
};

const Tree: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(15);
  if (frame < at) {
    return null;
  }
  const origin = {x: 1070, y: 7680};
  const branches = [
    {d: "M450 520 C 400 400, 180 340, 80 170", nx: 80, ny: 170, delay: 0},
    {d: "M450 520 C 420 380, 280 230, 220 80", nx: 220, ny: 80, delay: 8},
    {d: "M450 520 C 480 360, 540 200, 500 60", nx: 500, ny: 60, delay: 16},
    {d: "M450 520 C 530 400, 700 280, 780 140", nx: 780, ny: 140, delay: 24},
    {d: "M450 520 C 520 470, 660 450, 840 340", nx: 840, ny: 340, delay: 32},
  ];
  return (
    <>
      <svg
        width={900}
        height={600}
        style={{position: "absolute", left: origin.x, top: origin.y}}
      >
        {branches.map((branch, i) => {
          const off = linear(
            frame,
            at + branch.delay,
            at + branch.delay + 18,
            1,
            0,
          );
          return (
            <path
              key={i}
              d={branch.d}
              fill="none"
              stroke={CINNABAR}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={off}
            />
          );
        })}
      </svg>
      {branches.map((branch, i) => {
        const p = enter(frame, fps, at, branch.delay + 16);
        if (frame < at + branch.delay + 16) {
          return null;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: origin.x + branch.nx,
              top: origin.y + branch.ny,
              width: 58,
              height: 36,
              background: INK,
              transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.6, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
              opacity: Math.min(1, Math.max(0, p)),
              boxShadow: "0 8px 14px rgba(26,26,26,0.18)",
            }}
          />
        );
      })}
    </>
  );
};

const Finale: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const at = beatStart(18);
  if (frame < at) {
    return null;
  }
  const ink = reveal(frame, fps, at, 8);
  const fill = linear(frame, at + 10, at + 52, 0, 1);
  const sub = reveal(frame, fps, at, 20);
  const crystalH = 620;
  const crystalW = 520;
  return (
    <>
      <svg
        width={crystalW}
        height={crystalH}
        viewBox={`0 0 ${crystalW} ${crystalH}`}
        style={{
          position: "absolute",
          left: 1520 - crystalW / 2,
          top: 4580,
        }}
      >
        <defs>
          <clipPath id="crystalFill">
            <rect
              x={0}
              y={crystalH * (1 - fill)}
              width={crystalW}
              height={crystalH * fill + 1}
            />
          </clipPath>
        </defs>
        <path
          d="M260 24 L430 150 L400 430 L260 596 L120 430 L90 150 Z"
          fill="url(#halftoneRed)"
          clipPath="url(#crystalFill)"
        />
        <path
          d="M260 24 L430 150 L400 430 L260 596 L120 430 L90 150 Z"
          fill="none"
          stroke={CINNABAR}
          strokeWidth={3}
          opacity={Math.min(1, Math.max(0, ink))}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 1520,
          top: 4860,
          transform: "translate(-50%, -50%)",
          fontFamily: CJK,
          fontWeight: 700,
          fontSize: 188,
          color: INK,
          lineHeight: 1,
          opacity: Math.min(1, Math.max(0, ink * 1.3)),
        }}
      >
        朱砂
      </div>
      <div
        style={{
          position: "absolute",
          left: 1520,
          top: 5060,
          transform: "translate(-50%, -50%)",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 42,
          color: INK,
          opacity: Math.min(1, Math.max(0, sub)),
        }}
      >
        Cinnabar.
      </div>
    </>
  );
};

const Overlay: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const beat = beatOf(frame);
  const copy = COPY[beat];
  const tool = linear(frame, beatStart(12), beatStart(12) + 10, 0, 1);
  const titleP = reveal(frame, fps, beatStart(beat), 2);
  const subP = reveal(frame, fps, beatStart(beat), 14);
  const finale = beat === 18;
  const line1 = reveal(frame, fps, beatStart(18), 36);
  const line2 = reveal(frame, fps, beatStart(18), 48);
  const chop = slam(frame, fps, beatStart(18), 56);
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
          left: 64,
          right: 80,
          bottom: 64,
        }}
      >
        {copy.title ? (
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: copy.titleSize,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              opacity: Math.min(1, Math.max(0, titleP * 1.4)),
              clipPath: `inset(0 ${wipe(titleP)}% 0 0)`,
            }}
          >
            {copy.title}
          </div>
        ) : null}
        {copy.sub ? (
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
        {finale ? (
          <>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 28,
                color: INK,
                opacity: Math.min(1, Math.max(0, line1)),
                clipPath: `inset(0 ${wipe(line1)}% 0 0)`,
              }}
            >
              A red Chinese mineral, kept to drive evil and demons away.
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 28,
                color: INK,
                opacity: Math.min(1, Math.max(0, line2)),
                clipPath: `inset(0 ${wipe(line2)}% 0 0)`,
              }}
            >
              Cinnabar for CKB: driving the bad things out.
            </div>
          </>
        ) : null}
      </div>
      {finale && frame >= beatStart(18) + 56 ? (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 40,
            width: 92,
            height: 92,
            border: `4px solid ${CINNABAR}`,
            color: CINNABAR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: CJK,
            fontWeight: 700,
            fontSize: 32,
            transform: `rotate(-8deg) scale(${interpolate(chop, [0, 1], [1.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "extend",
            })})`,
            opacity: Math.min(0.92, Math.max(0, chop * 3)),
          }}
        >
          朱砂
        </div>
      ) : null}
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
        {String(beat + 1).padStart(2, "0")} / {String(19).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

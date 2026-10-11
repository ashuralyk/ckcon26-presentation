import {Player, type PlayerRef} from "@remotion/player";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Talk} from "../talk/Talk";
import {FPS, STOPS, TOTAL_FRAMES} from "../talk/timing";

/** One wheel gesture = one step. A new gesture needs a quiet gap, and no step fires within the lock. */
const WHEEL_QUIET_MS = 220;
const WHEEL_LOCK_MS = 520;
const WHEEL_MIN = 2;

const FLAG_CSS = `@keyframes flagReady { 0%, 100% { filter: drop-shadow(0 0 2px rgba(217,56,30,0.35)); transform: scale(1); } 50% { filter: drop-shadow(0 0 8px rgba(217,56,30,0.95)); transform: scale(1.04); } }
@keyframes flagWave { 0%, 100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(-5deg) scaleX(0.94); } }`;

const CINNABAR = "#D9381E";
const INK = "#1A1A1A";
/** Pole fills first (first third of the step), then the cloth rises from its hem to its top. */
const POLE_SHARE = 0.35;

/**
 * Presenter chrome, outside the composition: a small pennant under the page number. While a step plays it fills from the bottom up with the
 * step's progress (the player's current frame within the step); at the hold it is full and pulses in cinnabar: ready for the next click.
 * Hidden on the very last step. It never takes pointer events, so wheel, keyboard and clicks are untouched.
 */
const StepFlag: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
  stopRef: React.RefObject<number>;
  stop: number;
  waiting: boolean;
  size: {w: number; h: number};
}> = ({playerRef, stopRef, stop, waiting, size}) => {
  const [prog, setProg] = useState<{stop: number; p: number}>({stop: 0, p: 0});
  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const onFrame = (event: {detail: {frame: number}}) => {
      const cur = stopRef.current;
      const {start, hold} = STOPS[cur];
      const p = hold > start ? Math.min(1, Math.max(0, (event.detail.frame - start) / (hold - start))) : 1;
      setProg((old) => (old.stop === cur && old.p === p ? old : {stop: cur, p}));
    };
    player.addEventListener("frameupdate", onFrame);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
    };
  }, [playerRef, stopRef]);
  // A stale value from the previous step reads as empty until this step's first frame arrives.
  const p = waiting ? 1 : prog.stop === stop ? prog.p : 0;
  const poleP = Math.min(1, p / POLE_SHARE);
  const clothP = Math.min(1, Math.max(0, (p - POLE_SHARE) / (1 - POLE_SHARE)));
  const ready = waiting;
  const hgt = Math.max(16, size.h * 0.0259);
  const clip = clothP > 0 ? 18 - 15 * clothP : 19;
  return (
    <div
      aria-hidden
      data-testid="step-flag"
      data-progress={p.toFixed(3)}
      data-ready={ready ? "1" : "0"}
      style={{
        position: "absolute",
        right: size.w * 0.0349,
        bottom: size.h * 0.0035,
        width: hgt * 0.8125,
        height: hgt,
        pointerEvents: "none",
        opacity: stop < STOPS.length - 1 ? 1 : 0,
        // Presenter chrome, outside the composition: not part of the frame-pure art.
        animation: ready ? "flagReady 2.2s ease-in-out infinite" : "none",
        transformOrigin: "20% 100%",
      }}
    >
      <svg viewBox="0 0 26 32" width="100%" height="100%" style={{display: "block", overflow: "visible"}}>
        <defs>
          <clipPath id="flagFill">
            <rect x={0} y={clip} width={26} height={19 - clip + 0.01} />
          </clipPath>
        </defs>
        <line x1={4} y1={31} x2={4} y2={1.5} stroke={INK} strokeWidth={2.2} strokeLinecap="round" opacity={0.55} />
        {poleP > 0 ? <line x1={4} y1={31} x2={4} y2={31 - 29.5 * poleP} stroke={CINNABAR} strokeWidth={2.2} strokeLinecap="round" /> : null}
        <g
          style={{
            transformOrigin: "4px 10px",
            animation: ready ? "flagWave 1.6s ease-in-out infinite" : "none",
          }}
        >
          <path d="M 4 3 L 24 3 L 18.5 10.5 L 24 18 L 4 18 Z" fill="rgba(26,26,26,0.06)" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" opacity={ready ? 0 : 0.6} />
          {clothP > 0 ? <path d="M 4 3 L 24 3 L 18.5 10.5 L 24 18 L 4 18 Z" fill={CINNABAR} clipPath="url(#flagFill)" /> : null}
          <path d="M 4 3 L 24 3 L 18.5 10.5 L 24 18 L 4 18 Z" fill="none" stroke={ready ? CINNABAR : INK} strokeWidth={1.4} strokeLinejoin="round" opacity={ready ? 1 : 0.6} />
        </g>
      </svg>
    </div>
  );
};

const fit = (): {w: number; h: number} => {
  const maxW = window.innerWidth;
  const maxH = window.innerHeight;
  const aspect = 16 / 9;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return {w, h};
};

const Presenter: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  // Index into STOPS. A stop is one click: a beat's step.
  const stopRef = useRef(0);
  const modeRef = useRef<"play" | "settle">("play");
  const [stop, setStop] = useState(0);
  // True once the current step has played to its hold frame and the talk is waiting for the next click.
  const [waiting, setWaiting] = useState(false);
  // Idle clock: frames since the step settled. Drives the composition's idle loops (reset to 0 on every navigation).
  const [idle, setIdle] = useState(0);
  const inputProps = useMemo(() => ({idle}), [idle]);
  useEffect(() => {
    if (!waiting) {
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      setIdle(Math.floor(((performance.now() - t0) * FPS) / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [waiting]);
  const wheelRef = useRef({lastEvent: 0, lockUntil: 0});
  const [full, setFull] = useState(false);
  const [size, setSize] = useState(fit);

  useEffect(() => {
    const onResize = () => {
      setSize(fit());
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const onChange = () => {
      setFull(document.fullscreenElement != null);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const onFrame = (event: {detail: {frame: number}}) => {
      // Hold at the end of the current step. Never roll into the next one on our own.
      const hold = STOPS[stopRef.current].hold;
      if (event.detail.frame >= hold) {
        player.pause();
        if (event.detail.frame > hold) {
          player.seekTo(hold);
        }
        setWaiting(true);
      }
    };
    player.addEventListener("frameupdate", onFrame);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const target = STOPS[stop];
    if (modeRef.current === "settle") {
      // Land on the step already settled. No replay.
      player.pause();
      player.seekTo(target.hold);
      return;
    }
    player.seekTo(target.start);
    player.play();
  }, [stop]);

  const advance = () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const current = STOPS[stopRef.current];
    // Autoplay was blocked: play this step instead of skipping it.
    if (player.getCurrentFrame() <= current.start && !player.isPlaying()) {
      player.play();
      return;
    }
    if (stopRef.current >= STOPS.length - 1) {
      return;
    }
    // Next step of this beat, or the next beat's step 0 (which carries the camera glide).
    stopRef.current += 1;
    modeRef.current = "play";
    setWaiting(false);
    setIdle(0);
    setStop(stopRef.current);
  };

  const back = () => {
    const player = playerRef.current;
    if (!player || stopRef.current <= 0) {
      return;
    }
    // One step back; from step 0 this lands on the previous beat's last step.
    stopRef.current -= 1;
    modeRef.current = "settle";
    setWaiting(false);
    setIdle(0);
    setStop(stopRef.current);
  };

  const toggleFull = () => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void shell.requestFullscreen();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      if (
        event.key === "ArrowRight" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        advance();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "Backspace") {
        event.preventDefault();
        back();
        return;
      }
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        toggleFull();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-no-advance]")) {
        return;
      }
      advance();
    };
    // Wheel: down = next, up = previous, one step per gesture. A gesture ends after a quiet gap,
    // so a trackpad's inertial tail (events every ~16 ms for a second or more) is swallowed.
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return; // pinch-zoom
      }
      event.preventDefault();
      const now = performance.now();
      const w = wheelRef.current;
      const quiet = now - w.lastEvent >= WHEEL_QUIET_MS;
      w.lastEvent = now;
      if (!quiet || now < w.lockUntil) {
        return;
      }
      if (Math.abs(event.deltaY) < WHEEL_MIN || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }
      w.lockUntil = now + WHEEL_LOCK_MS;
      if (event.deltaY > 0) {
        advance();
      } else {
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    window.addEventListener("wheel", onWheel, {passive: false});
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#141414",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      <style>{FLAG_CSS}</style>
      <div style={{width: size.w, height: size.h, position: "relative"}}>
        <Player
          ref={playerRef}
          component={Talk}
          inputProps={inputProps}
          durationInFrames={TOTAL_FRAMES}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          autoPlay={false}
          loop={false}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          moveToBeginningWhenEnded={false}
          acknowledgeRemotionLicense
          style={{width: "100%", height: "100%", outline: "none"}}
        />
        <StepFlag playerRef={playerRef} stopRef={stopRef} stop={stop} waiting={waiting} size={size} />
      </div>
      <button
        type="button"
        data-no-advance
        onClick={(event) => {
          event.stopPropagation();
          toggleFull();
        }}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          cursor: "default",
        }}
      >
        {full ? "Exit" : "Full screen"}
      </button>
    </div>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root");
}
createRoot(root).render(<Presenter />);

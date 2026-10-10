import {Player, type PlayerRef} from "@remotion/player";
import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Talk} from "../talk/Talk";
import {FPS, STOPS, TOTAL_FRAMES} from "../talk/timing";

/** One wheel gesture = one step. A new gesture needs a quiet gap, and no step fires within the lock. */
const WHEEL_QUIET_MS = 220;
const WHEEL_LOCK_MS = 520;
const WHEEL_MIN = 2;

const HINT_CSS = `@keyframes nextHint { 0%, 100% { opacity: 0.22; transform: scale(0.85); } 50% { opacity: 0.4; transform: scale(1.15); } }`;

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
      <style>{HINT_CSS}</style>
      <div style={{width: size.w, height: size.h, position: "relative"}}>
        <Player
          ref={playerRef}
          component={Talk}
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
        {/* "Waiting for the next click": outside the composition, under the page number, hidden on the very last step. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: size.w * 0.0455,
            bottom: size.h * 0.012,
            width: size.w * 0.0052,
            height: size.w * 0.0052,
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: waiting && stop < STOPS.length - 1 ? 1 : 0,
            // Presenter chrome, outside the composition: the hint is not part of the frame-pure art.
            // eslint-disable-next-line @remotion/non-pure-animation
            transition: waiting ? "opacity 900ms ease 450ms" : "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#D9381E",
              animation: waiting ? "nextHint 2.4s ease-in-out 1.4s infinite" : "none",
              opacity: 0.3,
            }}
          />
        </div>
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

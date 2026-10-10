import {Player, type PlayerRef} from "@remotion/player";
import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Talk} from "../talk/Talk";
import {FPS, STOPS, TOTAL_FRAMES} from "../talk/timing";

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
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
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
      <div style={{width: size.w, height: size.h}}>
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

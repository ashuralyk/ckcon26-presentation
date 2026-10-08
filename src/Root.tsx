import "./index.css";
import React from "react";
import {Composition} from "remotion";
import {StickyBoard} from "./scenes/StickyBoard";
import {Talk} from "./talk/Talk";
import {BEAT_COUNT, BEAT_FRAMES, FPS, TOTAL_FRAMES} from "./talk/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Explainer"
        component={StickyBoard}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CinnabarTalk"
        component={Talk}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {Array.from({length: BEAT_COUNT}, (_, index) => {
        const id = `Beat${String(index + 1).padStart(2, "0")}`;
        return (
          <Composition
            key={id}
            id={id}
            component={Talk}
            durationInFrames={BEAT_FRAMES}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{onlyBeat: index}}
          />
        );
      })}
    </>
  );
};

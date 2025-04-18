import React, { useRef, useEffect, useState, RefObject } from "react";

interface Raindrop {
  x: number;
  y: number;
  length: number;
  velocityY: number;
  opacity: number;
  lineWidth: number;
}

interface Impact {
  x: number;
  y: number;
  currentLength: number;
  maxLength: number;
  opacity: number;
  isFading: boolean;
  numLines: number;
  angles: number[];
  lengthFactors: number[];
  lineWidth: number;
}

interface RainEffectProps {
  coverRef: RefObject<HTMLDivElement>;
}

const RainEffect: React.FC<RainEffectProps> = ({ coverRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const impactsRef = useRef<Impact[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const coverRectRef = useRef<DOMRect | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const dropAccumulatorRef = useRef(0);
  const [, setCoverRectState] = useState<DOMRect | null>(null);

  const RAIN_COLOR = "rgba(220, 220, 235, 0.7)";
  const IMPACT_STROKE_COLOR = "rgba(230, 230, 245, 0.65)";

  const DROPS_PER_SECOND = 180;
  const MIN_SPEED_PER_SEC = 540;
  const MAX_SPEED_PER_SEC = 780;
  const IMPACT_GROW_SPEED_PER_SEC = 24;
  const IMPACT_FADE_SPEED_PER_SEC = 3.6;

  const MIN_LENGTH = 12;
  const MAX_LENGTH = 22;
  const MIN_DROP_WIDTH = 1.0;
  const MAX_DROP_WIDTH = 1.8;
  const SPLASH_CHANCE = 0.4;
  const MIN_SPLASH_LENGTH = 5;
  const MAX_SPLASH_LENGTH = 10;
  const NUM_SPLASH_LINES_MIN = 1;
  const NUM_SPLASH_LINES_MAX = 2;
  const SPLASH_ANGLE_SPREAD_COVER = Math.PI * 0.6;
  const SPLASH_ANGLE_SPREAD_GROUND = Math.PI * 1.2;
  const SPLASH_BASE_ANGLE = 1.5 * Math.PI;
  const IMPACT_MIN_WIDTH = 0.8;
  const IMPACT_MAX_WIDTH = 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let observer: ResizeObserver | undefined;
    const observedElement = coverRef.current;

    if (observedElement) {
      const updateCoverRect = (entries: ResizeObserverEntry[]) => {
        if (!entries || entries.length === 0) return;
        const newRect = entries[0].target.getBoundingClientRect();
        setCoverRectState((prevRect) => {
          coverRectRef.current = newRect;
          if (
            !prevRect ||
            Math.round(prevRect.top) !== Math.round(newRect.top) ||
            Math.round(prevRect.left) !== Math.round(newRect.left) ||
            Math.round(prevRect.width) !== Math.round(newRect.width) ||
            Math.round(prevRect.height) !== Math.round(newRect.height)
          ) {
            return newRect;
          }
          return prevRect;
        });
      };

      const initialRect = observedElement.getBoundingClientRect();
      coverRectRef.current = initialRect;
      setCoverRectState(initialRect);

      observer = new ResizeObserver(updateCoverRect);
      observer.observe(observedElement);
    } else {
      coverRectRef.current = null;
      setCoverRectState(null);
    }

    return () => {
      if (observer && observedElement) {
        observer.unobserve(observedElement);
      }
    };
  }, [coverRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    if (!raindropsRef.current) raindropsRef.current = [];
    if (!impactsRef.current) impactsRef.current = [];
    lastTimeRef.current = null;
    dropAccumulatorRef.current = 0;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTimeMs = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const dt = Math.min(deltaTimeMs / 1000, 1 / 30);

      const currentCtx = canvasRef.current?.getContext("2d");
      const currentCanvas = canvasRef.current;
      const currentCoverRect = coverRectRef.current;

      if (!currentCanvas || !currentCtx) {
        if (animationFrameId.current)
          cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        return;
      }

      const canvasWidth = currentCanvas.width;
      const canvasHeight = currentCanvas.height;

      currentCtx.clearRect(0, 0, canvasWidth, canvasHeight);

      dropAccumulatorRef.current += DROPS_PER_SECOND * dt;
      const dropsToCreate = Math.floor(dropAccumulatorRef.current);
      if (dropsToCreate > 0) {
        dropAccumulatorRef.current -= dropsToCreate;
        for (let i = 0; i < dropsToCreate; i++) {
          raindropsRef.current.push({
            x: Math.random() * canvasWidth,
            y: -Math.random() * 50 - MAX_LENGTH,
            length: MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH),
            velocityY:
              MIN_SPEED_PER_SEC +
              Math.random() * (MAX_SPEED_PER_SEC - MIN_SPEED_PER_SEC),
            opacity: 0.6 + Math.random() * 0.4,
            lineWidth:
              MIN_DROP_WIDTH +
              Math.random() * (MAX_DROP_WIDTH - MIN_DROP_WIDTH),
          });
        }
      }

      const nextDrops: Raindrop[] = [];
      currentCtx.strokeStyle = RAIN_COLOR;
      currentCtx.lineCap = "round";

      for (const drop of raindropsRef.current) {
        drop.y += drop.velocityY * dt;

        let hitSomething = false;
        let impactY = canvasHeight;
        let isOnCover = false;

        const dropBottom = drop.y + drop.length;

        if (
          currentCoverRect &&
          dropBottom >= currentCoverRect.top &&
          drop.y <= currentCoverRect.top + 15 &&
          drop.x >= currentCoverRect.left &&
          drop.x <= currentCoverRect.right
        ) {
          hitSomething = true;
          impactY = currentCoverRect.top - Math.random() * 3;
          isOnCover = true;
        } else if (dropBottom >= canvasHeight) {
          hitSomething = true;
          impactY = canvasHeight - Math.random() * 3;
          isOnCover = false;
        }

        if (drop.y > canvasHeight + MAX_LENGTH) {
          // don't remove this; for eslint
        } else if (hitSomething) {
          if (Math.random() <= SPLASH_CHANCE) {
            const numLines = Math.floor(
              NUM_SPLASH_LINES_MIN +
                Math.random() *
                  (NUM_SPLASH_LINES_MAX - NUM_SPLASH_LINES_MIN + 1),
            );
            const angleSpread = isOnCover
              ? SPLASH_ANGLE_SPREAD_COVER
              : SPLASH_ANGLE_SPREAD_GROUND;

            const angles = Array.from(
              { length: numLines },
              () => SPLASH_BASE_ANGLE + (Math.random() - 0.5) * angleSpread,
            );
            const lengthFactors = Array.from(
              { length: numLines },
              () => 0.7 + Math.random() * 0.6,
            );

            impactsRef.current.push({
              x: drop.x,
              y: impactY,
              currentLength: 0,
              maxLength:
                MIN_SPLASH_LENGTH +
                Math.random() * (MAX_SPLASH_LENGTH - MIN_SPLASH_LENGTH),
              opacity: 0.8 + Math.random() * 0.2,
              isFading: false,
              numLines: numLines,
              angles: angles,
              lengthFactors: lengthFactors,
              lineWidth:
                IMPACT_MIN_WIDTH +
                Math.random() * (IMPACT_MAX_WIDTH - IMPACT_MIN_WIDTH),
            });
          }
        } else {
          currentCtx.globalAlpha = drop.opacity;
          currentCtx.lineWidth = drop.lineWidth;
          currentCtx.beginPath();
          currentCtx.moveTo(drop.x, drop.y);
          currentCtx.lineTo(drop.x, drop.y + drop.length);
          currentCtx.stroke();
          nextDrops.push(drop);
        }
      }
      raindropsRef.current = nextDrops;

      const nextImpacts: Impact[] = [];
      currentCtx.strokeStyle = IMPACT_STROKE_COLOR;
      currentCtx.lineCap = "round";

      for (const impact of impactsRef.current) {
        if (!impact.isFading) {
          impact.currentLength += IMPACT_GROW_SPEED_PER_SEC * dt;
          if (impact.currentLength >= impact.maxLength) {
            impact.currentLength = impact.maxLength;
            impact.isFading = true;
          }
        } else {
          impact.opacity -= IMPACT_FADE_SPEED_PER_SEC * dt;
        }

        if (impact.opacity > 0) {
          currentCtx.globalAlpha = impact.opacity;
          currentCtx.lineWidth = impact.lineWidth;
          currentCtx.beginPath();

          const drawY = Math.min(impact.y, canvasHeight - 1);

          for (let i = 0; i < impact.numLines; i++) {
            const angle = impact.angles[i];
            const lineTargetLength =
              impact.currentLength * impact.lengthFactors[i];
            const endX = impact.x + Math.cos(angle) * lineTargetLength;
            const endY = drawY + Math.sin(angle) * lineTargetLength;
            currentCtx.moveTo(impact.x, drawY);
            currentCtx.lineTo(endX, endY);
          }
          currentCtx.stroke();
          nextImpacts.push(impact);
        }
      }
      impactsRef.current = nextImpacts;

      currentCtx.globalAlpha = 1.0;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = null;
      raindropsRef.current = [];
      impactsRef.current = [];
      lastTimeRef.current = null;
      dropAccumulatorRef.current = 0;
    };
  }, [
    SPLASH_ANGLE_SPREAD_COVER,
    SPLASH_ANGLE_SPREAD_GROUND,
    SPLASH_BASE_ANGLE,
    coverRef,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
};

export default RainEffect;

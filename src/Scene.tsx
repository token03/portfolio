import { useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrthographicCamera, useGLTF, OrbitControls } from "@react-three/drei";
import FireParticles from "./FireParticle";

const MIN_VIEWPORT_WIDTH = 4;
const MAX_VIEWPORT_WIDTH = 12;
const TARGET_FRACTION_AT_MIN_WIDTH = 0.3;
const TARGET_FRACTION_AT_MAX_WIDTH = 0.15;
const PADDING_FROM_BOTTOM = 0.2;
const HORIZONTAL_OFFSET_FRACTION_AT_MIN_WIDTH = 0.2;
const HORIZONTAL_OFFSET_FRACTION_AT_MAX_WIDTH = 0.08;

function useDynamicScaling() {
  const { viewport } = useThree();

  const clampedViewportWidth = THREE.MathUtils.clamp(
    viewport.width,
    MIN_VIEWPORT_WIDTH,
    MAX_VIEWPORT_WIDTH,
  );
  const t = THREE.MathUtils.inverseLerp(
    MIN_VIEWPORT_WIDTH,
    MAX_VIEWPORT_WIDTH,
    clampedViewportWidth,
  );

  const currentTargetFraction = THREE.MathUtils.lerp(
    TARGET_FRACTION_AT_MIN_WIDTH,
    TARGET_FRACTION_AT_MAX_WIDTH,
    t,
  );

  const targetWorldWidth = viewport.width * currentTargetFraction;

  return { targetWorldWidth, viewport };
}

function BaseModel({
  gltfPath,
  rotationY = 0,
  xOffset = 0,
  children,
}: {
  gltfPath: string;
  rotationY?: number;
  xOffset?: number;
  children?: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const gltf = useGLTF(gltfPath);
  const { targetWorldWidth, viewport } = useDynamicScaling();

  const { originalBox, originalCenter } = useMemo(() => {
    const sceneClone = gltf.scene.clone();
    const box = new THREE.Box3().setFromObject(sceneClone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return { originalBox: box, originalCenter: center };
  }, [gltf.scene]);

  const originalWidth = originalBox.max.x - originalBox.min.x;
  const originalHeight = originalBox.max.y - originalBox.min.y;

  const dynamicScale = originalWidth > 0 ? targetWorldWidth / originalWidth : 1;

  const scaledModelHeight = originalHeight * dynamicScale;

  const yPosition =
    -viewport.height / 2 + PADDING_FROM_BOTTOM + scaledModelHeight / 2;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY;
    }
  });

  const primitivePositionOffset = useMemo(
    () =>
      new THREE.Vector3(
        -originalCenter.x * dynamicScale,
        -originalCenter.y * dynamicScale,
        -originalCenter.z * dynamicScale,
      ),
    [originalCenter, dynamicScale],
  );

  return (
    <group ref={groupRef} position={[xOffset, yPosition, 0]}>
      <primitive
        object={gltf.scene}
        position={primitivePositionOffset.toArray()}
        scale={[dynamicScale, dynamicScale, dynamicScale]}
      />
      <group scale={[dynamicScale, dynamicScale, dynamicScale]}>
        {children}
      </group>
    </group>
  );
}

function ClodsireModel({
  rotationY = 0,
  xOffset = 0,
}: {
  rotationY?: number;
  xOffset?: number;
}) {
  return (
    <BaseModel
      gltfPath="/assets/clodsire.glb"
      rotationY={rotationY}
      xOffset={xOffset}
    />
  );
}

function BonfireModel({
  rotationY = 0,
  xOffset = 0,
}: {
  rotationY?: number;
  xOffset?: number;
}) {
  return (
    <BaseModel
      gltfPath="/assets/bonfire.glb"
      rotationY={rotationY}
      xOffset={xOffset}
    >
      <group>
        {" "}
        <FireParticles
          count={400}
          baseColor={new THREE.Color("#ff4000")}
          middleColor={new THREE.Color("#ff8000")}
          tipColor={new THREE.Color("#ffee00")}
          colorMidpoint={0.35}
          size={0.3}
          lifetime={2.2}
          speed={0.7}
          gravity={-0.4}
          initialSpread={0.2}
          baseSpreadRadius={0.1}
          convergenceFactor={5}
          fireHeight={0.75}
          position={[0, -0.05, 0]}
        />
      </group>
    </BaseModel>
  );
}
function WorldContent() {
  const { viewport } = useThree();

  const clampedViewportWidth = THREE.MathUtils.clamp(
    viewport.width,
    MIN_VIEWPORT_WIDTH,
    MAX_VIEWPORT_WIDTH,
  );
  const t = THREE.MathUtils.inverseLerp(
    MIN_VIEWPORT_WIDTH,
    MAX_VIEWPORT_WIDTH,
    clampedViewportWidth,
  );
  const currentHorizontalOffsetFraction = THREE.MathUtils.lerp(
    HORIZONTAL_OFFSET_FRACTION_AT_MIN_WIDTH,
    HORIZONTAL_OFFSET_FRACTION_AT_MAX_WIDTH,
    t,
  );
  const horizontalOffset = viewport.width * currentHorizontalOffsetFraction;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
      <ClodsireModel
        rotationY={THREE.MathUtils.degToRad(50)}
        xOffset={-horizontalOffset}
      />
      <BonfireModel xOffset={horizontalOffset} />
    </>
  );
}

function Scene() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas>
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={100}
          near={0.1}
          far={1000}
        />
        <OrbitControls />
        <WorldContent />
      </Canvas>
    </div>
  );
}

export default Scene;

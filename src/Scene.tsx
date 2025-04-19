import { useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrthographicCamera, useGLTF } from "@react-three/drei";

const MIN_VIEWPORT_WIDTH = 4;
const MAX_VIEWPORT_WIDTH = 12;
const TARGET_FRACTION_AT_MIN_WIDTH = 0.3;
const TARGET_FRACTION_AT_MAX_WIDTH = 0.2;
const PADDING_FROM_BOTTOM = 0.2;
const HORIZONTAL_OFFSET_FRACTION = 0.1;

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
}: {
  gltfPath: string;
  rotationY?: number;
  xOffset?: number;
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

  return (
    <group ref={groupRef} position={[xOffset, yPosition, 0]}>
      <primitive
        object={gltf.scene}
        position={[
          -originalCenter.x * dynamicScale,
          -originalCenter.y * dynamicScale,
          -originalCenter.z * dynamicScale,
        ]}
        scale={[dynamicScale, dynamicScale, dynamicScale]}
      />
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
    />
  );
}

function WorldContent() {
  const { viewport } = useThree();
  const horizontalOffset = viewport.width * HORIZONTAL_OFFSET_FRACTION;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight
        position={[horizontalOffset, -viewport.height / 2 + 1.5, 1]}
        color="orange"
        intensity={2}
        distance={5}
        decay={2}
      />
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
        <WorldContent />
      </Canvas>
    </div>
  );
}

export default Scene;

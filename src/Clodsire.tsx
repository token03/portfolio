import React, { useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrthographicCamera, useGLTF } from "@react-three/drei";

const MIN_VIEWPORT_WIDTH = 4;
const MAX_VIEWPORT_WIDTH = 12;

const TARGET_FRACTION_AT_MIN_WIDTH = 0.3;
const TARGET_FRACTION_AT_MAX_WIDTH = 0.2;

const PADDING_FROM_BOTTOM = 0.2;
const ROTATION_SPEED = 0.5;

function ClodsireModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const gltf = useGLTF("/assets/clodsire.glb");

  const { originalBox, originalCenter } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return { originalBox: box, originalCenter: center };
  }, [gltf.scene]);

  const originalWidth = originalBox.max.x - originalBox.min.x;
  const originalHeight = originalBox.max.y - originalBox.min.y;

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

  const dynamicScale = originalWidth > 0 ? targetWorldWidth / originalWidth : 1;

  const scaledModelHeight = originalHeight * dynamicScale;

  const yPosition =
    -viewport.height / 2 + PADDING_FROM_BOTTOM + scaledModelHeight / 2;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED * delta;
    }
  });

  return (
    <group ref={groupRef} position={[0, yPosition, 0]}>
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

function Clodsire() {
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
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={100} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ClodsireModel />
      </Canvas>
    </div>
  );
}

export default Clodsire;

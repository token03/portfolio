import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const FireParticles = ({
  count = 500,
  baseColor = new THREE.Color("red"),
  middleColor = new THREE.Color("orange"),
  tipColor = new THREE.Color("yellow"),
  colorMidpoint = 0.3,
  size = 0.1,
  lifetime = 1.5,
  speed = 1.0,
  gravity = -0.5,
  initialSpread = 0.3,
  baseSpreadRadius = 0.2,
  convergenceFactor = 0.3,
  fireHeight = 1.0,
  position = [0, 0, 0],
  timeScale = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    // ... (geometry creation code remains the same - keep negative aStartTime) ...
    const geo = new THREE.BufferGeometry();
    const particleCount = count;
    const vertices = new Float32Array(particleCount * 3 * 3);
    const lifetimes = new Float32Array(particleCount * 3);
    const startTimes = new Float32Array(particleCount * 3); // Will store negative offsets
    const velocities = new Float32Array(particleCount * 3 * 3);
    const baseSizes = new Float32Array(particleCount * 3);
    const vertexIndices = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const life = lifetime * (0.5 + Math.random() * 0.5);
      // **** CRITICAL: Keep aStartTime negative ****
      // This negative value acts as an initial delay offset.
      const startTime = -Math.random() * life;
      const baseSize = size * (0.7 + Math.random() * 0.6);
      const angle = Math.random() * Math.PI * 2;
      const horizontalSpeed = Math.random() * speed * initialSpread;
      const velX = Math.cos(angle) * horizontalSpeed;
      const velY = speed * (0.8 + Math.random() * 0.4);
      const velZ = Math.sin(angle) * horizontalSpeed;
      const randomVal = Math.random();

      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        vertices[index * 3 + 0] = 0;
        vertices[index * 3 + 1] = 0;
        vertices[index * 3 + 2] = 0;
        lifetimes[index] = life;
        startTimes[index] = startTime; // Store the negative start time/delay
        baseSizes[index] = baseSize;
        vertexIndices[index] = j;
        velocities[index * 3 + 0] = velX;
        velocities[index * 3 + 1] = velY;
        velocities[index * 3 + 2] = velZ;
        randoms[index] = randomVal;
      }
    }
    // ... (rest of geometry setup remains the same) ...
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute("aLifetime", new THREE.BufferAttribute(lifetimes, 1));
    geo.setAttribute("aStartTime", new THREE.BufferAttribute(startTimes, 1));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aBaseSize", new THREE.BufferAttribute(baseSizes, 1));
    geo.setAttribute(
      "aVertexIndex",
      new THREE.BufferAttribute(vertexIndices, 1),
    );
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geo.computeBoundingSphere();
    return geo;
  }, [count, lifetime, size, speed, initialSpread]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          // ... (other uniforms remain the same) ...
          uTime: { value: 0.0 },
          uBaseColor: { value: baseColor },
          uMiddleColor: { value: middleColor },
          uTipColor: { value: tipColor },
          uColorMidpoint: { value: colorMidpoint },
          uGravity: { value: gravity },
          uBaseSpreadRadius: { value: baseSpreadRadius },
          uConvergenceFactor: { value: convergenceFactor },
          uFireHeight: { value: fireHeight },
        },
        vertexShader: `
          attribute float aLifetime;
          attribute float aStartTime; // Represents the initial *delay* (negative value)
          attribute vec3 aVelocity;
          attribute float aBaseSize;
          attribute float aVertexIndex;
          attribute float aRandom;

          uniform float uTime;
          uniform float uGravity;
          uniform float uBaseSpreadRadius;
          uniform float uConvergenceFactor;
          uniform float uFireHeight;

          varying float vLifeProgress; // Goes from 0.0 to 1.0 repeatedly

          #define PI 3.141592653589793

          float rand(vec2 co){
              return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }

          mat4 rotationMatrix(vec3 axis, float angle) {
             axis = normalize(axis); float s = sin(angle); float c = cos(angle); float oc = 1.0 - c;
             return mat4(oc*axis.x*axis.x+c, oc*axis.x*axis.y-axis.z*s, oc*axis.z*axis.x+axis.y*s, 0.0,
                         oc*axis.x*axis.y+axis.z*s, oc*axis.y*axis.y+c, oc*axis.y*axis.z-axis.x*s, 0.0,
                         oc*axis.z*axis.x-axis.y*s, oc*axis.y*axis.z+axis.x*s, oc*axis.z*axis.z+c, 0.0,
                         0.0, 0.0, 0.0, 1.0);
          }

          void main() {
            // --- Time & Life (Looping Calculation) ---
            // Calculate the total time elapsed since this particle *would have* started at time -aStartTime
            float totalAge = uTime - aStartTime; // Since aStartTime is negative, this is uTime + initialDelay

            // Calculate the time elapsed *within the current life cycle* using modulo
            float cycleElapsedTime = mod(totalAge, aLifetime);

            // Calculate the progress within the current life cycle (0.0 to 1.0)
            vLifeProgress = cycleElapsedTime / aLifetime;

            // --- Initial Discard (Optional but good for staggering start) ---
            // If totalAge is negative, the particle hasn't even reached its initial start time yet.
            if (totalAge < 0.0) {
                 gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Move outside view frustum
                 vLifeProgress = 0.0; // Ensure varying is initialized
                 return; // Stop processing this vertex
            }

            // --- Use cycleElapsedTime for all physics and time-based effects ---
            float elapsedTime = cycleElapsedTime; // Use this for physics calculations

            // --- Initial Position Offset (Wider Base) ---
            float baseAngle = aRandom * 2.0 * PI;
            float baseRadius = uBaseSpreadRadius * sqrt(rand(vec2(aStartTime, aRandom))); // Use aStartTime+aRandom for seed
            vec3 baseOffset = vec3(cos(baseAngle) * baseRadius, 0.0, sin(baseAngle) * baseRadius);

            // --- Position Calculation (Using cycleElapsedTime) ---
            vec3 currentPos = baseOffset;
            currentPos.x += aVelocity.x * elapsedTime;
            currentPos.y += aVelocity.y * uFireHeight * elapsedTime; // Apply height scaling
            currentPos.z += aVelocity.z * elapsedTime;
            // Apply gravity based on the time within the current cycle
            currentPos.y += 0.5 * uGravity * elapsedTime * elapsedTime;

            // --- Convergence towards Center (Using cycleElapsedTime) ---
            vec2 currentXZ = currentPos.xz;
             if (length(currentXZ) > 0.001) {
                 vec2 dirToCenter = -normalize(currentXZ);
                 // Strength still depends on progress in life (vLifeProgress) and distance
                 float convergenceStrength = length(currentXZ) * uConvergenceFactor * vLifeProgress;
                 // Apply force scaled by time within the current cycle
                 currentPos.xz += dirToCenter * convergenceStrength * elapsedTime * 0.1; // Adjust multiplier
             }

            // --- Size (Shrinking based on vLifeProgress) ---
            // Size depends on the progress within the cycle (0 -> 1 -> 0 ...)
            float shrinkFactor = pow(1.0 - vLifeProgress, 1.5);
            float currentSize = aBaseSize * shrinkFactor;
            // Optional: Prevent size becoming exactly zero if causing issues
            // currentSize = max(currentSize, 0.001);

            // --- Triangle Vertex Offset ---
            vec3 vertexOffset;
             if (aVertexIndex == 0.0) {
                vertexOffset = vec3(-0.5, -0.433, 0.0);
            } else if (aVertexIndex == 1.0) {
                vertexOffset = vec3(0.5, -0.433, 0.0);
            } else { // aVertexIndex == 2.0
                vertexOffset = vec3(0.0, 0.433 * 2.0, 0.0);
            }
            vertexOffset *= currentSize;

            // --- Rotation (Based on cycleElapsedTime) ---
            float randomSeed = rand(aVelocity.xz + vec2(aStartTime)); // Consistent random seed
            float rotationSpeed = PI * 1.0 * (randomSeed * 0.8 + 0.2); // Consistent speed per particle
            float particleAngle = elapsedTime * rotationSpeed; // Angle progresses within the cycle
            vec3 rotationAxis = vec3(0.0, 0.0, 1.0);
            mat4 rotMat = rotationMatrix(rotationAxis, particleAngle);


            // --- Billboarding & Final Position ---
            vec4 worldPosition = modelMatrix * vec4(currentPos, 1.0);
            vec4 viewPosition = viewMatrix * worldPosition;
            // Apply rotation in view space
            vec3 rotatedOffset = (rotMat * vec4(vertexOffset, 1.0)).xyz;
            viewPosition.xyz += rotatedOffset;
            gl_Position = projectionMatrix * viewPosition;

             // --- Culling (Optional - Rely on Fading) ---
             // Since alpha fades to 0 using sin(vLifeProgress * PI), explicit discard might not be needed
             // if (currentSize <= 0.001) {
             //     gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Discard if too small
             // }
          }
        `,
        fragmentShader: `
          // ... (Fragment shader remains the same - it uses vLifeProgress) ...
          uniform vec3 uBaseColor;
          uniform vec3 uMiddleColor;
          uniform vec3 uTipColor;
          uniform float uColorMidpoint;

          varying float vLifeProgress; // Receives the 0.0 -> 1.0 value from vertex shader

          #define PI 3.141592653589793

          void main() {
            vec3 color;
            float mid = clamp(uColorMidpoint, 0.01, 0.99);

            if (vLifeProgress < mid) {
              color = mix(uBaseColor, uMiddleColor, vLifeProgress / mid);
            } else {
              color = mix(uMiddleColor, uTipColor, (vLifeProgress - mid) / (1.0 - mid));
            }

            // Alpha smoothly fades in and out using sin based on the looping progress
            float alpha = sin(vLifeProgress * PI);

            gl_FragColor = vec4(color, alpha);
            gl_FragColor.a = clamp(gl_FragColor.a, 0.0, 1.0); // Ensure alpha is valid
            // Optional: Discard fully transparent fragments for potential minor performance gain
            // if (gl_FragColor.a < 0.01) discard;
          }
        `,
        // ... (rest of material properties: transparent, blending, depthWrite, side) ...
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [
      // Ensure dependencies are correct
      baseColor,
      middleColor,
      tipColor,
      colorMidpoint,
      gravity,
      baseSpreadRadius,
      convergenceFactor,
      fireHeight,
    ],
  );

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.uTime.value = clock.getElapsedTime() * timeScale;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position as [number, number, number]}
      geometry={geometry}
      material={material}
      frustumCulled={false} // Keep this for particle systems
    />
  );
};

export default FireParticles;

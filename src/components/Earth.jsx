import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "../components/Loading";

const Earth = () => {
  const earth = useGLTF("/scene.gltf");
  return <primitive object={earth.scene} scale={2.5} position-y={0} />;
};

const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const cities = [
  { name: "Washington, D.C.", lat: 38.9072, lon: -77.0369 },
  { name: "Ottawa", lat: 45.4215, lon: -75.6972 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
  { name: "New Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Canberra", lat: -35.2809, lon: 149.13 },
  { name: "Brasília", lat: -15.8267, lon: -47.9218 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Pretoria", lat: -25.7461, lon: 28.1881 },
  { name: "Nairobi", lat: -1.2864, lon: 36.8172 },
  { name: "Seoul", lat: 37.5665, lon: 126.978 },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { name: "Tehran", lat: 35.6892, lon: 51.389 },
  { name: "Ankara", lat: 39.9334, lon: 32.8597 },
];

const CityLabels = () => {
  const cameraRef = useRef();

  useFrame(({ camera }) => {
    cameraRef.current = camera;
  });

  return cities.map((city, index) => {
    const position = latLonToVector3(city.lat, city.lon, 2.6);
    const textRef = useRef();

    useFrame(() => {
      if (textRef.current && cameraRef.current) {
        textRef.current.lookAt(cameraRef.current.position);
      }
    });

    return (
      <Text
        key={index}
        ref={textRef}
        position={[position.x, position.y, position.z]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {city.name}
      </Text>
    );
  });
};

const EarthCanvas = () => {
  return (
    <div className="bg-[#030612] h-lvh">
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
        camera={{ fov: 45, near: 0.1, far: 200, position: [-4, 3, 6] }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls autoRotate enableZoom={false} />
          <Earth />
          <CityLabels />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default EarthCanvas;

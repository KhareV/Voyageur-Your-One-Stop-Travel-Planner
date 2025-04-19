import { Link } from "react-router-dom";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FaExclamationTriangle } from "react-icons/fa";
import Girl from "../components/Girl.jsx";
import CanvasLoader from "../components/Loading.jsx";

const NotFoundPage = () => {
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white max-w-6xl w-full px-8 py-16 shadow-lg rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 3D Canvas Section */}
          <div className="h-[400px] w-full">
            <Canvas>
              <ambientLight intensity={7} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
              <Suspense fallback={<CanvasLoader />}>
                <Girl position-y={-3} scale={3} animationName="salute" />
              </Suspense>
            </Canvas>
          </div>

          {/* Content Section */}
          <div className="flex flex-col items-center justify-center text-center">
            <FaExclamationTriangle className="text-yellow-400 text-7xl" />
            <h1 className="text-6xl font-extrabold mt-6 text-gray-900">404</h1>
            <h2 className="text-3xl font-semibold mt-4 text-gray-700">
              Page Not Found
            </h2>
            <p className="text-gray-500 text-xl mt-6 mb-8">
              Oops! Looks like you've wandered into uncharted territory.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-md transition duration-300 text-lg"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;

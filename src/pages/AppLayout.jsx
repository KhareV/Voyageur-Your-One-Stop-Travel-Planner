import React from "react";
import Map from "../components-1/Map";
import Sidebar from "../components-1/Sidebar";
const AppLayout = () => {
  return (
    <div className="grid grid-cols-[40%_60%] h-screen bg-gradient-to-br from-[#00c6ff] to-[#0072ff] text-white font-['Roboto']">
      <div className="bg-gradient-to-br from-[#6a11cb] to-[#2575fc] p-8 shadow-lg animate-slideIn overflow-y-auto">
        <Sidebar />
      </div>
      <div className="relative h-screen animate-fadeIn shadow-lg rounded-l-2xl m-4 bg-white z-0">
        <Map />
      </div>
    </div>
  );
};

export default AppLayout;

// Add these animation keyframes to your global CSS
const globalStyles = `
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slideIn {
  animation: slideIn 1s ease-out;
}

.animate-fadeIn {
  animation: fadeIn 1.5s ease-in-out;
}

/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* Responsive styles */
@media (max-width: 768px) {
  .grid-cols-[40%_60%] {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
`;

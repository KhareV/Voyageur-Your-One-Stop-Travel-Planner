import { SignIn } from "@clerk/clerk-react";
import { useEffect } from "react";
import gsap from "gsap";

const SignInPage = () => {
  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { duration: 1 } });

    timeline.fromTo(
      ".gradient-bg",
      { opacity: 0 },
      { opacity: 1, duration: 2 }
    );

    timeline.fromTo(
      ".signin-container",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "<0.5"
    );

    timeline.fromTo(
      ".text-element",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2 },
      "<0.2"
    );
  }, []);

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob mix-blend-multiply filter blur-xl opacity-70 absolute bg-purple-300 w-72 h-72 rounded-full -top-4 -left-4"></div>
        <div className="animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70 absolute bg-yellow-300 w-72 h-72 rounded-full -top-4 -right-4"></div>
        <div className="animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70 absolute bg-pink-300 w-72 h-72 rounded-full -bottom-8 left-20"></div>
      </div>

      <div className="signin-container relative bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 w-[420px] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] group">
        <div className="space-y-6">
          <h1 className="text-element text-4xl font-bold text-white text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Welcome to Voyageur
          </h1>

          <p className="text-element text-gray-200 text-center text-lg">
            Sign in to continue your journey
          </p>

          <div className="text-element transform transition-all duration-300 hover:scale-105">
            <SignIn />
          </div>
        </div>

        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default SignInPage;

const style = `@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;

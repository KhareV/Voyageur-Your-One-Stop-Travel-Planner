import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AadhaarVerificationSimulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("not-started"); // not-started, verifying, success, error
  const fileInputRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Get property data from location state or use sample data
  const propertyData = location.state?.propertyData || {
    address: "123 Sample Street, Example City",
    ownerName: "Sample Owner",
    propertyId: "PROP12345",
  };

  // Handle verification completion and API call
  useEffect(() => {
    const submitProperty = async () => {
      if (!propertyData || Object.keys(propertyData).length === 0) {
        console.error("No property data available to submit.");
        setError("Error: Property data is missing. Cannot submit.");
        setVerificationStatus("error"); // Set status to error if data is missing
        return;
      }

      setIsVerifying(true);
      setError(null); // Clear previous errors

      try {
        const formData = new FormData();
        // The backend expects propertyData as a JSON string field
        formData.append("propertyData", JSON.stringify(propertyData));
        // Note: Images are not handled here as they are expected to be uploaded
        // before this step or handled differently by the backend if verification
        // is separate. This assumes the backend can handle POST /api/properties
        // without image files if they aren't mandatory at this stage.

        const response = await fetch("/api/properties", {
          method: "POST",
          body: formData, // Send as FormData
          // No 'Content-Type' header needed; browser sets it for FormData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        // Successfully submitted
        console.log("Property submitted successfully:", await response.json());
        navigate("/user-dashboard", {
          state: {
            propertyAdded: true,
            message: "Property added successfully after verification!",
          },
        });
      } catch (err) {
        console.error("Failed to submit property:", err);
        setError(`Failed to save property: ${err.message}`);
        setVerificationStatus("error"); // Update status on error
      } finally {
        setIsVerifying(false);
      }
    };

    if (verificationStatus === "success" && !isVerifying) {
      submitProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationStatus, navigate, propertyData]); // Add propertyData dependency

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case "success":
        return isVerifying
          ? "Saving your property..."
          : "Verification successful!";
      case "verifying":
        return "Verification in progress...";
      case "error":
        return "Error with verification. Please try again.";
      default:
        return "Please verify your identity";
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "text-green-600";
      case "verifying":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleSimulationComplete = () => {
    setVerificationStatus("success");
    setIsModalOpen(false);
  };

  const handleSimulationError = () => {
    setVerificationStatus("error");
    setError("Verification failed. Please try again.");
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Verify Your Identity
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Property Details</h3>
          <p className="text-gray-600">Address: {propertyData.address}</p>
          <p className="text-gray-600">Owner: {propertyData.ownerName}</p>
          <p className="text-gray-600">ID: {propertyData.propertyId}</p>
        </div>

        <p className="mb-4">
          To add a property, we need to verify your identity using Anon Aadhaar.
          This verification is private and secure - we don't store your Aadhaar
          details.
        </p>

        <div className="flex justify-center my-6">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setVerificationStatus("verifying");
            }}
            disabled={
              verificationStatus === "verifying" ||
              verificationStatus === "success"
            }
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white w-full max-w-xs font-medium
                      ${
                        verificationStatus === "success"
                          ? "bg-green-600 hover:bg-green-700"
                          : verificationStatus === "verifying"
                          ? "bg-blue-400 cursor-wait"
                          : "bg-blue-600 hover:bg-blue-700"
                      } 
                      transition-colors duration-200`}
          >
            {/* Anon Aadhaar Logo */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 9V22H21V9L12 2Z"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M12 2L3 9V22H21V9L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="14"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            {verificationStatus === "success"
              ? "Verified with Anon Aadhaar"
              : verificationStatus === "verifying"
              ? "Verifying..."
              : "Verify with Anon Aadhaar"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className={getStatusColor()}>{getStatusMessage()}</p>
        </div>

        {/* Simulated proof display */}
        {verificationStatus === "success" && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 text-green-700 p-1 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-green-800">Proof Generated</h3>
            </div>

            <div className="bg-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
              {`{
  "id": "anonAadhaarProof-${Date.now().toString().substring(0, 10)}",
  "proof": {
    "pi_a": ["19803192281290...", "21431902109...", "1"],
    "pi_b": [["847129374...", "1893298..."], ["2937492...", "918273..."], ["1", "0"]],
    "pi_c": ["283749283749...", "281738291...", "1"],
    "protocol": "groth16",
    "curve": "bn128"
  },
  "publicSignals": {
    "pubkeyHash": "13632874356787499237289143...",
    "nullifier": "2982376438726487326498...",
    "timestamp": "${Math.floor(Date.now() / 1000)}",
    "ageAbove18": "1",
    "stateCode": "27"
  }
}`}
            </div>

            <div className="mt-3 flex gap-2 text-xs text-gray-500">
              <span>Age Above 18: Yes</span>
              <span>•</span>
              <span>State: Maharashtra</span>
              <span>•</span>
              <span>Verified: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/add-property")}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
          >
            Back
          </button>

          {/* Continue button removed as submission now happens automatically on success */}
          {/* If manual continuation is desired, reinstate this button and remove */}
          {/* the automatic submission logic from the useEffect hook */}
        </div>
      </div>

      {/* Modal for verification simulation */}
      {isModalOpen && (
        <AadhaarVerificationModal
          onClose={() => setIsModalOpen(false)}
          onComplete={handleSimulationComplete}
          onError={handleSimulationError}
          fileInputRef={fileInputRef}
          qrScannerRef={qrScannerRef}
        />
      )}
    </div>
  );
};

// Simulation of Anon Aadhaar modal
const AadhaarVerificationModal = ({
  onClose,
  onComplete,
  onError,
  fileInputRef,
  qrScannerRef,
}) => {
  const [step, setStep] = useState(0);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      title: "Upload your Aadhaar",
      description: "Select your Aadhaar PDF or scan the QR code",
    },
    {
      title: "Reading QR Code",
      description: "We are reading and validating the QR code...",
    },
    {
      title: "Generating Proof",
      description: "This may take a few minutes...",
    },
    {
      title: "Proof Generated",
      description: "Your identity has been verified anonymously!",
    },
  ];

  // Handle file upload
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFile(event.target.files[0]);

      // Simulate file processing with a brief delay
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(1); // Move to the next step (Reading QR)

        // Randomly determine if an error will occur (10% chance)
        setErrorOccurred(Math.random() < 0.1);
      }, 1000);
    }
  };

  // Handle camera scan (simulation)
  const handleCameraScan = () => {
    // Simulate camera scanning process
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(1); // Move to Reading QR step

      // Randomly determine if an error will occur (10% chance)
      setErrorOccurred(Math.random() < 0.1);
    }, 1000);
  };

  // Simulate progression through verification steps
  useEffect(() => {
    if (step === 0) return;

    const timers = [
      // Step 1 -> 2: Reading QR to Generating Proof
      step === 1 && setTimeout(() => setStep(2), 3000),
      // Step 2 -> 3 or Error: Generating Proof to Complete
      step === 2 &&
        setTimeout(() => {
          if (!errorOccurred) {
            setStep(3);
            // Wait a bit to show success before closing
            setTimeout(() => onComplete(), 1500);
          } else {
            onError();
          }
        }, 6000),
    ];

    return () => timers.forEach((timer) => timer && clearTimeout(timer));
  }, [step, onComplete, onError, errorOccurred]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          {/* Anon Aadhaar Logo */}
          <div className="flex items-center justify-center mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 9V22H21V9L12 2Z"
                fill="#4F46E5"
                fillOpacity="0.2"
              />
              <path
                d="M12 2L3 9V22H21V9L12 2Z"
                stroke="#4F46E5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="14" r="4" stroke="#4F46E5" strokeWidth="2" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            {steps[step].title}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {steps[step].description}
          </p>

          {/* Step 0: Upload UI */}
          {step === 0 && (
            <div className="w-full">
              {/* PDF Upload */}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="aadhaar-file-upload"
              />
              <label
                htmlFor="aadhaar-file-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4 block"
              >
                <svg
                  className="w-10 h-10 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload your Aadhaar PDF
                </p>
                {uploadedFile && (
                  <p className="mt-2 text-xs text-green-600">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </label>

              <div className="flex items-center justify-center mb-4">
                <span className="text-gray-400">or</span>
              </div>

              {/* QR Scanner */}
              <div
                onClick={handleCameraScan}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
              >
                <svg
                  className="w-10 h-10 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Scan QR Code</p>
              </div>

              <button
                onClick={() => {
                  if (uploadedFile) {
                    // We already have a file, so proceed
                    setStep(1);
                    // Randomly determine if an error will occur (10% chance)
                    setErrorOccurred(Math.random() < 0.1);
                  } else {
                    // Trigger the file input click
                    fileInputRef.current.click();
                  }
                }}
                disabled={isProcessing}
                className={`w-full ${
                  isProcessing
                    ? "bg-gray-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white py-2 rounded-md transition-colors`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          )}

          {/* Step 1: Reading QR */}
          {step === 1 && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full w-1/3 animate-pulse"></div>
              </div>
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 bg-gray-200 rounded-md relative">
                  {/* QR Code animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-32 h-32 text-gray-400"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <rect
                        x="15"
                        y="15"
                        width="70"
                        height="70"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                      {/* Scanning line animation */}
                      <rect
                        x="15"
                        y="15"
                        width="70"
                        height="2"
                        fill="#4F46E5"
                        className="animate-[scanline_2s_ease-in-out_infinite]"
                        style={{
                          animation: "scanline 2s ease-in-out infinite",
                          transformOrigin: "center",
                        }}
                      />
                    </svg>
                    <style>{`
                      @keyframes scanline {
                        0% {
                          transform: translateY(0);
                        }
                        50% {
                          transform: translateY(65px);
                        }
                        100% {
                          transform: translateY(0);
                        }
                      }
                    `}</style>
                  </div>
                </div>
              </div>
              <div className="animate-pulse space-y-3 w-full">
                <div className="h-2 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          {/* Step 2: Generating Proof */}
          {step === 2 && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full w-2/3 animate-pulse"></div>
              </div>

              {/* Proof generation loader - styled like Anon Aadhaar's loader */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Circle loader */}
                  <svg className="animate-spin w-40 h-40" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="#4F46E5"
                      strokeWidth="4"
                      strokeDasharray="339.3"
                      strokeDashoffset="230"
                      fill="none"
                    />
                  </svg>

                  {/* Anon Aadhaar Logo in the center */}
                  <div className="absolute">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L3 9V22H21V9L12 2Z"
                        fill="#4F46E5"
                        fillOpacity="0.2"
                      />
                      <path
                        d="M12 2L3 9V22H21V9L12 2Z"
                        stroke="#4F46E5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="14"
                        r="4"
                        stroke="#4F46E5"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded p-3 text-sm text-yellow-800">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>
                    This process may take up to 2 minutes. Please keep this
                    window open.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center text-gray-500 text-sm animate-pulse">
                <p>Computing zero-knowledge proof...</p>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-green-600 h-2.5 rounded-full w-full"></div>
              </div>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 text-green-800 rounded-full p-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Verification Successful!
                </h3>
                <p className="text-gray-600">
                  Your identity has been verified anonymously.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AadhaarVerificationSimulation;

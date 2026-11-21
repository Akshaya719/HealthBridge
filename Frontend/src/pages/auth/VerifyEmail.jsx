import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import Button from "../../components/Button";

const OTP_REQUEST_TIMEOUT_MS = 25_000;

async function requestOtp(email) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OTP_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verifyEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Unable to send verification email.");
    }
  } catch (requestError) {
    if (requestError.name === "AbortError") {
      throw new Error("The server took too long to send the code. Please try again.");
    }
    throw requestError;
  } finally {
    clearTimeout(timeoutId);
  }
}

function VerifyEmail() {
  const [otp, setOtp] = useState("");

  const [error, setError] = useState({ otp: "" });
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(true);

  // Read email stored after signup
  const email = localStorage.getItem("pendingEmail");

  const hasSent = React.useRef(false);

  useEffect(() => {
    if (hasSent.current) return;

    if (!email) {
      setBackendError("No email is pending verification. Please sign up again.");
      setSendingOtp(false);
      return;
    }

    async function sendOtp() {
      hasSent.current = true;
      try {
        await requestOtp(email);
      } catch (requestError) {
        console.error("Error sending OTP:", requestError);
        setBackendError(requestError.message || "Unable to send verification email.");
      } finally {
        setSendingOtp(false);
      }
    }

    sendOtp();
  }, [email]);

  const handleResendOtp = async () => {
    if (!email) {
      setBackendError("No email is pending verification. Please sign up again.");
      return;
    }

    setBackendError("");
    setSendingOtp(true);
    try {
      await requestOtp(email);
      alert("OTP resent successfully!");
    } catch (requestError) {
      console.error("Error resending OTP:", requestError);
      setBackendError(requestError.message || "Unable to send verification email.");
    } finally {
      setSendingOtp(false);
    }
  };

  // ⭐ Validate OTP before submit
  function validateOtp() {
    const err = { otp: "" };
    let ok = true;

    if (!otp) {
      err.otp = "Please enter the OTP";
      ok = false;
    } else if (otp.length !== 4) {
      err.otp = "OTP must be 4 digits";
      ok = false;
    }

    setError(err);
    return ok;
  }

  // ⭐ Submit OTP to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    if (!validateOtp()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setBackendError(data.message || "Wrong OTP, please try again.");
        return;
      }

      alert("Email verified successfully!");

      localStorage.removeItem("pendingEmail");
      window.location.href = "/login";

    } catch (error) {
      console.log(error);
      setBackendError("Server error. Please try again later.");
      setLoading(false);
    }
  };


  // ⭐ Loading UI while OTP is being sent
  if (sendingOtp) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-200 to-blue-300">
        <div className="text-center flex flex-col items-center gap-3">
          
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

          <h2 className="text-xl font-semibold text-indigo-700">
            Sending OTP...
          </h2>

          <p className="text-gray-700 text-sm">
            Please wait while we send a verification code to your email.
          </p>

        </div>
      </div>
    );
  }


  // ⭐ Main Page (after OTP is sent)
  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-200 to-blue-300">

      <form
        className="w-96 bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center gap-6"
        onSubmit={handleSubmit}
      >

        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Verify Email</h1>
          <p className="text-gray-600 text-sm mt-1">
            Enter the 4-digit code sent to <b>{email}</b>.
          </p>
        </div>

        <input
          type="text"
          maxLength="4"
          className="tracking-widest text-center w-52 py-3 border-2 border-gray-300 rounded-xl 
                     focus:border-indigo-500 transition-all outline-none h-9"
          placeholder="••••"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button value={loading ? "Verifying..." : "Verify OTP"} disabled={loading} />
        {error.otp && <p className="text-red-500 text-sm">{error.otp}</p>}
        {backendError && <p className="text-red-500 text-sm">{backendError}</p>}

        <p className="text-sm text-gray-500">
          Didn’t get the code?{" "}
          <span 
            onClick={handleResendOtp}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Resend OTP
          </span>
        </p>

      </form>

    </div>
  );
}

export default VerifyEmail;

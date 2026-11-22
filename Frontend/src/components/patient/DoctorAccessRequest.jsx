import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

function DoctorAccessRequest({ role }) {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (role !== "Patient") {
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/doctor-access-request`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load request status");
        }
        setRequest(data.request);
      } catch (requestError) {
        setError(requestError.message || "Unable to load request status");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [role]);

  const submitRequest = async () => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/user/doctor-access-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit Doctor access request");
      }
      setRequest(data.request);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message || "Unable to submit Doctor access request");
    } finally {
      setSubmitting(false);
    }
  };

  const signInAgain = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (role !== "Patient") return null;

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Become a Doctor</h2>
      <p className="mt-1 text-sm text-slate-600">
        Request admin approval to use this account as a Doctor. Your account and email stay the same.
      </p>

      {loading && <p className="mt-4 text-sm text-slate-500">Checking request status...</p>}
      {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
      {message && <p className="mt-4 text-sm text-emerald-700" role="status">{message}</p>}

      {!loading && request?.status === "pending" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="status">
          Your request is pending admin review.
        </p>
      )}

      {!loading && request?.status === "approved" && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          <p>Your Doctor access request was approved. Sign in again, select Doctor, and complete your Doctor profile.</p>
          <button
            type="button"
            onClick={signInAgain}
            className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Sign in again as Doctor
          </button>
        </div>
      )}

      {!loading && request?.status === "rejected" && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <p>Your previous request was not approved.</p>
          {request.reviewNotes && <p className="mt-1">{request.reviewNotes}</p>}
        </div>
      )}

      {!loading && request?.status !== "pending" && request?.status !== "approved" && (
        <button
          type="button"
          onClick={submitRequest}
          disabled={submitting}
          className="mt-4 rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : request?.status === "rejected" ? "Submit another request" : "Request Doctor access"}
        </button>
      )}
    </section>
  );
}

export default DoctorAccessRequest;

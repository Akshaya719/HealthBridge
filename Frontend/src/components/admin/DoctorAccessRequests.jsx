import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

function DoctorAccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewingId, setReviewingId] = useState("");

  const fetchRequests = useCallback(async () => {
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/doctor-access-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(response.data.requests);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load Doctor access requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const reviewRequest = async (request, action) => {
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} this Doctor access request?`)) {
      return;
    }

    const reviewNotes = action === "reject"
      ? window.prompt("Optional note for the applicant:", "") ?? null
      : "";
    if (reviewNotes === null) return;

    setReviewingId(request._id);
    setError("");
    setNotice("");
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/doctor-access-requests/${request._id}/${action}`,
        action === "reject" ? { reviewNotes } : {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNotice(response.data.message);
      await fetchRequests();
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || "Unable to review this request");
    } finally {
      setReviewingId("");
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800">Doctor access requests</h2>
        <p className="mt-1 text-sm text-slate-500">
          Approval changes the existing Patient account to Doctor; it does not create another account.
        </p>
      </div>

      {error && <p className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="mx-6 mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{notice}</p>}

      {loading ? (
        <p className="p-6 text-sm text-slate-500">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">There are no pending Doctor access requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Requested</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{request.userId?.userName || "Unknown user"}</p>
                    <p className="text-xs text-slate-500">{request.userId?.email || "No email available"}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={reviewingId === request._id}
                        onClick={() => reviewRequest(request, "approve")}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={reviewingId === request._id}
                        onClick={() => reviewRequest(request, "reject")}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DoctorAccessRequests;

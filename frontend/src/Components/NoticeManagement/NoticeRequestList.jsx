import React, { useEffect, useState } from "react";
import axios from "axios";

function NoticeRequestList() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api/notices";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`);
      setRequests(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/approve/${id}`);
      fetchRequests();
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API}/reject/${id}`);
      fetchRequests();
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (loading) {
    return <h3>Loading requests...</h3>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notice Requests</h2>

      {requests.length === 0 && <p>No requests found.</p>}

      {requests.map((req) => (
        <div
          key={req._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>{req.title}</h3>

          <p>{req.content}</p>

          <p>
            <strong>Requested By:</strong> {req.requestedBy}
          </p>

          <p>
            <strong>Status:</strong> {req.status}
          </p>

          <button
            onClick={() => handleApprove(req._id)}
            style={{ marginRight: "10px" }}
          >
            Approve
          </button>

          <button onClick={() => handleReject(req._id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

export default NoticeRequestList;
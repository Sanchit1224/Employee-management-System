import React, { useState, useContext } from "react";
import axios from "../api/axios";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";

const LeaveRequestForm = () => {
  const { user } = useContext(AuthContext);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/leave/apply", { reason, startDate, endDate }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success("Leave request submitted!");
    } catch (err) {
      toast.error("Error submitting leave request");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Apply for Leave</h3>
      <label>Reason:</label>
      <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required />
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <label>End Date:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default LeaveRequestForm;

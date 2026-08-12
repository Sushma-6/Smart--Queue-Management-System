import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

function QueueEntryPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/queue/join", {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      navigate(`/status/${res.data.phone}`);
    } catch (error) {
      console.log("Submit error:", error);
      console.log("Error response:", error.response);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="themed-page" style={styles.page}>
      <div style={styles.topBar}>
        <Link to="/" style={styles.homeButton}>
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      <div style={styles.container}>
        <div className="themed-card" style={styles.card}>
          <h1 style={styles.title}>Welcome to Smart Queue</h1>
          <p className="themed-subtext" style={styles.subtitle}>
            Click below to join the queue
          </p>

          {!showForm ? (
            <button style={styles.joinButton} onClick={() => setShowForm(true)}>
              Join Queue
            </button>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                className="themed-input"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <input
                className="themed-input"
                type="tel"
                name="phone"
                placeholder="Enter 10 digit phone number"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setFormData((prev) => ({ ...prev, phone: value }));
                  }
                }}
                pattern="[0-9]{10}"
                maxLength="10"
                required
                style={styles.input}
              />

              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  homeButton: {
    textDecoration: "none",
    background: "#343a40",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "15px",
  },
  container: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "420px",
  },
  title: {
    marginBottom: "10px",
    color: "inherit",
  },
  subtitle: {
    marginBottom: "25px",
  },
  joinButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "10px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    fontSize: "16px",
  },
  submitButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default QueueEntryPage;
import React, { useContext, useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { ThemeContext } from "../context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    waitingList: [],
    currentlyServing: null,
    totalServed: 0,
  });
  const [serviceTimes, setServiceTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/queue/admin");
      setDashboardData(res.data);

      const initialTimes = {};
      res.data.waitingList.forEach((user) => {
        initialTimes[user._id] = user.serviceTimeMinutes || 10;
      });
      setServiceTimes(initialTimes);
    } catch (error) {
      console.log("Admin fetch error:", error);
      alert(error.response?.data?.message || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const playCallNextSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioContext = new AudioCtx();

      const beep = (startTime, frequency) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
      };

      const now = audioContext.currentTime;
      beep(now, 800);
      beep(now + 0.3, 1000);
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const handleCallNext = async () => {
    try {
      setLoading(true);
      await API.put("/queue/call-next");
      playCallNextSound();
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to call next");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (id, value) => {
    const onlyNumbers = value.replace(/\D/g, "");
    setServiceTimes((prev) => ({
      ...prev,
      [id]: onlyNumbers,
    }));
  };

  const handleUpdateWaitTime = async (id) => {
    try {
      const value = Number(serviceTimes[id]);

      if (!value || value <= 0) {
        alert("Enter a valid service time in minutes");
        return;
      }

      await API.put(`/queue/update-wait/${id}`, {
        serviceTimeMinutes: value,
      });

      fetchDashboard();
      alert("Waiting time updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update waiting time");
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return "";
    const phoneStr = String(phone);
    return `xxxxxx${phoneStr.slice(-4)}`;
  };

  const waitingCount = dashboardData.waitingList.filter(
    (user) => user.status === "waiting"
  ).length;

  const chartData = {
    labels: ["Total Served", "Waiting"],
    datasets: [
      {
        label: "Queue Overview",
        data: [dashboardData.totalServed, waitingCount],
        backgroundColor: darkMode
          ? ["rgba(54, 162, 235, 0.8)", "rgba(255, 206, 86, 0.8)"]
          : ["rgba(54, 162, 235, 0.7)", "rgba(75, 192, 192, 0.7)"],
        borderColor: darkMode
          ? ["rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"]
          : ["rgba(54, 162, 235, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: darkMode ? "#ffffff" : "#111111",
        },
      },
      title: {
        display: true,
        text: "Served vs Waiting",
        color: darkMode ? "#ffffff" : "#111111",
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? "#ffffff" : "#111111",
        },
        grid: {
          color: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        },
      },
      y: {
        ticks: {
          color: darkMode ? "#ffffff" : "#111111",
        },
        grid: {
          color: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        },
      },
    },
  };

  return (
    <div className="themed-page" style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <Link to="/" style={styles.homeButton}>
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.topCards}>
          <div className="themed-card" style={styles.card}>
            <h3>Currently Serving</h3>
            {dashboardData.currentlyServing ? (
              <>
                <p>
                  <strong>Name:</strong> {dashboardData.currentlyServing.name}
                </p>
                <p>
                  <strong>Token:</strong>{" "}
                  {dashboardData.currentlyServing.tokenNumber}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {maskPhone(dashboardData.currentlyServing.phone)}
                </p>
              </>
            ) : (
              <p>No one is currently serving</p>
            )}
          </div>

          <div className="themed-card" style={styles.card}>
            <h3>Total Served</h3>
            <p style={styles.bigNumber}>{dashboardData.totalServed}</p>
          </div>

          <div className="themed-card" style={styles.card}>
            <h3>Actions</h3>
            <button
              style={styles.callNextButton}
              onClick={handleCallNext}
              disabled={loading}
            >
              {loading ? "Processing..." : "Call Next"}
            </button>
          </div>
        </div>

        <div className="themed-card" style={styles.graphCard}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="themed-card" style={styles.tableCard}>
          <h2 style={styles.sectionTitle}>Waiting List</h2>

          {dashboardData.waitingList.length === 0 ? (
            <p>No users in queue</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table className="themed-table" style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Token</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Position</th>
                    <th style={styles.th}>People Ahead</th>
                    <th style={styles.th}>Service Time (min)</th>
                    <th style={styles.th}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.waitingList.map((user) => (
                    <tr key={user._id}>
                      <td style={styles.td}>{user.tokenNumber}</td>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{maskPhone(user.phone)}</td>
                      <td style={styles.td}>{user.status}</td>
                      <td style={styles.td}>{user.position}</td>
                      <td style={styles.td}>{user.peopleAhead}</td>
                      <td style={styles.td}>
                        <input
                          className="themed-input"
                          type="text"
                          value={serviceTimes[user._id] || ""}
                          onChange={(e) =>
                            handleTimeChange(user._id, e.target.value)
                          }
                          style={styles.input}
                        />
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.updateButton}
                          onClick={() => handleUpdateWaitTime(user._id)}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  homeButton: {
    textDecoration: "none",
    background: "#343a40",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "15px",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "inherit",
  },
  topCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  graphCard: {
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  bigNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#007bff",
    margin: "10px 0 0 0",
  },
  callNextButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  tableCard: {
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    marginBottom: "18px",
    color: "inherit",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px",
    textAlign: "left",
  },
  td: {
    padding: "12px",
  },
  input: {
    width: "70px",
    padding: "8px",
    borderRadius: "6px",
  },
  updateButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "9px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AdminDashboard;
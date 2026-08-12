import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

function UserStatus() {
  const { phone } = useParams();
  const [queueData, setQueueData] = useState(null);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const hasShownTurnAlert = useRef(false);

  const formatTime = (totalSeconds) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const playTurnSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioContext = new AudioCtx();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Turn sound error:", error);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get(`/queue/status/${phone}`);
        setQueueData(res.data);
        setError("");

        const waitInMinutes = Number(res.data.estimatedWaitTime || 0);
        setRemainingSeconds(Math.max(0, Math.round(waitInMinutes * 60)));
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch queue status"
        );
      }
    };

    fetchStatus();
    const refreshInterval = setInterval(fetchStatus, 5000);

    return () => clearInterval(refreshInterval);
  }, [phone]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (!queueData) return;

    if (queueData.peopleAhead === 0 && !hasShownTurnAlert.current) {
      playTurnSound();
      alert("🔔 It's your turn now!");
      hasShownTurnAlert.current = true;
    }

    if (queueData.peopleAhead > 0) {
      hasShownTurnAlert.current = false;
    }
  }, [queueData]);

  if (error) {
    return (
      <div className="themed-page" style={styles.page}>
        <div style={styles.topBar}>
          <Link to="/" style={styles.homeButton}>
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div style={styles.centerWrap}>
          <div className="themed-card" style={styles.card}>
            <h2>{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!queueData) {
    return (
      <div className="themed-page" style={styles.page}>
        <div style={styles.topBar}>
          <Link to="/" style={styles.homeButton}>
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div style={styles.centerWrap}>
          <div className="themed-card" style={styles.card}>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="themed-page" style={styles.page}>
      <div style={styles.topBar}>
        <Link to="/" style={styles.homeButton}>
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      <div style={styles.centerWrap}>
        <div className="themed-card" style={styles.card}>
          <h1 style={styles.title}>Queue Status</h1>

          <div className="themed-box" style={styles.ticketBox}>
            <p style={styles.row}>
              <strong>Token Number:</strong> {queueData.tokenNumber}
            </p>

            <p style={styles.row}>
              <strong>Position:</strong> {queueData.position}
            </p>

            <p style={styles.row}>
              <strong>People Ahead:</strong> {queueData.peopleAhead}
            </p>

            <p style={styles.row}>
              <strong>Estimated Wait Time:</strong> {queueData.estimatedWaitTime}{" "}
              minutes
            </p>

            <p style={styles.row}>
              <strong>Be at Queue By:</strong> {queueData.expectedServiceTime}
            </p>

            <div className="themed-box" style={styles.countdownBox}>
              <p className="themed-subtext" style={styles.countdownLabel}>
                Live Countdown
              </p>
              <h2 style={styles.countdownTime}>{formatTime(remainingSeconds)}</h2>
            </div>

            {queueData.peopleAhead === 1 && (
              <div style={styles.nextBox}>
                <p style={styles.nextText}>🟢 You are next in queue</p>
              </div>
            )}

            {queueData.peopleAhead === 0 && (
              <div style={styles.turnBox}>
                <p style={styles.turnText}>🔔 It's your turn now!</p>
              </div>
            )}

            <p style={styles.statusText}>
              <strong>Status:</strong> {queueData.status}
            </p>
          </div>
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
  centerWrap: {
    minHeight: "calc(100vh - 90px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "450px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "inherit",
  },
  ticketBox: {
    borderRadius: "12px",
    padding: "20px",
    textAlign: "left",
  },
  row: {
    fontSize: "18px",
    margin: "14px 0",
    color: "inherit",
  },
  countdownBox: {
    marginTop: "22px",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "center",
  },
  countdownLabel: {
    margin: 0,
    fontSize: "16px",
  },
  countdownTime: {
    margin: "10px 0 0 0",
    fontSize: "36px",
    color: "#007bff",
    letterSpacing: "2px",
  },
  nextBox: {
    marginTop: "20px",
    background: "#e8f5e9",
    padding: "14px",
    borderRadius: "10px",
    textAlign: "center",
  },
  nextText: {
    color: "#2e7d32",
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
  },
  turnBox: {
    marginTop: "20px",
    background: "#fff3cd",
    padding: "16px",
    borderRadius: "10px",
    textAlign: "center",
  },
  turnText: {
    color: "#856404",
    fontSize: "22px",
    fontWeight: "bold",
    margin: 0,
  },
  statusText: {
    marginTop: "18px",
    fontSize: "17px",
    color: "inherit",
  },
};

export default UserStatus;
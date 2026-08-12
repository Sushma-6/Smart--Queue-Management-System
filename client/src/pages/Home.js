import React, { useContext } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { ThemeContext } from "../context/ThemeContext";

function Home() {
  const { darkMode } = useContext(ThemeContext);
  const queueEntryUrl = `http://${process.env.REACT_APP_HOST || "localhost"}:3000/queue-entry`;


  return (
    <div className="themed-page" style={styles.page}>
      <nav className="themed-card" style={styles.navbar}>
        <h2 style={styles.logo}>Smart Queue</h2>

        <div style={styles.navLinks}>
          <Link to="/admin" style={styles.navButton}>
            Admin Dashboard
          </Link>
          <Link to="/analytics" style={styles.navButton}>
            Analytics Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div style={styles.container}>
        <div className="themed-card" style={styles.card}>
          <h1 style={styles.title}>Smart Queue System</h1>
          <p className="themed-subtext" style={styles.subtitle}>
            Scan this QR code to continue
          </p>

          <div className="themed-box" style={styles.qrWrapper}>
            <QRCodeCanvas
              value={queueEntryUrl}
              size={240}
              bgColor="#ffffff"
              fgColor={darkMode ? "#111111" : "#000000"}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="themed-subtext" style={styles.linkText}>
            {queueEntryUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    borderRadius: 0,
    border: "none",
  },
  logo: {
    margin: 0,
    fontSize: "28px",
    color: "inherit",
  },
  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  navButton: {
    textDecoration: "none",
    background: "#28a745",
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
    padding: "20px",
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
    marginBottom: "20px",
  },
  qrWrapper: {
    margin: "20px auto",
    padding: "18px",
    borderRadius: "16px",
    display: "inline-block",
  },
  linkText: {
    fontSize: "14px",
    wordBreak: "break-all",
  },
};

export default Home;
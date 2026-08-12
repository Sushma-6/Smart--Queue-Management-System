import React, { useContext, useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  { label: "09:00 - 10:00", value: 9 },
  { label: "10:00 - 11:00", value: 10 },
  { label: "11:00 - 12:00", value: 11 },
  { label: "12:00 - 13:00", value: 12 },
  { label: "13:00 - 14:00", value: 13 },
  { label: "14:00 - 15:00", value: 14 },
  { label: "15:00 - 16:00", value: 15 },
  { label: "16:00 - 17:00", value: 16 },
  { label: "17:00 - 18:00", value: 17 },
  { label: "18:00 - 19:00", value: 18 },
];

function Analytics() {
  const { darkMode } = useContext(ThemeContext);

  const [peakHours, setPeakHours] = useState([]);
  const [peakDays, setPeakDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [dayEstimate, setDayEstimate] = useState(null);

  const [selectedHour, setSelectedHour] = useState(9);
  const [slotEstimate, setSlotEstimate] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const hoursRes = await API.get("/analytics/peak-hours");
        setPeakHours(hoursRes.data);

        const daysRes = await API.get("/analytics/peak-days");
        const sortedDays = [...daysRes.data].sort(
          (a, b) => daysOrder.indexOf(a._id) - daysOrder.indexOf(b._id)
        );
        setPeakDays(sortedDays);
      } catch (error) {
        console.log("Initial analytics fetch error:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const res = await API.get(`/analytics/estimate/${selectedDay}`);
        setDayEstimate(res.data);
      } catch (error) {
        console.log("Day estimate fetch error:", error);
        setDayEstimate(null);
      }
    };

    fetchEstimate();
  }, [selectedDay]);

  useEffect(() => {
    const fetchSlotEstimate = async () => {
      try {
        const res = await API.get(
          `/analytics/slot-estimate/${selectedDay}/${selectedHour}`
        );
        setSlotEstimate(res.data);
      } catch (error) {
        console.log("Slot estimate fetch error:", error);
        setSlotEstimate(null);
      }
    };

    fetchSlotEstimate();
  }, [selectedDay, selectedHour]);

  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? "#ffffff" : "#111111",
        },
      },
      title: {
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

  const peakHoursData = {
    labels: peakHours.map((item) => `${item._id}:00`),
    datasets: [
      {
        label: "Visitors by Hour",
        data: peakHours.map((item) => item.count),
        backgroundColor: darkMode
          ? "rgba(54, 162, 235, 0.8)"
          : "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const peakDaysData = {
    labels: peakDays.map((item) => item._id),
    datasets: [
      {
        label: "Visitors by Day",
        data: peakDays.map((item) => item.count),
        backgroundColor: darkMode
          ? "rgba(255, 206, 86, 0.8)"
          : "rgba(75, 192, 192, 0.7)",
        borderColor: darkMode
          ? "rgba(255, 206, 86, 1)"
          : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const avgWaitByHourData = {
    labels: peakHours.map((item) => `${item._id}:00`),
    datasets: [
      {
        label: "Average Wait Time by Hour (min)",
        data: peakHours.map((item) =>
          Number(item.avgWaitTime?.toFixed(2) || 0)
        ),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: darkMode
          ? "rgba(153, 102, 255, 0.35)"
          : "rgba(153, 102, 255, 0.2)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const getSlotLabel = (hour) => {
    const slot = timeSlots.find((item) => item.value === hour);
    return slot ? slot.label : `${hour}:00`;
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

        <h1 style={styles.title}>Analytics Dashboard</h1>

        <div style={styles.grid}>
          <div className="themed-card" style={styles.card}>
            <h2 style={styles.cardTitle}>Peak Hour of the Day</h2>
            <Bar data={peakHoursData} options={commonChartOptions} />
          </div>

          <div className="themed-card" style={styles.card}>
            <h2 style={styles.cardTitle}>Peak Day of the Week</h2>
            <Bar data={peakDaysData} options={commonChartOptions} />
          </div>

          <div className="themed-card" style={styles.card}>
            <h2 style={styles.cardTitle}>Average Wait Time by Hour</h2>
            <Line data={avgWaitByHourData} options={commonChartOptions} />
          </div>

          <div className="themed-card" style={styles.card}>
            <h2 style={styles.cardTitle}>Estimate for Selected Day</h2>

            <label style={styles.label}>Select Day</label>
            <select
              className="themed-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={styles.select}
            >
              {daysOrder.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {dayEstimate ? (
              <div className="themed-box" style={styles.estimateBox}>
                <p style={styles.estimateRow}>
                  <strong>Day:</strong> {dayEstimate._id}
                </p>
                <p style={styles.estimateRow}>
                  <strong>Estimated Queue Length:</strong>{" "}
                  {Math.round(dayEstimate.avgQueueLength)}
                </p>
                <p style={styles.estimateRow}>
                  <strong>Estimated Wait Time:</strong>{" "}
                  {Number(dayEstimate.avgWaitTime).toFixed(2)} minutes
                </p>
                <p style={styles.estimateRow}>
                  <strong>Total Historical Entries:</strong>{" "}
                  {dayEstimate.totalEntries}
                </p>
              </div>
            ) : (
              <p>No data available for selected day.</p>
            )}
          </div>

          <div className="themed-card" style={styles.card}>
            <h2 style={styles.cardTitle}>Best Time Slot Suggestion</h2>

            <label style={styles.label}>Select Day</label>
            <select
              className="themed-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={styles.select}
            >
              {daysOrder.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <label style={styles.label}>Select Time Slot</label>
            <select
              className="themed-select"
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              style={styles.select}
            >
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>

            {slotEstimate ? (
              <div className="themed-box" style={styles.estimateBox}>
                <p style={styles.estimateRow}>
                  <strong>Selected Slot:</strong> {slotEstimate.day},{" "}
                  {getSlotLabel(slotEstimate.hour)}
                </p>
                <p style={styles.estimateRow}>
                  <strong>Estimated Queue Length:</strong>{" "}
                  {Math.round(slotEstimate.avgQueueLength)}
                </p>
                <p style={styles.estimateRow}>
                  <strong>Estimated Wait Time:</strong>{" "}
                  {Number(slotEstimate.avgWaitTime).toFixed(2)} minutes
                </p>
                <p
                  style={{
                    ...styles.estimateRow,
                    color: slotEstimate.isGoodSlot ? "#2e7d32" : "#d32f2f",
                    fontWeight: "bold",
                  }}
                >
                  {slotEstimate.message}
                </p>

                {slotEstimate.isGoodSlot ? (
                  <p style={styles.estimateRow}>
                    <strong>Recommendation:</strong> This is a good slot. Go
                    ahead.
                  </p>
                ) : slotEstimate.suggestedSlot ? (
                  <p style={styles.estimateRow}>
                    <strong>Suggestion:</strong> This is a rush hour. Try{" "}
                    <strong>{getSlotLabel(slotEstimate.suggestedSlot.hour)}</strong>{" "}
                    instead for less waiting.
                  </p>
                ) : (
                  <p style={styles.estimateRow}>
                    <strong>Suggestion:</strong> This slot is busy and no better
                    nearby slot was found.
                  </p>
                )}
              </div>
            ) : (
              <p>No data available for selected slot.</p>
            )}
          </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "25px",
  },
  card: {
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    marginBottom: "18px",
    fontSize: "22px",
    color: "inherit",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "16px",
  },
  estimateBox: {
    borderRadius: "12px",
    padding: "18px",
  },
  estimateRow: {
    fontSize: "18px",
    margin: "12px 0",
    color: "inherit",
  },
};

export default Analytics;
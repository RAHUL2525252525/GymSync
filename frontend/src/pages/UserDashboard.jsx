import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const name = localStorage.getItem("name");

  const loadAll = async () => {
    try {
      const [summaryRes, attendanceRes, paymentsRes, membershipsRes] = await Promise.all([
        api.get("/api/dashboard/user"),
        api.get("/api/attendance/me"),
        api.get("/api/payments/me"),
        api.get("/api/memberships/me"),
      ]);
      setSummary(summaryRes.data);
      setAttendance(attendanceRes.data);
      setPayments(paymentsRes.data);
      setMemberships(membershipsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCheckIn = async () => {
    try {
      await api.post("/api/attendance/checkin");
      flash("Checked in successfully!");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Check-in failed");
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await api.put(`/api/attendance/checkout/${attendanceId}`);
      flash("Checked out successfully!");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Check-out failed");
    }
  };

  const lastAttendance = attendance[attendance.length - 1];
  const canCheckIn = !lastAttendance || lastAttendance.check_out;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "attendance", label: "Attendance", icon: "✅" },
    { id: "membership", label: "My Membership", icon: "🗓️" },
    { id: "payments", label: "Payments", icon: "💰" },
  ];

  const s = getStyles(isMobile);

  return (
    <div style={s.page}>
      <style>{`
        .gs-nav::-webkit-scrollbar { display: none; }
        .gs-table-wrapper { -webkit-overflow-scrolling: touch; }
      `}</style>

      <div style={s.sidebar}>
        <div style={s.brandRow}>
          <div style={s.logoBadge}>🏋️</div>
          <div>
            <h2 style={s.logo}>Gym Tracker</h2>
            {!isMobile && <p style={s.welcomeText}>Welcome, {name}</p>}
          </div>
          {isMobile && (
            <button style={s.logoutBtnMobile} onClick={handleLogout}>⏻</button>
          )}
        </div>
        <nav style={s.nav} className="gs-nav">
          {tabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ ...s.navItem, ...(tab === t.id ? s.navItemActive : {}) }}
            >
              <span style={s.navIcon}>{t.icon}</span>
              {(!isMobile || tab === t.id) && t.label}
            </div>
          ))}
        </nav>
        {!isMobile && (
          <button style={s.logoutBtn} onClick={handleLogout}>⏻ Logout</button>
        )}
      </div>

      <div style={s.content}>
        {message && <div style={s.toast}>✓ {message}</div>}

        {tab === "overview" && summary && (
          <div>
            <h1 style={s.heading}>Welcome back, {summary.name} 👋</h1>
            <div style={s.statsGrid}>
              <StatCard label="Total Visits" value={summary.total_visits} icon="🏃" s={s} />
              <StatCard label="Total Paid" value={`₹${summary.total_paid.toFixed(2)}`} icon="💰" s={s} />
              <StatCard
                label="Membership Status"
                value={summary.active_membership ? summary.active_membership.status : "No Active Plan"}
                icon={summary.active_membership ? "✅" : "⚠️"}
                s={s}
              />
            </div>
            <div style={s.checkInBox}>
              <p style={s.checkInText}>
                {canCheckIn ? "Ready to hit the gym today?" : "You're currently checked in."}
              </p>
              {canCheckIn ? (
                <button style={s.primaryBtn} onClick={handleCheckIn}>Check In</button>
              ) : (
                <button style={s.dangerBtn} onClick={() => handleCheckOut(lastAttendance.id)}>Check Out</button>
              )}
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div>
            <h1 style={s.heading}>My Attendance</h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Check-In</th>
                    <th style={s.th}>Check-Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice().reverse().map((a) => (
                    <tr key={a.id} style={s.tr}>
                      <td style={s.td}>{new Date(a.check_in).toLocaleString()}</td>
                      <td style={s.td}>{a.check_out ? new Date(a.check_out).toLocaleString() : "Still active"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && <p style={s.emptyText}>No attendance records yet.</p>}
            </div>
          </div>
        )}

        {tab === "membership" && (
          <div>
            <h1 style={s.heading}>My Membership</h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Plan ID</th>
                    <th style={s.th}>Start Date</th>
                    <th style={s.th}>End Date</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m) => (
                    <tr key={m.id} style={s.tr}>
                      <td style={s.td}>{m.plan_id}</td>
                      <td style={s.td}>{m.start_date}</td>
                      <td style={s.td}>{m.end_date}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusBadge,
                          ...(m.status === "active" ? s.statusActive : s.statusInactive),
                        }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {memberships.length === 0 && <p style={s.emptyText}>No membership assigned yet. Contact the admin.</p>}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <h1 style={s.heading}>My Payments</h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={s.tr}>
                      <td style={s.td}>₹{p.amount}</td>
                      <td style={s.td}>{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, ...s.statusActive }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <p style={s.emptyText}>No payments recorded yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, s }) {
  return (
    <div style={s.statCard}>
      <div style={s.statIconWrap}>{icon}</div>
      <div>
        <p style={s.statLabel}>{label}</p>
        <h2 style={s.statValue}>{value}</h2>
      </div>
    </div>
  );
}

function getStyles(isMobile) {
  return {
    page: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#faf7f2",
    },
    sidebar: {
      width: isMobile ? "100%" : "240px",
      background: "#ffffff",
      color: "#2b2420",
      padding: isMobile ? "14px 16px" : "24px 16px",
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "1px solid #f0e6d8",
      borderBottom: isMobile ? "1px solid #f0e6d8" : "none",
      boxShadow: isMobile ? "0 4px 16px rgba(255,122,26,0.06)" : "2px 0 20px rgba(255, 122, 26, 0.05)",
      position: isMobile ? "sticky" : "static",
      top: 0,
      zIndex: 10,
      boxSizing: "border-box",
    },
    brandRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: isMobile ? "12px" : "30px",
      paddingBottom: isMobile ? "12px" : "20px",
      borderBottom: "1px solid #f0e6d8",
    },
    logoBadge: {
      width: isMobile ? "36px" : "42px",
      height: isMobile ? "36px" : "42px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #ff7a1a, #ffb156)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? "17px" : "20px",
      flexShrink: 0,
      boxShadow: "0 8px 18px rgba(255,122,26,0.35)",
    },
    logo: { fontSize: isMobile ? "15px" : "17px", margin: 0, color: "#2b2420", fontWeight: 800, letterSpacing: "-0.3px" },
    welcomeText: { fontSize: "12px", color: "#a68f75", margin: "2px 0 0 0" },
    nav: {
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: "4px",
      flex: isMobile ? "none" : 1,
      overflowX: isMobile ? "auto" : "visible",
      paddingBottom: isMobile ? "2px" : 0,
    },
    navItem: {
      padding: isMobile ? "9px 12px" : "11px 14px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: isMobile ? "13px" : "14px",
      color: "#7a6c5d",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 500,
      whiteSpace: "nowrap",
      flexShrink: 0,
      transition: "background 0.15s ease, color 0.15s ease",
    },
    navIcon: { fontSize: "15px" },
    navItemActive: {
      background: "linear-gradient(135deg, #ff7a1a, #ffb156)",
      color: "#ffffff",
      fontWeight: "bold",
      boxShadow: "0 6px 16px rgba(255,122,26,0.3)",
    },
    logoutBtn: {
      marginTop: "20px",
      padding: "11px",
      background: "#fff5ec",
      border: "1px solid #ffd9b3",
      borderRadius: "10px",
      color: "#e2521a",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
    },
    logoutBtnMobile: {
      marginLeft: "auto",
      width: "34px",
      height: "34px",
      background: "#fff5ec",
      border: "1px solid #ffd9b3",
      borderRadius: "9px",
      color: "#e2521a",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      flexShrink: 0,
    },
    content: { flex: 1, padding: isMobile ? "16px" : "32px", overflowY: "auto", minWidth: 0, boxSizing: "border-box" },
    heading: {
      marginBottom: isMobile ? "14px" : "22px",
      color: "#2b2420",
      fontSize: isMobile ? "19px" : "24px",
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      letterSpacing: "-0.4px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
      gap: isMobile ? "10px" : "16px",
      marginBottom: isMobile ? "14px" : "24px",
    },
    statCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: isMobile ? "16px" : "20px",
      border: "1px solid #f0e6d8",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      boxShadow: "0 6px 20px rgba(184, 130, 60, 0.08)",
    },
    statIconWrap: {
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      background: "linear-gradient(135deg, #fff0e0, #ffe2c4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "21px",
      flexShrink: 0,
    },
    statLabel: { fontSize: "12px", color: "#a68f75", marginBottom: "4px", fontWeight: 600 },
    statValue: { fontSize: isMobile ? "20px" : "23px", color: "#2b2420", margin: 0, fontWeight: 800 },
    checkInBox: {
      background: "#ffffff",
      padding: isMobile ? "18px" : "24px",
      borderRadius: "16px",
      border: "1px solid #f0e6d8",
      boxShadow: "0 6px 20px rgba(184, 130, 60, 0.06)",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "14px" : "0",
    },
    checkInText: { margin: 0, color: "#7a6c5d", fontSize: "14px" },
    tableWrapper: {
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #f0e6d8",
      overflow: isMobile ? "auto" : "hidden",
      boxShadow: "0 6px 20px rgba(184, 130, 60, 0.06)",
    },
    table: {
      width: "100%",
      minWidth: isMobile ? "480px" : "auto",
      borderCollapse: "collapse",
    },
    tr: {
      borderBottom: "1px solid #f5eee2",
    },
    th: {
      textAlign: "left",
      padding: isMobile ? "11px 12px" : "13px 16px",
      background: "#fff8f0",
      color: "#c2660f",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
    },
    td: { padding: isMobile ? "11px 12px" : "13px 16px", fontSize: "13px", color: "#4a4038", whiteSpace: "nowrap" },
    emptyText: { padding: "20px 16px", color: "#bcae9c", fontSize: "13px", margin: 0 },
    primaryBtn: {
      padding: "12px 20px",
      background: "linear-gradient(135deg, #ff7a1a, #ffa64d)",
      color: "#ffffff",
      border: "none",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
      boxShadow: "0 8px 18px rgba(255,122,26,0.3)",
    },
    dangerBtn: {
      padding: "12px 20px",
      background: "#fff0ee",
      color: "#e0432a",
      border: "1px solid #ffd0c8",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
    },
    statusBadge: {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold",
      textTransform: "capitalize",
      whiteSpace: "nowrap",
    },
    statusActive: {
      background: "#fff0e0",
      color: "#d9650f",
      border: "1px solid #ffd9b3",
    },
    statusInactive: {
      background: "#f2efe9",
      color: "#a89c8c",
      border: "1px solid #e6ded1",
    },
    toast: {
      background: "linear-gradient(135deg, #fff0e0, #ffe6cc)",
      color: "#b6560f",
      border: "1px solid #ffd9b3",
      padding: "11px 16px",
      borderRadius: "10px",
      marginBottom: "18px",
      fontSize: "13px",
      fontWeight: "bold",
      boxShadow: "0 4px 14px rgba(255,122,26,0.15)",
    },
  };
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/* ---------------- Icons (hand-drawn, no external deps) ---------------- */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconDumbbell(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 9v6M2 10v4M20 9v6M22 10v4" />
      <path d="M7 12h10" />
      <rect x="5" y="7.5" width="3" height="9" rx="1" />
      <rect x="16" y="7.5" width="3" height="9" rx="1" />
    </svg>
  );
}
function IconOverview(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}
function IconAttendance(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 12.5l2.2 2.2L16 9.5" />
    </svg>
  );
}
function IconMembership(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3M16 3v3" />
    </svg>
  );
}
function IconPayments(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 9.5h19" />
      <path d="M6 14.5h4" />
    </svg>
  );
}
function IconPower(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 3.5v8" />
      <path d="M7.5 6a7 7 0 1 0 9 0" />
    </svg>
  );
}
function IconVisits(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 12l4-7 4 11 3-7 3 4h4" />
    </svg>
  );
}
function IconCoin(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.3 9.6c0-1.2 1.2-2.1 2.7-2.1s2.7.8 2.7 2c0 2.6-5.4 1.3-5.4 3.9 0 1.2 1.2 2.1 2.7 2.1s2.7-.9 2.7-2.1" />
    </svg>
  );
}
function IconBadge(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.8L7 21l5-2.6L17 21l-1.5-7.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [message, setMessage] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState(null);
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

  // Lightweight background refresh — only the stat summary, so check-in/out
  // never has to wait on a full 4-endpoint reload to feel "done".
  const refreshSummary = async () => {
    try {
      const res = await api.get("/api/dashboard/user");
      setSummary(res.data);
    } catch {
      // silent — the optimistic UI state stays as the source of truth
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
    if (checkingIn) return;
    setCheckingIn(true);

    // Optimistic: show the check-in immediately, reconcile with the server after.
    const optimisticId = `temp-${Date.now()}`;
    const optimisticRecord = {
      id: optimisticId,
      check_in: new Date().toISOString(),
      check_out: null,
    };
    setAttendance((prev) => [...prev, optimisticRecord]);

    try {
      const res = await api.post("/api/attendance/checkin");
      const real = res?.data;
      setAttendance((prev) =>
        prev.map((a) => (a.id === optimisticId ? (real && real.id ? real : a) : a))
      );
      flash("Checked in successfully!");
      refreshSummary();
    } catch (err) {
      setAttendance((prev) => prev.filter((a) => a.id !== optimisticId));
      flash(err.response?.data?.detail || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (checkingOutId) return;
    setCheckingOutId(attendanceId);

    const checkOutTime = new Date().toISOString();
    let previousValue = null;
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id === attendanceId) {
          previousValue = a.check_out;
          return { ...a, check_out: checkOutTime };
        }
        return a;
      })
    );

    try {
      await api.put(`/api/attendance/checkout/${attendanceId}`);
      flash("Checked out successfully!");
      refreshSummary();
    } catch (err) {
      setAttendance((prev) =>
        prev.map((a) => (a.id === attendanceId ? { ...a, check_out: previousValue } : a))
      );
      flash(err.response?.data?.detail || "Check-out failed");
    } finally {
      setCheckingOutId(null);
    }
  };

  const lastAttendance = attendance[attendance.length - 1];
  const canCheckIn = !lastAttendance || lastAttendance.check_out;

  const tabs = [
    { id: "overview", label: "Overview", icon: <IconOverview /> },
    { id: "attendance", label: "Attendance", icon: <IconAttendance /> },
    { id: "membership", label: "My membership", icon: <IconMembership /> },
    { id: "payments", label: "Payments", icon: <IconPayments /> },
  ];

  const s = getStyles(isMobile);

  const goToTab = (id) => setTab(id);
  const onNavKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToTab(id);
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .gs-nav::-webkit-scrollbar { display: none; }
        .gs-table-wrapper { -webkit-overflow-scrolling: touch; }
        .gs-nav-item:hover { background: rgba(255,255,255,0.05); }
        .gs-nav-item:focus-visible,
        .gs-btn:focus-visible,
        .gs-logout:focus-visible {
          outline: 2px solid #ff5a1f;
          outline-offset: 2px;
        }
        .gs-btn { transition: transform 0.12s ease, box-shadow 0.12s ease; }
        .gs-btn:active { transform: scale(0.97); }
        @keyframes gs-toast-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gs-pulse {
          0% { box-shadow: 0 0 0 0 rgba(200,255,77,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(200,255,77,0); }
          100% { box-shadow: 0 0 0 0 rgba(200,255,77,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-btn, .gs-pulse-dot { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div style={s.sidebar}>
        <div style={s.brandRow}>
          <div style={s.logoBadge}>
            <IconDumbbell width={20} height={20} />
          </div>
          <div>
            <h2 style={s.logo}>Gym Tracker</h2>
            {!isMobile && <p style={s.welcomeText}>Welcome, {name}</p>}
          </div>
          {isMobile && (
            <button
              style={s.logoutBtnMobile}
              className="gs-logout"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <IconPower width={16} height={16} />
            </button>
          )}
        </div>

        <nav style={s.nav} className="gs-nav">
          {tabs.map((t) => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => goToTab(t.id)}
              onKeyDown={(e) => onNavKeyDown(e, t.id)}
              className="gs-nav-item"
              style={{ ...s.navItem, ...(tab === t.id ? s.navItemActive : {}) }}
            >
              <span style={s.navIcon}>{t.icon}</span>
              {(!isMobile || tab === t.id) && t.label}
            </div>
          ))}
        </nav>

        {!isMobile && (
          <button style={s.logoutBtn} className="gs-logout" onClick={handleLogout}>
            <IconPower width={15} height={15} />
            Log out
          </button>
        )}
      </div>

      <div style={s.content}>
        {message && (
          <div style={{ ...s.toast, animation: "gs-toast-in 0.2s ease" }}>{message}</div>
        )}

        {tab === "overview" && summary && (
          <div>
            <h1 style={s.heading}>Welcome back, {summary.name}</h1>

            <div style={s.statsGrid}>
              <StatCard
                label="Total visits"
                value={summary.total_visits}
                icon={<IconVisits width={20} height={20} />}
                accent="#ff5a1f"
                s={s}
              />
              <StatCard
                label="Total paid"
                value={`₹${summary.total_paid.toFixed(2)}`}
                icon={<IconCoin width={20} height={20} />}
                accent="#c8ff4d"
                s={s}
              />
              <StatCard
                label="Membership status"
                value={summary.active_membership ? summary.active_membership.status : "No active plan"}
                icon={<IconBadge width={20} height={20} />}
                accent={summary.active_membership ? "#4dd0ff" : "#6b7078"}
                s={s}
              />
            </div>

            <div style={s.checkInBox}>
              <div style={s.checkInLeft}>
                {!canCheckIn && (
                  <span style={s.pulseDot} className="gs-pulse-dot" aria-hidden="true" />
                )}
                <p style={s.checkInText}>
                  {canCheckIn ? "Ready to hit the gym today?" : "You're currently checked in."}
                </p>
              </div>
              {canCheckIn ? (
                <button
                  style={s.primaryBtn}
                  className="gs-btn"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  {checkingIn ? "Checking in…" : "Check in"}
                </button>
              ) : (
                <button
                  style={s.dangerBtn}
                  className="gs-btn"
                  onClick={() => handleCheckOut(lastAttendance.id)}
                  disabled={checkingOutId === lastAttendance.id}
                >
                  {checkingOutId === lastAttendance.id ? "Checking out…" : "Check out"}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div>
            <h1 style={s.heading}>My attendance</h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Check-in</th>
                    <th style={s.th}>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice().reverse().map((a) => (
                    <tr key={a.id} style={s.tr}>
                      <td style={s.td}>{new Date(a.check_in).toLocaleString()}</td>
                      <td style={s.td}>
                        {a.check_out ? new Date(a.check_out).toLocaleString() : "Still active"}
                      </td>
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
            <h1 style={s.heading}>My membership</h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Plan ID</th>
                    <th style={s.th}>Start date</th>
                    <th style={s.th}>End date</th>
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
                        <span
                          style={{
                            ...s.statusBadge,
                            ...(m.status === "active" ? s.statusActive : s.statusInactive),
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {memberships.length === 0 && (
                <p style={s.emptyText}>No membership assigned yet. Contact the admin.</p>
              )}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <h1 style={s.heading}>My payments</h1>
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

function StatCard({ label, value, icon, accent, s }) {
  return (
    <div style={{ ...s.statCard, borderLeftColor: accent }}>
      <div style={{ ...s.statIconWrap, color: accent }}>{icon}</div>
      <div>
        <p style={s.statLabel}>{label}</p>
        <h2 style={s.statValue}>{value}</h2>
      </div>
    </div>
  );
}

function getStyles(isMobile) {
  const displayFont = "'Oswald', 'Segoe UI', sans-serif";
  const bodyFont =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return {
    page: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      minHeight: "100vh",
      fontFamily: bodyFont,
      background: "#101214",
      color: "#f4f2ee",
    },
    sidebar: {
      width: isMobile ? "100%" : "240px",
      background: "#17191c",
      color: "#f4f2ee",
      padding: isMobile ? "14px 16px" : "26px 18px",
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "1px solid #24272b",
      borderBottom: isMobile ? "1px solid #24272b" : "none",
      position: isMobile ? "sticky" : "static",
      top: 0,
      zIndex: 10,
      boxSizing: "border-box",
    },
    brandRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: isMobile ? "12px" : "32px",
      paddingBottom: isMobile ? "12px" : "22px",
      borderBottom: "1px solid #24272b",
    },
    logoBadge: {
      width: isMobile ? "36px" : "40px",
      height: isMobile ? "36px" : "40px",
      borderRadius: "10px",
      background: "#ff5a1f",
      color: "#101214",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    logo: {
      fontFamily: displayFont,
      fontSize: isMobile ? "16px" : "18px",
      margin: 0,
      color: "#f4f2ee",
      fontWeight: 600,
      letterSpacing: "0.2px",
    },
    welcomeText: { fontSize: "12px", color: "#8d9096", margin: "3px 0 0 0" },
    nav: {
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: "2px",
      flex: isMobile ? "none" : 1,
      overflowX: isMobile ? "auto" : "visible",
      paddingBottom: isMobile ? "2px" : 0,
    },
    navItem: {
      padding: isMobile ? "9px 12px" : "11px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: isMobile ? "13px" : "14px",
      color: "#9a9ea5",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontWeight: 500,
      whiteSpace: "nowrap",
      flexShrink: 0,
      borderLeft: "3px solid transparent",
    },
    navIcon: { display: "flex", alignItems: "center" },
    navItemActive: {
      background: "rgba(255,90,31,0.1)",
      color: "#ff5a1f",
      fontWeight: 600,
      borderLeft: "3px solid #ff5a1f",
    },
    logoutBtn: {
      marginTop: "20px",
      padding: "11px",
      background: "transparent",
      border: "1px solid #2a2d31",
      borderRadius: "8px",
      color: "#c3c6cb",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    logoutBtnMobile: {
      marginLeft: "auto",
      width: "34px",
      height: "34px",
      background: "transparent",
      border: "1px solid #2a2d31",
      borderRadius: "9px",
      color: "#c3c6cb",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      padding: isMobile ? "16px" : "36px",
      overflowY: "auto",
      minWidth: 0,
      boxSizing: "border-box",
    },
    heading: {
      marginBottom: isMobile ? "16px" : "26px",
      color: "#f4f2ee",
      fontFamily: displayFont,
      fontSize: isMobile ? "20px" : "28px",
      fontWeight: 600,
      letterSpacing: "0.2px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
      gap: isMobile ? "10px" : "16px",
      marginBottom: isMobile ? "16px" : "26px",
    },
    statCard: {
      background: "#17191c",
      borderRadius: "10px",
      borderLeft: "3px solid",
      padding: isMobile ? "16px" : "20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    statIconWrap: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background: "#1e2124",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statLabel: { fontSize: "12px", color: "#8d9096", marginBottom: "4px", fontWeight: 500 },
    statValue: {
      fontFamily: displayFont,
      fontSize: isMobile ? "20px" : "24px",
      color: "#f4f2ee",
      margin: 0,
      fontWeight: 600,
      textTransform: "capitalize",
    },
    checkInBox: {
      background: "#17191c",
      padding: isMobile ? "18px" : "22px 24px",
      borderRadius: "12px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "14px" : "0",
    },
    checkInLeft: { display: "flex", alignItems: "center", gap: "10px" },
    pulseDot: {
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: "#c8ff4d",
      flexShrink: 0,
      animation: "gs-pulse 1.8s infinite",
    },
    checkInText: { margin: 0, color: "#c3c6cb", fontSize: "14px" },
    tableWrapper: {
      background: "#17191c",
      borderRadius: "12px",
      overflow: isMobile ? "auto" : "hidden",
    },
    table: {
      width: "100%",
      minWidth: isMobile ? "480px" : "auto",
      borderCollapse: "collapse",
    },
    tr: { borderBottom: "1px solid #24272b" },
    th: {
      textAlign: "left",
      padding: isMobile ? "11px 12px" : "13px 18px",
      background: "#1c1f22",
      color: "#8d9096",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    td: {
      padding: isMobile ? "11px 12px" : "13px 18px",
      fontSize: "13px",
      color: "#e4e2dd",
      whiteSpace: "nowrap",
    },
    emptyText: { padding: "20px 18px", color: "#6b7078", fontSize: "13px", margin: 0 },
    primaryBtn: {
      padding: "12px 22px",
      background: "#ff5a1f",
      color: "#101214",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
    },
    dangerBtn: {
      padding: "12px 22px",
      background: "transparent",
      color: "#ff5c72",
      border: "1px solid #4a2a30",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
    },
    statusBadge: {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "capitalize",
      whiteSpace: "nowrap",
    },
    statusActive: {
      background: "rgba(200,255,77,0.12)",
      color: "#c8ff4d",
      border: "1px solid rgba(200,255,77,0.25)",
    },
    statusInactive: {
      background: "#1e2124",
      color: "#8d9096",
      border: "1px solid #2a2d31",
    },
    toast: {
      background: "#1c1f22",
      color: "#c8ff4d",
      border: "1px solid rgba(200,255,77,0.25)",
      padding: "11px 16px",
      borderRadius: "8px",
      marginBottom: "18px",
      fontSize: "13px",
      fontWeight: 600,
    },
  };
}

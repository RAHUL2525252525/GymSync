import React, { useEffect, useRef, useState } from "react";
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
function IconFlame(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 2.5c.6 2.4-1.8 3.6-1.8 6.3a2.8 2.8 0 0 0 5.6 0c0-.7-.4-1.2-.4-1.2.7 2.7-.7 4.4-2.1 4.4a3.3 3.3 0 0 1-3.3-3.3c0-2.8 2-3.6 2-6.2z" />
      <path d="M8.5 13c-.6 1.4-.8 2.4-.8 3.5a4.3 4.3 0 0 0 8.6 0c0-2-1.1-3.4-1.9-4.6.2 2-.6 3.4-1.7 3.4A2.1 2.1 0 0 1 10.6 13c0-1 .5-1.6.5-1.6" />
    </svg>
  );
}

/* ---------------- Small helpers (pure, client-side only) ---------------- */

// Purely a motivational visual target — not fetched from the backend.
const WEEKLY_GOAL_DAYS = 5;

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const isNumber = typeof target === "number" && !Number.isNaN(target);

  useEffect(() => {
    if (!isNumber) return undefined;
    let frame;
    let start;
    const from = 0;
    const to = target;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, isNumber]);

  return isNumber ? value : target;
}

function computeStreak(attendance) {
  if (!attendance.length) return 0;
  const days = new Set(attendance.map((a) => new Date(a.check_in).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeWeekly(attendance) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const count = attendance.filter((a) => new Date(a.check_in).toDateString() === dayStr).length;
    days.push({
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      count,
      isToday: i === 0,
    });
  }
  return days;
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
  const [bump, setBump] = useState(false);

  const name = localStorage.getItem("name");
  const prevAttendanceCount = useRef(null);

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

  // Fires a one-off bump animation on the visits stat whenever attendance
  // changes as a result of the user's own action (check-in/out), never on
  // the initial load.
  useEffect(() => {
    if (prevAttendanceCount.current === null) {
      prevAttendanceCount.current = attendance.length;
      return;
    }
    if (attendance.length !== prevAttendanceCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 520);
      prevAttendanceCount.current = attendance.length;
      return () => clearTimeout(t);
    }
    return undefined;
  }, [attendance.length]);

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

  const streak = computeStreak(attendance);
  const weekly = computeWeekly(attendance);
  const activeDaysThisWeek = weekly.filter((d) => d.count > 0).length;
  const maxDayCount = Math.max(1, ...weekly.map((d) => d.count));
  const goalProgress = Math.min(activeDaysThisWeek / WEEKLY_GOAL_DAYS, 1);

  const animatedVisits = useCountUp(summary ? summary.total_visits : 0);
  const animatedPaid = useCountUp(summary ? summary.total_paid : 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: <IconOverview /> },
    { id: "attendance", label: "Attendance", icon: <IconAttendance /> },
    { id: "membership", label: "Membership", icon: <IconMembership /> },
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
        .gs-table-wrapper { -webkit-overflow-scrolling: touch; }
        .gs-nav-item:hover { background: #f4f8f3; }
        .gs-nav-item:focus-visible,
        .gs-btn:focus-visible,
        .gs-logout:focus-visible,
        .gs-bottom-tab:focus-visible {
          outline: 2px solid #a8c936;
          outline-offset: 2px;
        }
        .gs-btn { transition: transform 0.12s ease, box-shadow 0.12s ease; }
        .gs-btn:active { transform: scale(0.97); }
        .gs-bar { transition: height 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes gs-toast-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gs-pulse {
          0% { box-shadow: 0 0 0 0 rgba(184,223,69,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(184,223,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(184,223,69,0); }
        }
        @keyframes gs-bump {
          0% { transform: scale(1); }
          35% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes gs-skeleton {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .gs-skeleton-block {
          background: linear-gradient(90deg, #eef2ef 25%, #f8faf8 37%, #eef2ef 63%);
          background-size: 400px 100%;
          animation: gs-skeleton 1.4s ease-in-out infinite;
        }
        .gs-bump { animation: gs-bump 0.5s ease; }
        @media (prefers-reduced-motion: reduce) {
          .gs-btn, .gs-pulse-dot, .gs-bump, .gs-skeleton-block, .gs-bar { animation: none !important; transition: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1180px) {
          .gs-content-inner { padding: 0 4px; }
        }
      `}</style>

      <div style={s.sidebar}>
        <div style={s.brandRow}>
          <div style={s.logoBadge}>
            <IconDumbbell width={20} height={20} />
          </div>
          <div>
            <h2 style={s.logo}>GymSync</h2>
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

        {!isMobile && (
          <>
            <nav style={s.nav}>
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
                  {t.label}
                </div>
              ))}
            </nav>

            <div style={s.streakChip}>
              <IconFlame width={16} height={16} color="#a8c936" />
              <span>
                {streak > 0 ? `${streak} day streak` : "Start your streak today"}
              </span>
            </div>

            <button style={s.logoutBtn} className="gs-logout" onClick={handleLogout}>
              <IconPower width={15} height={15} />
              Log out
            </button>
          </>
        )}
      </div>

      <div style={s.content}>
        <div className="gs-content-inner">
          {message && (
            <div style={{ ...s.toast, animation: "gs-toast-in 0.2s ease" }}>{message}</div>
          )}

          {tab === "overview" && !summary && <OverviewSkeleton s={s} />}

          {tab === "overview" && summary && (
            <div>
              <h1 style={s.heading}>Welcome back, {summary.name}</h1>

              <div style={s.statsGrid}>
                <div className={bump ? "gs-bump" : ""}>
                  <StatCard
                    label="Total visits"
                    value={Math.round(animatedVisits)}
                    icon={<IconVisits width={20} height={20} />}
                    accent="#a8c936"
                    s={s}
                  />
                </div>
                <StatCard
                  label="Total paid"
                  value={`₹${animatedPaid.toFixed(2)}`}
                  icon={<IconCoin width={20} height={20} />}
                  accent="#7fa51f"
                  s={s}
                />
                <StatCard
                  label="Membership status"
                  value={summary.active_membership ? summary.active_membership.status : "No active plan"}
                  icon={<IconBadge width={20} height={20} />}
                  accent={summary.active_membership ? "#4dd0ff" : "#87938a"}
                  s={s}
                />
              </div>

              <div style={s.midGrid}>
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

                <div style={s.weekCard}>
                  <div style={s.weekCardTop}>
                    <div>
                      <p style={s.weekCardLabel}>This week</p>
                      <p style={s.weekCardValue}>
                        {activeDaysThisWeek}/{WEEKLY_GOAL_DAYS} days
                      </p>
                    </div>
                    <GoalRing progress={goalProgress} />
                  </div>

                  <div style={s.weekBars}>
                    {weekly.map((d, i) => (
                      <div key={i} style={s.weekBarCol}>
                        <div style={s.weekBarTrack}>
                          <div
                            className="gs-bar"
                            style={{
                              ...s.weekBarFill,
                              height: `${(d.count / maxDayCount) * 100}%`,
                              background: d.isToday ? "#a8c936" : "#cbd5ce",
                            }}
                          />
                        </div>
                        <span style={{ ...s.weekBarLabel, color: d.isToday ? "#76951e" : "#8a958d" }}>
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={s.streakRow}>
                    <IconFlame width={15} height={15} color="#a8c936" />
                    <span>
                      {streak > 0
                        ? `${streak}-day streak — keep it going`
                        : "No active streak yet — check in to start one"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "attendance" && (
            <div>
              <h1 style={s.heading}>My attendance</h1>
              {isMobile ? (
                <CardList
                  s={s}
                  emptyText="No attendance records yet."
                  items={attendance.slice().reverse()}
                  renderItem={(a) => (
                    <div style={s.recordCard} key={a.id}>
                      <div style={s.recordCardRow}>
                        <span style={s.recordCardLabel}>Check-in</span>
                        <span style={s.recordCardValue}>{new Date(a.check_in).toLocaleString()}</span>
                      </div>
                      <div style={s.recordCardRow}>
                        <span style={s.recordCardLabel}>Check-out</span>
                        <span style={s.recordCardValue}>
                          {a.check_out ? new Date(a.check_out).toLocaleString() : "Still active"}
                        </span>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div style={s.tableWrapper} className="gs-table-wrapper">
                  <table style={s.table}>
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
              )}
            </div>
          )}

          {tab === "membership" && (
            <div>
              <h1 style={s.heading}>My membership</h1>
              {isMobile ? (
                <CardList
                  s={s}
                  emptyText="No membership assigned yet. Contact the admin."
                  items={memberships}
                  renderItem={(m) => (
                    <div style={s.recordCard} key={m.id}>
                      <div style={s.recordCardTopRow}>
                        <span style={s.recordCardTitle}>Plan {m.plan_id}</span>
                        <span
                          style={{
                            ...s.statusBadge,
                            ...(m.status === "active" ? s.statusActive : s.statusInactive),
                          }}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div style={s.recordCardRow}>
                        <span style={s.recordCardLabel}>Start</span>
                        <span style={s.recordCardValue}>{m.start_date}</span>
                      </div>
                      <div style={s.recordCardRow}>
                        <span style={s.recordCardLabel}>End</span>
                        <span style={s.recordCardValue}>{m.end_date}</span>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div style={s.tableWrapper} className="gs-table-wrapper">
                  <table style={s.table}>
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
              )}
            </div>
          )}

          {tab === "payments" && (
            <div>
              <h1 style={s.heading}>My payments</h1>
              {isMobile ? (
                <CardList
                  s={s}
                  emptyText="No payments recorded yet."
                  items={payments}
                  renderItem={(p) => (
                    <div style={s.recordCard} key={p.id}>
                      <div style={s.recordCardTopRow}>
                        <span style={s.recordCardTitle}>₹{p.amount}</span>
                        <span style={{ ...s.statusBadge, ...s.statusActive }}>{p.status}</span>
                      </div>
                      <div style={s.recordCardRow}>
                        <span style={s.recordCardLabel}>Date</span>
                        <span style={s.recordCardValue}>
                          {new Date(p.payment_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div style={s.tableWrapper} className="gs-table-wrapper">
                  <table style={s.table}>
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
              )}
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <nav style={s.bottomNav} aria-label="Primary">
          {tabs.map((t) => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => goToTab(t.id)}
              onKeyDown={(e) => onNavKeyDown(e, t.id)}
              className="gs-bottom-tab"
              style={{ ...s.bottomTab, ...(tab === t.id ? s.bottomTabActive : {}) }}
            >
              {t.icon}
              <span style={s.bottomTabLabel}>{t.label}</span>
            </div>
          ))}
        </nav>
      )}
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

function GoalRing({ progress }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#e6ece7" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="#a8c936"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

function CardList({ items, renderItem, emptyText, s }) {
  if (!items.length) {
    return <p style={s.emptyText}>{emptyText}</p>;
  }
  return <div style={s.cardListWrap}>{items.map(renderItem)}</div>;
}

function OverviewSkeleton({ s }) {
  return (
    <div>
      <div className="gs-skeleton-block" style={s.skeletonHeading} />
      <div style={s.statsGrid}>
        <div className="gs-skeleton-block" style={s.skeletonStatCard} />
        <div className="gs-skeleton-block" style={s.skeletonStatCard} />
        <div className="gs-skeleton-block" style={s.skeletonStatCard} />
      </div>
      <div className="gs-skeleton-block" style={s.skeletonWide} />
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
      background: "#f4f7f5",
      color: "#17221c",
    },

    sidebar: {
      width: isMobile ? "100%" : "258px",
      background: "#ffffff",
      color: "#17221c",
      padding: isMobile ? "14px 16px" : "28px 18px",
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "1px solid #e2e9e4",
      borderBottom: isMobile ? "1px solid #e2e9e4" : "none",
      position: isMobile ? "sticky" : "static",
      top: 0,
      zIndex: 10,
      boxSizing: "border-box",
      boxShadow: isMobile ? "0 3px 16px rgba(23,34,28,0.05)" : "none",
    },

    brandRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: isMobile ? "0" : "30px",
      paddingBottom: isMobile ? "0" : "22px",
      borderBottom: isMobile ? "none" : "1px solid #edf1ee",
    },

    logoBadge: {
      width: isMobile ? "38px" : "44px",
      height: isMobile ? "38px" : "44px",
      borderRadius: "13px",
      background: "#d9ff57",
      color: "#162017",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 8px 18px rgba(160,190,45,0.18)",
    },

    logo: {
      fontFamily: displayFont,
      fontSize: isMobile ? "19px" : "22px",
      margin: 0,
      color: "#142019",
      fontWeight: 700,
      letterSpacing: "0.3px",
    },

    welcomeText: {
      fontSize: "12px",
      color: "#7c887f",
      margin: "3px 0 0 0",
    },

    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      flex: 1,
    },

    navItem: {
      padding: "12px 13px",
      borderRadius: "11px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#68746b",
      display: "flex",
      alignItems: "center",
      gap: "11px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      borderLeft: "3px solid transparent",
      transition: "all 0.18s ease",
    },

    navIcon: {
      display: "flex",
      alignItems: "center",
    },

    navItemActive: {
      background: "#f0f8df",
      color: "#527000",
      fontWeight: 700,
      borderLeft: "3px solid #a8c936",
      boxShadow: "inset 0 0 0 1px #e3efc2",
    },

    streakChip: {
      marginTop: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#526057",
      background: "#f7faf7",
      border: "1px solid #e4ebe5",
      borderRadius: "11px",
      padding: "10px 11px",
    },

    logoutBtn: {
      marginTop: "14px",
      padding: "11px",
      background: "#ffffff",
      border: "1px solid #dfe7e1",
      borderRadius: "11px",
      color: "#667269",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.18s ease",
    },

    logoutBtnMobile: {
      marginLeft: "auto",
      width: "36px",
      height: "36px",
      background: "#f7faf7",
      border: "1px solid #dfe7e1",
      borderRadius: "10px",
      color: "#667269",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    content: {
      flex: 1,
      padding: isMobile ? "18px 16px" : "38px 42px",
      paddingBottom: isMobile ? "88px" : "38px",
      overflowY: "auto",
      minWidth: 0,
      boxSizing: "border-box",
      background:
        "radial-gradient(circle at 92% 0%, rgba(217,255,87,0.18), transparent 24%), #f4f7f5",
    },

    heading: {
      marginBottom: isMobile ? "17px" : "28px",
      color: "#142019",
      fontFamily: displayFont,
      fontSize: isMobile ? "24px" : "32px",
      fontWeight: 700,
      letterSpacing: "0.25px",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(210px, 1fr))",
      gap: isMobile ? "11px" : "17px",
      marginBottom: isMobile ? "17px" : "22px",
    },

    statCard: {
      background: "#ffffff",
      borderRadius: "16px",
      borderLeft: "4px solid",
      padding: isMobile ? "17px" : "21px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      boxShadow: "0 8px 26px rgba(31,51,39,0.06)",
      borderTop: "1px solid #edf2ee",
      borderRight: "1px solid #edf2ee",
      borderBottom: "1px solid #edf2ee",
    },

    statIconWrap: {
      width: "44px",
      height: "44px",
      borderRadius: "13px",
      background: "#f2f7ed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    statLabel: {
      fontSize: "12px",
      color: "#7a867d",
      marginBottom: "4px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
    },

    statValue: {
      fontFamily: displayFont,
      fontSize: isMobile ? "22px" : "27px",
      color: "#17221c",
      margin: 0,
      fontWeight: 700,
      textTransform: "capitalize",
    },

    midGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.08fr 1fr",
      gap: isMobile ? "12px" : "17px",
      alignItems: "stretch",
    },

    checkInBox: {
      background:
        "linear-gradient(135deg, #ffffff 0%, #f8fbf6 100%)",
      padding: isMobile ? "20px" : "24px 26px",
      borderRadius: "17px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "15px" : "18px",
      border: "1px solid #e1e9e2",
      boxShadow: "0 9px 28px rgba(31,51,39,0.06)",
    },

    checkInLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    pulseDot: {
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: "#9fc63b",
      flexShrink: 0,
      animation: "gs-pulse 1.8s infinite",
    },

    checkInText: {
      margin: 0,
      color: "#425047",
      fontSize: "14px",
      fontWeight: 600,
    },

    weekCard: {
      background: "#ffffff",
      borderRadius: "17px",
      padding: isMobile ? "19px" : "21px 23px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      border: "1px solid #e1e9e2",
      boxShadow: "0 9px 28px rgba(31,51,39,0.06)",
    },

    weekCardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    weekCardLabel: {
      fontSize: "12px",
      color: "#7a867d",
      margin: 0,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    weekCardValue: {
      fontFamily: displayFont,
      fontSize: "21px",
      color: "#17221c",
      margin: "2px 0 0 0",
      fontWeight: 700,
    },

    weekBars: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "6px",
      height: "64px",
    },

    weekBarCol: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      flex: 1,
      height: "100%",
      justifyContent: "flex-end",
    },

    weekBarTrack: {
      width: "100%",
      maxWidth: "19px",
      height: "44px",
      display: "flex",
      alignItems: "flex-end",
      background: "#edf2ee",
      borderRadius: "7px",
      overflow: "hidden",
    },

    weekBarFill: {
      width: "100%",
      minHeight: "3px",
      borderRadius: "7px",
    },

    weekBarLabel: {
      fontSize: "10px",
      fontWeight: 800,
    },

    streakRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#59665d",
      borderTop: "1px solid #edf1ee",
      paddingTop: "12px",
      fontWeight: 600,
    },

    tableWrapper: {
      background: "#ffffff",
      borderRadius: "16px",
      overflow: isMobile ? "auto" : "hidden",
      border: "1px solid #e1e9e2",
      boxShadow: "0 8px 26px rgba(31,51,39,0.055)",
    },

    table: {
      width: "100%",
      minWidth: isMobile ? "480px" : "auto",
      borderCollapse: "collapse",
    },

    tr: {
      borderBottom: "1px solid #edf1ee",
    },

    th: {
      textAlign: "left",
      padding: isMobile ? "12px 12px" : "14px 18px",
      background: "#f7faf7",
      color: "#718077",
      fontSize: "12px",
      fontWeight: 800,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.45px",
    },

    td: {
      padding: isMobile ? "12px 12px" : "14px 18px",
      fontSize: "13px",
      color: "#334138",
      whiteSpace: "nowrap",
      fontWeight: 500,
    },

    emptyText: {
      padding: "20px 4px",
      color: "#87938a",
      fontSize: "13px",
      margin: 0,
    },

    cardListWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    recordCard: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "15px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "9px",
      border: "1px solid #e1e9e2",
      boxShadow: "0 6px 20px rgba(31,51,39,0.045)",
    },

    recordCardTopRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2px",
    },

    recordCardTitle: {
      fontFamily: displayFont,
      fontSize: "16px",
      fontWeight: 700,
      color: "#17221c",
    },

    recordCardRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
      gap: "14px",
    },

    recordCardLabel: {
      color: "#7a867d",
      fontWeight: 600,
    },

    recordCardValue: {
      color: "#334138",
      fontWeight: 600,
      textAlign: "right",
    },

    primaryBtn: {
      padding: "12px 23px",
      background: "#b8df45",
      color: "#172018",
      border: "none",
      borderRadius: "11px",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
      boxShadow: "0 8px 18px rgba(151,185,52,0.22)",
    },

    dangerBtn: {
      padding: "12px 23px",
      background: "#fff4f3",
      color: "#c54e43",
      border: "1px solid #f0c7c3",
      borderRadius: "11px",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
    },

    statusBadge: {
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 800,
      textTransform: "capitalize",
      whiteSpace: "nowrap",
    },

    statusActive: {
      background: "#eef8d8",
      color: "#5b7d12",
      border: "1px solid #d7e9a8",
    },

    statusInactive: {
      background: "#f2f5f3",
      color: "#7c887f",
      border: "1px solid #e1e7e2",
    },

    toast: {
      background: "#ffffff",
      color: "#55730e",
      border: "1px solid #d7e8ac",
      boxShadow: "0 10px 25px rgba(31,51,39,0.08)",
      padding: "12px 16px",
      borderRadius: "11px",
      marginBottom: "18px",
      fontSize: "13px",
      fontWeight: 700,
    },

    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #dfe7e1",
      padding: "7px 4px calc(7px + env(safe-area-inset-bottom))",
      zIndex: 20,
      boxShadow: "0 -8px 22px rgba(31,51,39,0.07)",
    },

    bottomTab: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "3px",
      padding: "7px 2px",
      borderRadius: "11px",
      color: "#7a867d",
      cursor: "pointer",
    },

    bottomTabActive: {
      color: "#5f7d13",
      background: "#f0f8df",
    },

    bottomTabLabel: {
      fontSize: "10px",
      fontWeight: 700,
    },

    skeletonHeading: {
      height: isMobile ? "26px" : "34px",
      width: "230px",
      borderRadius: "8px",
      marginBottom: isMobile ? "17px" : "28px",
    },

    skeletonStatCard: {
      height: isMobile ? "78px" : "86px",
      borderRadius: "16px",
    },

    skeletonWide: {
      height: isMobile ? "150px" : "170px",
      borderRadius: "17px",
    },
  };
}

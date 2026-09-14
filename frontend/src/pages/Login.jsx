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
        .gs-nav-item:hover { background: rgba(255,255,255,0.05); }
        .gs-nav-item:focus-visible,
        .gs-btn:focus-visible,
        .gs-logout:focus-visible,
        .gs-bottom-tab:focus-visible {
          outline: 2px solid #ff5a1f;
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
          0% { box-shadow: 0 0 0 0 rgba(200,255,77,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(200,255,77,0); }
          100% { box-shadow: 0 0 0 0 rgba(200,255,77,0); }
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
          background: linear-gradient(90deg, #1a1d21 25%, #22262b 37%, #1a1d21 63%);
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
              <IconFlame width={16} height={16} color="#ff5a1f" />
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
                    accent="#ff5a1f"
                    s={s}
                  />
                </div>
                <StatCard
                  label="Total paid"
                  value={`₹${animatedPaid.toFixed(2)}`}
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
                              background: d.isToday ? "#ff5a1f" : "#3a3f45",
                            }}
                          />
                        </div>
                        <span style={{ ...s.weekBarLabel, color: d.isToday ? "#ff5a1f" : "#6b7078" }}>
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={s.streakRow}>
                    <IconFlame width={15} height={15} color="#ff5a1f" />
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
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#24272b" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="#ff5a1f"
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
  const bodyFont = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return {
    page: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      minHeight: "100vh",
      fontFamily: bodyFont,
      background: "#0b0d0f",
      color: "#f5f5f5",
    },
    sidebar: {
      width: isMobile ? "100%" : "268px",
      minHeight: isMobile ? "auto" : "100vh",
      background: "linear-gradient(180deg, #151719 0%, #0f1113 100%)",
      color: "#fff",
      padding: isMobile ? "14px 16px" : "28px 20px",
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "1px solid #292c30",
      borderBottom: isMobile ? "1px solid #292c30" : "none",
      position: isMobile ? "sticky" : "static",
      top: 0,
      zIndex: 10,
      boxSizing: "border-box",
    },
    brandRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: isMobile ? "0" : "36px",
      paddingBottom: isMobile ? "0" : "26px",
      borderBottom: isMobile ? "none" : "1px solid #292c30",
    },
    logoBadge: {
      width: isMobile ? "38px" : "44px",
      height: isMobile ? "38px" : "44px",
      borderRadius: "12px",
      background: "#ff5a1f",
      color: "#0b0d0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 8px 24px rgba(255,90,31,0.22)",
    },
    logo: {
      fontFamily: displayFont,
      fontSize: isMobile ? "18px" : "21px",
      margin: 0,
      color: "#fff",
      fontWeight: 600,
      letterSpacing: "0.4px",
    },
    welcomeText: { fontSize: "11px", color: "#777c84", margin: "4px 0 0" },
    nav: { display: "flex", flexDirection: "column", gap: "7px", flex: 1 },
    navItem: {
      padding: "13px 14px",
      borderRadius: "11px",
      cursor: "pointer",
      fontSize: "13px",
      color: "#969ba3",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      border: "1px solid transparent",
      transition: "all .18s ease",
    },
    navIcon: { display: "flex", alignItems: "center", opacity: 0.9 },
    navItemActive: {
      background: "linear-gradient(90deg, rgba(255,90,31,.16), rgba(255,90,31,.05))",
      color: "#ff6a34",
      border: "1px solid rgba(255,90,31,.22)",
      boxShadow: "inset 3px 0 0 #ff5a1f",
    },
    streakChip: {
      marginTop: "20px",
      display: "flex",
      alignItems: "center",
      gap: "9px",
      fontSize: "11px",
      color: "#c7cbd0",
      background: "#1a1d20",
      border: "1px solid #2b2f34",
      borderRadius: "10px",
      padding: "11px 12px",
    },
    logoutBtn: {
      marginTop: "12px",
      padding: "12px",
      background: "#111315",
      border: "1px solid #2b2f34",
      borderRadius: "10px",
      color: "#aeb3ba",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    logoutBtnMobile: {
      marginLeft: "auto",
      width: "36px",
      height: "36px",
      background: "#111315",
      border: "1px solid #2b2f34",
      borderRadius: "10px",
      color: "#aeb3ba",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      padding: isMobile ? "20px 16px 88px" : "42px 44px",
      overflowY: "auto",
      minWidth: 0,
      boxSizing: "border-box",
      background: "radial-gradient(circle at 85% 0%, rgba(255,90,31,.055), transparent 28%), #0b0d0f",
    },
    heading: {
      margin: "0 0 28px",
      color: "#fff",
      fontFamily: displayFont,
      fontSize: isMobile ? "25px" : "34px",
      fontWeight: 600,
      letterSpacing: "0.2px",
      lineHeight: 1.15,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: isMobile ? "12px" : "18px",
      marginBottom: isMobile ? "14px" : "20px",
    },
    statCard: {
      background: "linear-gradient(145deg, #17191c, #121416)",
      border: "1px solid #292c30",
      borderLeft: "3px solid",
      borderRadius: "15px",
      padding: isMobile ? "17px" : "21px",
      minHeight: "104px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      boxSizing: "border-box",
      boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    },
    statIconWrap: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "#202327",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statLabel: { fontSize: "11px", color: "#858a92", margin: "0 0 5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".7px" },
    statValue: {
      fontFamily: displayFont,
      fontSize: isMobile ? "23px" : "27px",
      color: "#fff",
      margin: 0,
      fontWeight: 600,
      textTransform: "capitalize",
      lineHeight: 1.1,
    },
    midGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1.05fr",
      gap: isMobile ? "12px" : "18px",
      alignItems: "stretch",
    },
    checkInBox: {
      background: "linear-gradient(145deg, #181a1d, #121416)",
      border: "1px solid #292c30",
      padding: isMobile ? "20px" : "25px",
      borderRadius: "15px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "17px" : "18px",
      minHeight: isMobile ? "auto" : "132px",
      boxSizing: "border-box",
    },
    checkInLeft: { display: "flex", alignItems: "center", gap: "11px" },
    pulseDot: { width: "9px", height: "9px", borderRadius: "50%", background: "#c8ff4d", flexShrink: 0, animation: "gs-pulse 1.8s infinite" },
    checkInText: { margin: 0, color: "#e7e7e7", fontSize: "14px", fontWeight: 600, lineHeight: 1.4 },
    weekCard: {
      background: "linear-gradient(145deg, #181a1d, #121416)",
      border: "1px solid #292c30",
      borderRadius: "15px",
      padding: isMobile ? "20px" : "21px 23px",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    weekCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    weekCardLabel: { fontSize: "11px", color: "#858a92", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px" },
    weekCardValue: { fontFamily: displayFont, fontSize: "23px", color: "#fff", margin: "3px 0 0", fontWeight: 600 },
    weekBars: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "7px", height: "70px" },
    weekBarCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", flex: 1, height: "100%", justifyContent: "flex-end" },
    weekBarTrack: { width: "100%", maxWidth: "22px", height: "48px", display: "flex", alignItems: "flex-end", background: "#222529", borderRadius: "6px", overflow: "hidden" },
    weekBarFill: { width: "100%", minHeight: "4px", borderRadius: "6px" },
    weekBarLabel: { fontSize: "10px", fontWeight: 700 },
    streakRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#aeb3ba", borderTop: "1px solid #292c30", paddingTop: "12px" },
    tableWrapper: { background: "#141618", border: "1px solid #292c30", borderRadius: "15px", overflow: isMobile ? "auto" : "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.16)" },
    table: { width: "100%", minWidth: isMobile ? "480px" : "auto", borderCollapse: "collapse" },
    tr: { borderBottom: "1px solid #25282c" },
    th: { textAlign: "left", padding: isMobile ? "13px" : "15px 19px", background: "#1b1e21", color: "#858a92", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", whiteSpace: "nowrap" },
    td: { padding: isMobile ? "13px" : "15px 19px", fontSize: "13px", color: "#e5e5e5", whiteSpace: "nowrap" },
    emptyText: { padding: "24px 5px", color: "#6f747b", fontSize: "13px", margin: 0 },
    cardListWrap: { display: "flex", flexDirection: "column", gap: "10px" },
    recordCard: { background: "linear-gradient(145deg, #181a1d, #121416)", border: "1px solid #292c30", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "9px" },
    recordCardTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" },
    recordCardTitle: { fontFamily: displayFont, fontSize: "17px", fontWeight: 600, color: "#fff" },
    recordCardRow: { display: "flex", justifyContent: "space-between", gap: "14px", fontSize: "12px" },
    recordCardLabel: { color: "#858a92" },
    recordCardValue: { color: "#e5e5e5", fontWeight: 500, textAlign: "right" },
    primaryBtn: { padding: "12px 23px", background: "#ff5a1f", color: "#101214", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 800, fontSize: "12px", width: isMobile ? "100%" : "auto", boxShadow: "0 8px 22px rgba(255,90,31,.2)" },
    dangerBtn: { padding: "12px 23px", background: "rgba(255,82,101,.08)", color: "#ff6879", border: "1px solid rgba(255,82,101,.28)", borderRadius: "10px", cursor: "pointer", fontWeight: 800, fontSize: "12px", width: isMobile ? "100%" : "auto" },
    statusBadge: { padding: "5px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 800, textTransform: "capitalize", whiteSpace: "nowrap" },
    statusActive: { background: "rgba(200,255,77,.10)", color: "#c8ff4d", border: "1px solid rgba(200,255,77,.24)" },
    statusInactive: { background: "#202327", color: "#858a92", border: "1px solid #30343a" },
    toast: { background: "#1b1e21", color: "#c8ff4d", border: "1px solid rgba(200,255,77,.25)", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "12px", fontWeight: 700, boxShadow: "0 10px 28px rgba(0,0,0,.22)" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", background: "rgba(18,20,22,.97)", borderTop: "1px solid #292c30", padding: "7px 5px calc(7px + env(safe-area-inset-bottom))", zIndex: 20, backdropFilter: "blur(12px)" },
    bottomTab: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "7px 2px", borderRadius: "10px", color: "#777c84", cursor: "pointer" },
    bottomTabActive: { color: "#ff5a1f", background: "rgba(255,90,31,.08)" },
    bottomTabLabel: { fontSize: "9px", fontWeight: 700 },
    skeletonHeading: { height: isMobile ? "28px" : "38px", width: "240px", borderRadius: "8px", marginBottom: isMobile ? "17px" : "28px" },
    skeletonStatCard: { height: isMobile ? "82px" : "104px", borderRadius: "15px" },
    skeletonWide: { height: isMobile ? "160px" : "190px", borderRadius: "15px" },
  };
}

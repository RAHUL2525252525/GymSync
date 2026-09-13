import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const [planForm, setPlanForm] = useState({ name: "", duration_months: "", price: "", description: "" });
  const [trainerForm, setTrainerForm] = useState({ name: "", specialization: "", phone: "" });
  const [membershipForm, setMembershipForm] = useState({ user_id: "", plan_id: "", trainer_id: "", start_date: "", end_date: "" });
  const [paymentForm, setPaymentForm] = useState({ user_id: "", membership_id: "", amount: "" });

  const name = localStorage.getItem("name");

  const loadAll = async () => {
    try {
      const [statsRes, membersRes, plansRes, trainersRes, paymentsRes, membershipsRes] = await Promise.all([
        api.get("/api/dashboard/admin"),
        api.get("/api/members/"),
        api.get("/api/plans/"),
        api.get("/api/trainers/"),
        api.get("/api/payments/"),
        api.get("/api/memberships/"),
      ]);
      setStats(statsRes.data);
      setMembers(membersRes.data);
      setPlans(plansRes.data);
      setTrainers(trainersRes.data);
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

  const createPlan = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/plans/", {
        ...planForm,
        duration_months: parseInt(planForm.duration_months),
        price: parseFloat(planForm.price),
      });
      setPlanForm({ name: "", duration_months: "", price: "", description: "" });
      flash("Plan created successfully");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to create plan");
    }
  };

  const deletePlan = async (id) => {
    await api.delete(`/api/plans/${id}`);
    flash("Plan deleted");
    loadAll();
  };

  const createTrainer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/trainers/", trainerForm);
      setTrainerForm({ name: "", specialization: "", phone: "" });
      flash("Trainer added successfully");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to add trainer");
    }
  };

  const deleteTrainer = async (id) => {
    await api.delete(`/api/trainers/${id}`);
    flash("Trainer removed");
    loadAll();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete this member? This cannot be undone.")) return;
    await api.delete(`/api/members/${id}`);
    flash("Member removed");
    loadAll();
  };

  const createMembership = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/memberships/", {
        user_id: parseInt(membershipForm.user_id),
        plan_id: parseInt(membershipForm.plan_id),
        trainer_id: membershipForm.trainer_id ? parseInt(membershipForm.trainer_id) : null,
        start_date: membershipForm.start_date,
        end_date: membershipForm.end_date,
      });
      setMembershipForm({ user_id: "", plan_id: "", trainer_id: "", start_date: "", end_date: "" });
      flash("Membership assigned successfully");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to assign membership");
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/payments/", {
        user_id: parseInt(paymentForm.user_id),
        membership_id: paymentForm.membership_id ? parseInt(paymentForm.membership_id) : null,
        amount: parseFloat(paymentForm.amount),
      });
      setPaymentForm({ user_id: "", membership_id: "", amount: "" });
      flash("Payment recorded successfully");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to record payment");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👤" },
    { id: "plans", label: "Plans", icon: "📋" },
    { id: "trainers", label: "Trainers", icon: "🏋️" },
    { id: "memberships", label: "Memberships", icon: "🗓️" },
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
          <div style={s.logoBadge}>💪</div>
          <div>
            <h2 style={s.logo}>GymSync</h2>
            {!isMobile && <p style={s.welcomeText}>Admin · {name}</p>}
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

        {tab === "overview" && stats && (
          <div>
            <h1 style={s.heading}>Overview</h1>
            <div style={s.statsGrid}>
              <StatCard label="Total Members" value={stats.total_members} icon="👤" s={s} />
              <StatCard label="Active Memberships" value={stats.active_memberships} icon="🗓️" s={s} />
              <StatCard label="Total Trainers" value={stats.total_trainers} icon="🏋️" s={s} />
              <StatCard label="Total Revenue" value={`₹${stats.total_revenue.toFixed(2)}`} icon="💰" s={s} />
              <StatCard label="Today's Check-ins" value={stats.today_checkins} icon="✅" s={s} />
            </div>
          </div>
        )}

        {tab === "members" && (
          <div>
            <h1 style={s.heading}>Members <span style={s.countBadge}>{members.length}</span></h1>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>ID</th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Joined</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} style={s.tr}>
                      <td style={s.td}>{m.id}</td>
                      <td style={s.td}>{m.name}</td>
                      <td style={s.td}>{m.email}</td>
                      <td style={s.td}>{m.phone || "-"}</td>
                      <td style={s.td}>{m.joined_date ? new Date(m.joined_date).toLocaleDateString() : "-"}</td>
                      <td style={s.td}>
                        <button style={s.dangerBtn} onClick={() => deleteMember(m.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && <p style={s.emptyText}>No members yet.</p>}
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div>
            <h1 style={s.heading}>Membership Plans</h1>
            <form style={s.formRow} onSubmit={createPlan}>
              <input style={s.input} placeholder="Plan Name" value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <input style={s.input} placeholder="Duration (months)" type="number" value={planForm.duration_months}
                onChange={(e) => setPlanForm({ ...planForm, duration_months: e.target.value })} required
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <input style={s.input} placeholder="Price" type="number" value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} required
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <input style={s.input} placeholder="Description" value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <button style={s.primaryBtn} type="submit">+ Add Plan</button>
            </form>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Duration</th>
                    <th style={s.th}>Price</th>
                    <th style={s.th}>Description</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} style={s.tr}>
                      <td style={s.td}>{p.name}</td>
                      <td style={s.td}>{p.duration_months} mo</td>
                      <td style={s.td}>₹{p.price}</td>
                      <td style={s.td}>{p.description || "-"}</td>
                      <td style={s.td}>
                        <button style={s.dangerBtn} onClick={() => deletePlan(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {plans.length === 0 && <p style={s.emptyText}>No plans created yet.</p>}
            </div>
          </div>
        )}

        {tab === "trainers" && (
          <div>
            <h1 style={s.heading}>Trainers</h1>
            <form style={s.formRow} onSubmit={createTrainer}>
              <input style={s.input} placeholder="Trainer Name" value={trainerForm.name}
                onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} required
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <input style={s.input} placeholder="Specialization" value={trainerForm.specialization}
                onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <input style={s.input} placeholder="Phone" value={trainerForm.phone}
                onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <button style={s.primaryBtn} type="submit">+ Add Trainer</button>
            </form>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Specialization</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((t) => (
                    <tr key={t.id} style={s.tr}>
                      <td style={s.td}>{t.name}</td>
                      <td style={s.td}>{t.specialization || "-"}</td>
                      <td style={s.td}>{t.phone || "-"}</td>
                      <td style={s.td}>
                        <button style={s.dangerBtn} onClick={() => deleteTrainer(t.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trainers.length === 0 && <p style={s.emptyText}>No trainers added yet.</p>}
            </div>
          </div>
        )}

        {tab === "memberships" && (
          <div>
            <h1 style={s.heading}>Assign Memberships</h1>
            <form style={s.formRow} onSubmit={createMembership}>
              <select style={s.input} value={membershipForm.user_id}
                onChange={(e) => setMembershipForm({ ...membershipForm, user_id: e.target.value })} required>
                <option value="">Select Member</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select style={s.input} value={membershipForm.plan_id}
                onChange={(e) => setMembershipForm({ ...membershipForm, plan_id: e.target.value })} required>
                <option value="">Select Plan</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select style={s.input} value={membershipForm.trainer_id}
                onChange={(e) => setMembershipForm({ ...membershipForm, trainer_id: e.target.value })}>
                <option value="">No Trainer</option>
                {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input style={s.input} type="date" value={membershipForm.start_date}
                onChange={(e) => setMembershipForm({ ...membershipForm, start_date: e.target.value })} required />
              <input style={s.input} type="date" value={membershipForm.end_date}
                onChange={(e) => setMembershipForm({ ...membershipForm, end_date: e.target.value })} required />
              <button style={s.primaryBtn} type="submit">Assign</button>
            </form>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>User ID</th>
                    <th style={s.th}>Plan ID</th>
                    <th style={s.th}>Start</th>
                    <th style={s.th}>End</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m) => (
                    <tr key={m.id} style={s.tr}>
                      <td style={s.td}>{m.user_id}</td>
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
              {memberships.length === 0 && <p style={s.emptyText}>No memberships assigned yet.</p>}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <h1 style={s.heading}>Payments</h1>
            <form style={s.formRow} onSubmit={recordPayment}>
              <select style={s.input} value={paymentForm.user_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, user_id: e.target.value })} required>
                <option value="">Select Member</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input style={s.input} placeholder="Amount" type="number" value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required
                onFocus={(e) => (e.target.style.borderColor = "#ff7a1a")} onBlur={(e) => (e.target.style.borderColor = "#2b2b2b")} />
              <button style={s.primaryBtn} type="submit">Record Payment</button>
            </form>
            <div style={s.tableWrapper} className="gs-table-wrapper">
              <table style={s.table} className="gs-table">
                <thead>
                  <tr>
                    <th style={s.th}>User ID</th>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={s.tr}>
                      <td style={s.td}>{p.user_id}</td>
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
      background: "#0d0d0d",
    },
    sidebar: {
      width: isMobile ? "100%" : "250px",
      background: "#161616",
      color: "#fff",
      padding: isMobile ? "14px 16px" : "24px 16px",
      display: "flex",
      flexDirection: "column",
      borderRight: isMobile ? "none" : "1px solid #2b2b2b",
      borderBottom: isMobile ? "1px solid #2b2b2b" : "none",
      boxShadow: isMobile ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
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
      borderBottom: "1px solid #2b2b2b",
    },
    logoBadge: {
      width: isMobile ? "36px" : "42px",
      height: isMobile ? "36px" : "42px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #ff7a1a, #ff9d4d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? "17px" : "20px",
      flexShrink: 0,
      boxShadow: "0 6px 16px rgba(255,122,26,0.35)",
    },
    logo: { fontSize: isMobile ? "15px" : "17px", margin: 0, color: "#fff", fontWeight: 800, letterSpacing: "-0.2px" },
    welcomeText: { fontSize: "12px", color: "#9a9a9a", margin: "2px 0 0 0" },
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
      color: "#b5b5b5",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
      flexShrink: 0,
      transition: "background 0.15s ease, color 0.15s ease",
    },
    navIcon: { fontSize: "15px" },
    navItemActive: {
      background: "linear-gradient(135deg, #ff7a1a, #ff9d4d)",
      color: "#0d0d0d",
      fontWeight: "bold",
    },
    logoutBtn: {
      marginTop: "20px",
      padding: "11px",
      background: "transparent",
      border: "1px solid #3a3a3a",
      borderRadius: "10px",
      color: "#ff6b6b",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
    },
    logoutBtnMobile: {
      marginLeft: "auto",
      width: "34px",
      height: "34px",
      background: "transparent",
      border: "1px solid #3a3a3a",
      borderRadius: "9px",
      color: "#ff6b6b",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      flexShrink: 0,
    },
    content: { flex: 1, padding: isMobile ? "16px" : "32px", overflowY: "auto", minWidth: 0, boxSizing: "border-box" },
    heading: {
      marginBottom: isMobile ? "14px" : "22px",
      color: "#f2f2f2",
      fontSize: isMobile ? "19px" : "24px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    countBadge: {
      fontSize: "13px",
      background: "rgba(255,122,26,0.15)",
      color: "#ff9d4d",
      padding: "3px 10px",
      borderRadius: "20px",
      border: "1px solid rgba(255,122,26,0.35)",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
      gap: isMobile ? "10px" : "16px",
    },
    statCard: {
      background: "#161616",
      borderRadius: "14px",
      padding: isMobile ? "16px" : "20px",
      border: "1px solid #2b2b2b",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    statIconWrap: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "rgba(255,122,26,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      flexShrink: 0,
    },
    statLabel: { fontSize: "12px", color: "#9a9a9a", marginBottom: "4px" },
    statValue: { fontSize: isMobile ? "20px" : "22px", color: "#f2f2f2", margin: 0 },
    tableWrapper: {
      background: "#161616",
      borderRadius: "14px",
      border: "1px solid #2b2b2b",
      overflow: isMobile ? "auto" : "hidden",
    },
    table: {
      width: "100%",
      minWidth: isMobile ? "620px" : "auto",
      borderCollapse: "collapse",
    },
    tr: {
      borderBottom: "1px solid #232323",
    },
    th: {
      textAlign: "left",
      padding: isMobile ? "11px 12px" : "13px 16px",
      background: "#1d1d1d",
      color: "#ff9d4d",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
      whiteSpace: "nowrap",
    },
    td: { padding: isMobile ? "11px 12px" : "13px 16px", fontSize: "13px", color: "#e0e0e0", whiteSpace: "nowrap" },
    emptyText: { padding: "20px 16px", color: "#6f6f6f", fontSize: "13px", margin: 0 },
    formRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "10px",
      marginBottom: isMobile ? "14px" : "20px",
      flexWrap: "wrap",
      background: "#161616",
      padding: isMobile ? "14px" : "18px",
      borderRadius: "14px",
      border: "1px solid #2b2b2b",
    },
    input: {
      padding: "11px 13px",
      borderRadius: "8px",
      border: "1px solid #2b2b2b",
      background: "#0f0f0f",
      color: "#f2f2f2",
      fontSize: "13px",
      minWidth: isMobile ? "0" : "150px",
      width: isMobile ? "100%" : "auto",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.15s ease",
    },
    primaryBtn: {
      padding: "11px 20px",
      background: "linear-gradient(135deg, #ff7a1a, #ff9d4d)",
      color: "#0d0d0d",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
      width: isMobile ? "100%" : "auto",
      boxShadow: "0 6px 16px rgba(255,122,26,0.3)",
    },
    dangerBtn: {
      padding: "7px 14px",
      background: "rgba(255,80,80,0.12)",
      color: "#ff6b6b",
      border: "1px solid rgba(255,80,80,0.3)",
      borderRadius: "7px",
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
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
      background: "rgba(255,122,26,0.15)",
      color: "#ff9d4d",
      border: "1px solid rgba(255,122,26,0.3)",
    },
    statusInactive: {
      background: "rgba(150,150,150,0.12)",
      color: "#9a9a9a",
      border: "1px solid rgba(150,150,150,0.25)",
    },
    toast: {
      background: "rgba(255,122,26,0.15)",
      color: "#ff9d4d",
      border: "1px solid rgba(255,122,26,0.35)",
      padding: "11px 16px",
      borderRadius: "10px",
      marginBottom: "18px",
      fontSize: "13px",
      fontWeight: "bold",
    },
  };
}
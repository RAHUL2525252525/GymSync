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

  const [planForm, setPlanForm] = useState({
    name: "",
    duration_months: "",
    price: "",
    description: "",
  });

  const [trainerForm, setTrainerForm] = useState({
    name: "",
    specialization: "",
    phone: "",
  });

  const [membershipForm, setMembershipForm] = useState({
    user_id: "",
    plan_id: "",
    trainer_id: "",
    start_date: "",
    end_date: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    user_id: "",
    membership_id: "",
    amount: "",
  });

  const name = localStorage.getItem("name");

  const loadAll = async () => {
    try {
      const [
        statsRes,
        membersRes,
        plansRes,
        trainersRes,
        paymentsRes,
        membershipsRes,
      ] = await Promise.all([
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

      setPlanForm({
        name: "",
        duration_months: "",
        price: "",
        description: "",
      });

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

      setTrainerForm({
        name: "",
        specialization: "",
        phone: "",
      });

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
        trainer_id: membershipForm.trainer_id
          ? parseInt(membershipForm.trainer_id)
          : null,
        start_date: membershipForm.start_date,
        end_date: membershipForm.end_date,
      });

      setMembershipForm({
        user_id: "",
        plan_id: "",
        trainer_id: "",
        start_date: "",
        end_date: "",
      });

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
        membership_id: paymentForm.membership_id
          ? parseInt(paymentForm.membership_id)
          : null,
        amount: parseFloat(paymentForm.amount),
      });

      setPaymentForm({
        user_id: "",
        membership_id: "",
        amount: "",
      });

      flash("Payment recorded successfully");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.detail || "Failed to record payment");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "members", label: "Members", icon: "♙" },
    { id: "plans", label: "Plans", icon: "▦" },
    { id: "trainers", label: "Trainers", icon: "♜" },
    { id: "memberships", label: "Memberships", icon: "◫" },
    { id: "payments", label: "Payments", icon: "◉" },
  ];

  const s = getStyles(isMobile);

  const activeTab = tabs.find((t) => t.id === tab);

  return (
    <div style={s.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #08090b;
        }

        .admin-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        .admin-scroll::-webkit-scrollbar-track {
          background: #0b0d10;
        }

        .admin-scroll::-webkit-scrollbar-thumb {
          background: #272b31;
          border-radius: 10px;
        }

        .admin-scroll::-webkit-scrollbar-thumb:hover {
          background: #383e46;
        }

        .admin-table-wrap::-webkit-scrollbar {
          height: 7px;
        }

        .admin-table-wrap::-webkit-scrollbar-track {
          background: #101216;
        }

        .admin-table-wrap::-webkit-scrollbar-thumb {
          background: #30353c;
          border-radius: 10px;
        }

        .admin-input::placeholder {
          color: #626873;
        }

        .admin-input:focus {
          border-color: #ff7a1a !important;
          box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.08);
        }

        .admin-nav-item:hover {
          background: #171a1f !important;
          color: #ffffff !important;
        }

        .admin-action:hover {
          transform: translateY(-1px);
        }

        .admin-danger:hover {
          background: rgba(255, 76, 76, 0.18) !important;
          border-color: rgba(255, 76, 76, 0.5) !important;
        }

        .admin-table tbody tr:hover {
          background: #15181d !important;
        }

        .admin-stat:hover {
          transform: translateY(-2px);
          border-color: #343a42 !important;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.adminLogo}>
            <div style={s.logoMark}>G</div>

            <div>
              <div style={s.brand}>GYMSYNC</div>
              <div style={s.brandSub}>ADMIN CONSOLE</div>
            </div>
          </div>

          <div style={s.adminProfile}>
            <div style={s.profileAvatar}>
              {name ? name.charAt(0).toUpperCase() : "A"}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={s.profileName}>{name || "Administrator"}</div>
              <div style={s.profileRole}>SYSTEM ADMIN</div>
            </div>
          </div>
        </div>

        <div style={s.menuLabel}>CONTROL CENTER</div>

        <nav style={s.nav} className="admin-scroll">
          {tabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              className="admin-nav-item"
              style={{
                ...s.navItem,
                ...(tab === t.id ? s.navItemActive : {}),
              }}
            >
              <span
                style={{
                  ...s.navIcon,
                  ...(tab === t.id ? s.navIconActive : {}),
                }}
              >
                {t.icon}
              </span>

              <span>{t.label}</span>

              {tab === t.id && <span style={s.activeLine} />}
            </div>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.systemStatus}>
            <span style={s.statusDot} />
            <span>System Online</span>
          </div>

          <button style={s.logoutBtn} onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {/* TOP HEADER */}
        <header style={s.header}>
          <div>
            <div style={s.breadcrumb}>
              GYMSYNC <span>/</span> ADMIN
            </div>

            <h1 style={s.pageTitle}>
              {activeTab?.label || "Dashboard"}
            </h1>
          </div>

          <div style={s.headerRight}>
            <div style={s.liveBadge}>
              <span style={s.liveDot} />
              LIVE
            </div>

            <div style={s.headerDate}>
              ADMIN PANEL
            </div>

            {isMobile && (
              <button style={s.mobileLogout} onClick={handleLogout}>
                ↪
              </button>
            )}
          </div>
        </header>

        <div style={s.content} className="admin-scroll">
          {message && (
            <div style={s.toast}>
              <div style={s.toastIcon}>✓</div>
              <div>
                <div style={s.toastTitle}>Action completed</div>
                <div style={s.toastText}>{message}</div>
              </div>
            </div>
          )}

          {/* OVERVIEW */}
          {tab === "overview" && stats && (
            <div>
              <div style={s.overviewIntro}>
                <div>
                  <div style={s.sectionEyebrow}>COMMAND CENTER</div>
                  <h2 style={s.overviewTitle}>Gym Operations</h2>
                  <p style={s.overviewSubtitle}>
                    Monitor your gym activity, members and revenue from one place.
                  </p>
                </div>

                <div style={s.overviewTag}>
                  <span style={s.orangeDot} />
                  Dashboard Active
                </div>
              </div>

              <div style={s.statsGrid}>
                <StatCard
                  label="TOTAL MEMBERS"
                  value={stats.total_members}
                  icon="♙"
                  number="01"
                  s={s}
                />

                <StatCard
                  label="ACTIVE MEMBERSHIPS"
                  value={stats.active_memberships}
                  icon="◫"
                  number="02"
                  s={s}
                />

                <StatCard
                  label="TOTAL TRAINERS"
                  value={stats.total_trainers}
                  icon="♜"
                  number="03"
                  s={s}
                />

                <StatCard
                  label="TOTAL REVENUE"
                  value={`₹${stats.total_revenue.toFixed(2)}`}
                  icon="₹"
                  number="04"
                  s={s}
                />

                <StatCard
                  label="TODAY'S CHECK-INS"
                  value={stats.today_checkins}
                  icon="✓"
                  number="05"
                  s={s}
                />
              </div>

              <div style={s.overviewBottom}>
                <div style={s.infoPanel}>
                  <div style={s.panelHeader}>
                    <div>
                      <div style={s.panelEyebrow}>QUICK VIEW</div>
                      <h3 style={s.panelTitle}>Gym Statistics</h3>
                    </div>

                    <span style={s.panelIcon}>◈</span>
                  </div>

                  <div style={s.quickGrid}>
                    <QuickItem
                      label="Members"
                      value={stats.total_members}
                      s={s}
                    />

                    <QuickItem
                      label="Memberships"
                      value={stats.active_memberships}
                      s={s}
                    />

                    <QuickItem
                      label="Trainers"
                      value={stats.total_trainers}
                      s={s}
                    />

                    <QuickItem
                      label="Check-ins Today"
                      value={stats.today_checkins}
                      s={s}
                    />
                  </div>
                </div>

                <div style={s.adminNote}>
                  <div style={s.noteIcon}>!</div>

                  <div>
                    <div style={s.noteTitle}>ADMIN ACCESS</div>

                    <p style={s.noteText}>
                      You have full management access to members,
                      plans, trainers, memberships and payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS */}
          {tab === "members" && (
            <div>
              <SectionHeader
                eyebrow="MEMBER MANAGEMENT"
                title="Members"
                count={members.length}
                description="View and manage registered gym members."
                s={s}
              />

              <div style={s.tableWrapper} className="admin-table-wrap">
                <table style={s.table} className="admin-table">
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>MEMBER</th>
                      <th style={s.th}>EMAIL</th>
                      <th style={s.th}>PHONE</th>
                      <th style={s.th}>JOINED</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} style={s.tr}>
                        <td style={s.idCell}>#{m.id}</td>

                        <td style={s.td}>
                          <div style={s.memberCell}>
                            <div style={s.tableAvatar}>
                              {m.name
                                ? m.name.charAt(0).toUpperCase()
                                : "M"}
                            </div>

                            <span>{m.name}</span>
                          </div>
                        </td>

                        <td style={s.td}>{m.email}</td>

                        <td style={s.td}>{m.phone || "-"}</td>

                        <td style={s.td}>
                          {m.joined_date
                            ? new Date(
                                m.joined_date
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td style={s.td}>
                          <button
                            className="admin-action admin-danger"
                            style={s.dangerBtn}
                            onClick={() => deleteMember(m.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {members.length === 0 && (
                  <EmptyState
                    icon="♙"
                    title="No members found"
                    text="Registered members will appear here."
                    s={s}
                  />
                )}
              </div>
            </div>
          )}

          {/* PLANS */}
          {tab === "plans" && (
            <div>
              <SectionHeader
                eyebrow="PLAN MANAGEMENT"
                title="Membership Plans"
                description="Create and manage your gym membership plans."
                s={s}
              />

              <form style={s.formCard} onSubmit={createPlan}>
                <div style={s.formTitleRow}>
                  <div>
                    <div style={s.formEyebrow}>CREATE NEW</div>
                    <h3 style={s.formTitle}>Add Membership Plan</h3>
                  </div>

                  <div style={s.formNumber}>01</div>
                </div>

                <div style={s.formGrid}>
                  <FormInput
                    placeholder="Plan Name"
                    value={planForm.name}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        name: e.target.value,
                      })
                    }
                    required
                    s={s}
                  />

                  <FormInput
                    placeholder="Duration (months)"
                    type="number"
                    value={planForm.duration_months}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        duration_months: e.target.value,
                      })
                    }
                    required
                    s={s}
                  />

                  <FormInput
                    placeholder="Price"
                    type="number"
                    value={planForm.price}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        price: e.target.value,
                      })
                    }
                    required
                    s={s}
                  />

                  <FormInput
                    placeholder="Description"
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        description: e.target.value,
                      })
                    }
                    s={s}
                  />

                  <button
                    style={s.primaryBtn}
                    type="submit"
                    className="admin-action"
                  >
                    <span>+</span>
                    Add Plan
                  </button>
                </div>
              </form>

              <div style={s.tableWrapper} className="admin-table-wrap">
                <table style={s.table} className="admin-table">
                  <thead>
                    <tr>
                      <th style={s.th}>PLAN</th>
                      <th style={s.th}>DURATION</th>
                      <th style={s.th}>PRICE</th>
                      <th style={s.th}>DESCRIPTION</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {plans.map((p) => (
                      <tr key={p.id} style={s.tr}>
                        <td style={s.td}>
                          <div style={s.planName}>
                            <span style={s.planMark}>P</span>
                            {p.name}
                          </div>
                        </td>

                        <td style={s.td}>
                          <span style={s.durationBadge}>
                            {p.duration_months} months
                          </span>
                        </td>

                        <td style={s.priceCell}>₹{p.price}</td>

                        <td style={s.td}>
                          {p.description || "-"}
                        </td>

                        <td style={s.td}>
                          <button
                            className="admin-action admin-danger"
                            style={s.dangerBtn}
                            onClick={() => deletePlan(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {plans.length === 0 && (
                  <EmptyState
                    icon="▦"
                    title="No plans created"
                    text="Create your first membership plan above."
                    s={s}
                  />
                )}
              </div>
            </div>
          )}

          {/* TRAINERS */}
          {tab === "trainers" && (
            <div>
              <SectionHeader
                eyebrow="STAFF MANAGEMENT"
                title="Trainers"
                description="Manage gym trainers and their specializations."
                s={s}
              />

              <form style={s.formCard} onSubmit={createTrainer}>
                <div style={s.formTitleRow}>
                  <div>
                    <div style={s.formEyebrow}>CREATE NEW</div>
                    <h3 style={s.formTitle}>Add Trainer</h3>
                  </div>

                  <div style={s.formNumber}>02</div>
                </div>

                <div style={s.formGrid}>
                  <FormInput
                    placeholder="Trainer Name"
                    value={trainerForm.name}
                    onChange={(e) =>
                      setTrainerForm({
                        ...trainerForm,
                        name: e.target.value,
                      })
                    }
                    required
                    s={s}
                  />

                  <FormInput
                    placeholder="Specialization"
                    value={trainerForm.specialization}
                    onChange={(e) =>
                      setTrainerForm({
                        ...trainerForm,
                        specialization: e.target.value,
                      })
                    }
                    s={s}
                  />

                  <FormInput
                    placeholder="Phone"
                    value={trainerForm.phone}
                    onChange={(e) =>
                      setTrainerForm({
                        ...trainerForm,
                        phone: e.target.value,
                      })
                    }
                    s={s}
                  />

                  <button
                    style={s.primaryBtn}
                    type="submit"
                    className="admin-action"
                  >
                    <span>+</span>
                    Add Trainer
                  </button>
                </div>
              </form>

              <div style={s.tableWrapper} className="admin-table-wrap">
                <table style={s.table} className="admin-table">
                  <thead>
                    <tr>
                      <th style={s.th}>TRAINER</th>
                      <th style={s.th}>SPECIALIZATION</th>
                      <th style={s.th}>PHONE</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {trainers.map((t) => (
                      <tr key={t.id} style={s.tr}>
                        <td style={s.td}>
                          <div style={s.memberCell}>
                            <div style={s.tableAvatar}>
                              {t.name
                                ? t.name.charAt(0).toUpperCase()
                                : "T"}
                            </div>

                            <span>{t.name}</span>
                          </div>
                        </td>

                        <td style={s.td}>
                          {t.specialization || "-"}
                        </td>

                        <td style={s.td}>
                          {t.phone || "-"}
                        </td>

                        <td style={s.td}>
                          <button
                            className="admin-action admin-danger"
                            style={s.dangerBtn}
                            onClick={() => deleteTrainer(t.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {trainers.length === 0 && (
                  <EmptyState
                    icon="♜"
                    title="No trainers added"
                    text="Add your first trainer above."
                    s={s}
                  />
                )}
              </div>
            </div>
          )}

          {/* MEMBERSHIPS */}
          {tab === "memberships" && (
            <div>
              <SectionHeader
                eyebrow="MEMBERSHIP CONTROL"
                title="Assign Memberships"
                description="Assign plans and trainers to your members."
                s={s}
              />

              <form style={s.formCard} onSubmit={createMembership}>
                <div style={s.formTitleRow}>
                  <div>
                    <div style={s.formEyebrow}>ASSIGN MEMBERSHIP</div>
                    <h3 style={s.formTitle}>Membership Details</h3>
                  </div>

                  <div style={s.formNumber}>03</div>
                </div>

                <div style={s.formGrid}>
                  <select
                    style={s.input}
                    value={membershipForm.user_id}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        user_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Member</option>

                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <select
                    style={s.input}
                    value={membershipForm.plan_id}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        plan_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Plan</option>

                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    style={s.input}
                    value={membershipForm.trainer_id}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        trainer_id: e.target.value,
                      })
                    }
                  >
                    <option value="">No Trainer</option>

                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <input
                    style={s.input}
                    type="date"
                    value={membershipForm.start_date}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    style={s.input}
                    type="date"
                    value={membershipForm.end_date}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        end_date: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    style={s.primaryBtn}
                    type="submit"
                    className="admin-action"
                  >
                    Assign Membership
                  </button>
                </div>
              </form>

              <div style={s.tableWrapper} className="admin-table-wrap">
                <table style={s.table} className="admin-table">
                  <thead>
                    <tr>
                      <th style={s.th}>USER ID</th>
                      <th style={s.th}>PLAN ID</th>
                      <th style={s.th}>START</th>
                      <th style={s.th}>END</th>
                      <th style={s.th}>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {memberships.map((m) => (
                      <tr key={m.id} style={s.tr}>
                        <td style={s.idCell}>#{m.user_id}</td>

                        <td style={s.idCell}>#{m.plan_id}</td>

                        <td style={s.td}>{m.start_date}</td>

                        <td style={s.td}>{m.end_date}</td>

                        <td style={s.td}>
                          <span
                            style={{
                              ...s.statusBadge,
                              ...(m.status === "active"
                                ? s.statusActive
                                : s.statusInactive),
                            }}
                          >
                            <span style={s.statusSmallDot} />
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {memberships.length === 0 && (
                  <EmptyState
                    icon="◫"
                    title="No memberships assigned"
                    text="Assigned memberships will appear here."
                    s={s}
                  />
                )}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {tab === "payments" && (
            <div>
              <SectionHeader
                eyebrow="FINANCE MANAGEMENT"
                title="Payments"
                description="Record and monitor member payments."
                s={s}
              />

              <form style={s.formCard} onSubmit={recordPayment}>
                <div style={s.formTitleRow}>
                  <div>
                    <div style={s.formEyebrow}>NEW TRANSACTION</div>
                    <h3 style={s.formTitle}>Record Payment</h3>
                  </div>

                  <div style={s.formNumber}>04</div>
                </div>

                <div style={s.formGrid}>
                  <select
                    style={s.input}
                    value={paymentForm.user_id}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        user_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Member</option>

                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    style={s.input}
                    placeholder="Amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    style={s.primaryBtn}
                    type="submit"
                    className="admin-action"
                  >
                    Record Payment
                  </button>
                </div>
              </form>

              <div style={s.tableWrapper} className="admin-table-wrap">
                <table style={s.table} className="admin-table">
                  <thead>
                    <tr>
                      <th style={s.th}>USER ID</th>
                      <th style={s.th}>AMOUNT</th>
                      <th style={s.th}>DATE</th>
                      <th style={s.th}>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} style={s.tr}>
                        <td style={s.idCell}>#{p.user_id}</td>

                        <td style={s.priceCell}>
                          ₹{p.amount}
                        </td>

                        <td style={s.td}>
                          {new Date(
                            p.payment_date
                          ).toLocaleDateString()}
                        </td>

                        <td style={s.td}>
                          <span
                            style={{
                              ...s.statusBadge,
                              ...s.statusActive,
                            }}
                          >
                            <span style={s.statusSmallDot} />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {payments.length === 0 && (
                  <EmptyState
                    icon="₹"
                    title="No payments recorded"
                    text="Payment transactions will appear here."
                    s={s}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   SMALL UI COMPONENTS
========================= */

function StatCard({ label, value, icon, number, s }) {
  return (
    <div style={s.statCard} className="admin-stat">
      <div style={s.statTop}>
        <span style={s.statNumber}>{number}</span>
        <span style={s.statIcon}>{icon}</span>
      </div>

      <div style={s.statBottom}>
        <div style={s.statLabel}>{label}</div>
        <div style={s.statValue}>{value}</div>
      </div>

      <div style={s.statAccent} />
    </div>
  );
}

function QuickItem({ label, value, s }) {
  return (
    <div style={s.quickItem}>
      <div style={s.quickValue}>{value}</div>
      <div style={s.quickLabel}>{label}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, count, description, s }) {
  return (
    <div style={s.sectionHeader}>
      <div>
        <div style={s.sectionEyebrow}>{eyebrow}</div>

        <h2 style={s.sectionTitle}>
          {title}

          {count !== undefined && (
            <span style={s.countBadge}>{count}</span>
          )}
        </h2>

        <p style={s.sectionDescription}>{description}</p>
      </div>
    </div>
  );
}

function FormInput({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  s,
}) {
  return (
    <input
      className="admin-input"
      style={s.input}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

function EmptyState({ icon, title, text, s }) {
  return (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>{icon}</div>
      <div style={s.emptyTitle}>{title}</div>
      <div style={s.emptyText}>{text}</div>
    </div>
  );
}

/* =========================
   ADMIN DESIGN SYSTEM
========================= */

function getStyles(isMobile) {
  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      background:
        "radial-gradient(circle at 80% 0%, rgba(255,122,26,0.07), transparent 28%), #08090b",
      color: "#f5f5f5",
      fontFamily:
        "'Inter', 'Segoe UI', Arial, sans-serif",
    },

    /* SIDEBAR */

    sidebar: {
      width: isMobile ? "100%" : "258px",
      minHeight: isMobile ? "auto" : "100vh",
      background: "#0d0f12",
      borderRight: isMobile
        ? "none"
        : "1px solid #20242a",
      borderBottom: isMobile
        ? "1px solid #20242a"
        : "none",
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      position: isMobile ? "sticky" : "fixed",
      top: 0,
      left: 0,
      zIndex: 20,
      padding: isMobile ? "14px" : "24px 18px",
    },

    sidebarTop: {
      width: "100%",
    },

    adminLogo: {
      display: "flex",
      alignItems: "center",
      gap: "11px",
      paddingBottom: isMobile ? "0" : "24px",
      borderBottom: isMobile ? "none" : "1px solid #20242a",
    },

    logoMark: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background:
        "linear-gradient(145deg, #ff7a1a, #ff9b45)",
      color: "#090a0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
      fontSize: "19px",
      boxShadow:
        "0 8px 25px rgba(255,122,26,0.2)",
    },

    brand: {
      fontSize: "15px",
      fontWeight: 900,
      letterSpacing: "2px",
    },

    brandSub: {
      fontSize: "8px",
      color: "#737982",
      letterSpacing: "1.5px",
      marginTop: "3px",
    },

    adminProfile: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "10px",
      padding: "18px 4px",
      borderBottom: "1px solid #20242a",
    },

    profileAvatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "#1a1d22",
      border: "1px solid #343940",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff9b45",
      fontWeight: 800,
      fontSize: "13px",
    },

    profileName: {
      fontSize: "12px",
      fontWeight: 700,
      color: "#e9eaec",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "160px",
    },

    profileRole: {
      fontSize: "8px",
      color: "#666c75",
      letterSpacing: "1px",
      marginTop: "3px",
    },

    menuLabel: {
      fontSize: "8px",
      fontWeight: 800,
      letterSpacing: "1.6px",
      color: "#555b63",
      margin: "22px 10px 9px",
    },

    nav: {
      flex: 1,
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: "4px",
      overflowX: "auto",
      overflowY: "auto",
    },

    navItem: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minHeight: "45px",
      padding: "0 12px",
      borderRadius: "8px",
      color: "#858b94",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      transition: "all 0.2s ease",
    },

    navItemActive: {
      background:
        "linear-gradient(90deg, rgba(255,122,26,0.15), rgba(255,122,26,0.04))",
      color: "#ffffff",
    },

    navIcon: {
      width: "25px",
      height: "25px",
      borderRadius: "6px",
      background: "#15181c",
      border: "1px solid #242930",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      flexShrink: 0,
    },

    navIconActive: {
      background: "#ff7a1a",
      color: "#090a0c",
      borderColor: "#ff7a1a",
    },

    activeLine: {
      position: "absolute",
      right: "0",
      top: "10px",
      bottom: "10px",
      width: "2px",
      background: "#ff7a1a",
      borderRadius: "3px",
    },

    sidebarBottom: {
      display: isMobile ? "none" : "block",
      borderTop: "1px solid #20242a",
      paddingTop: "16px",
      marginTop: "15px",
    },

    systemStatus: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "10px",
      color: "#707780",
      marginBottom: "12px",
      padding: "0 5px",
    },

    statusDot: {
      width: "6px",
      height: "6px",
      background: "#54d98b",
      borderRadius: "50%",
      boxShadow: "0 0 8px rgba(84,217,139,0.6)",
    },

    logoutBtn: {
      width: "100%",
      padding: "11px",
      background: "transparent",
      border: "1px solid #292e35",
      borderRadius: "7px",
      color: "#858b94",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },

    /* MAIN */

    main: {
      flex: 1,
      marginLeft: isMobile ? "0" : "258px",
      minWidth: 0,
    },

    header: {
      minHeight: "82px",
      borderBottom: "1px solid #20242a",
      background: "rgba(9,10,12,0.9)",
      backdropFilter: "blur(15px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "14px 16px" : "0 34px",
      position: "sticky",
      top: 0,
      zIndex: 15,
    },

    breadcrumb: {
      fontSize: "8px",
      letterSpacing: "1.8px",
      color: "#5d636b",
      fontWeight: 800,
      marginBottom: "5px",
    },

    pageTitle: {
      fontSize: isMobile ? "18px" : "21px",
      margin: 0,
      fontWeight: 800,
      letterSpacing: "-0.5px",
    },

    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    liveBadge: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 9px",
      border: "1px solid rgba(84,217,139,0.2)",
      background: "rgba(84,217,139,0.06)",
      borderRadius: "5px",
      fontSize: "8px",
      fontWeight: 800,
      letterSpacing: "1px",
      color: "#75dc9c",
    },

    liveDot: {
      width: "5px",
      height: "5px",
      background: "#54d98b",
      borderRadius: "50%",
    },

    headerDate: {
      fontSize: "9px",
      color: "#555b63",
      letterSpacing: "1px",
    },

    mobileLogout: {
      width: "32px",
      height: "32px",
      background: "#14171b",
      color: "#ff7b7b",
      border: "1px solid #292e35",
      borderRadius: "7px",
      cursor: "pointer",
    },

    content: {
      padding: isMobile ? "20px 15px" : "34px",
      maxWidth: "1500px",
      margin: "0 auto",
      minHeight: "calc(100vh - 82px)",
    },

    /* TOAST */

    toast: {
      display: "flex",
      alignItems: "center",
      gap: "11px",
      padding: "12px 15px",
      marginBottom: "22px",
      border: "1px solid rgba(255,122,26,0.25)",
      background: "rgba(255,122,26,0.06)",
      borderRadius: "8px",
    },

    toastIcon: {
      width: "27px",
      height: "27px",
      borderRadius: "50%",
      background: "#ff7a1a",
      color: "#0a0b0d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
      fontSize: "12px",
    },

    toastTitle: {
      fontSize: "10px",
      fontWeight: 800,
      color: "#ff9b45",
      textTransform: "uppercase",
      letterSpacing: "0.7px",
    },

    toastText: {
      fontSize: "11px",
      color: "#9ca1a8",
      marginTop: "2px",
    },

    /* OVERVIEW */

    overviewIntro: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "20px",
      marginBottom: "25px",
    },

    sectionEyebrow: {
      fontSize: "8px",
      letterSpacing: "1.8px",
      fontWeight: 900,
      color: "#ff7a1a",
      marginBottom: "7px",
    },

    overviewTitle: {
      margin: 0,
      fontSize: isMobile ? "23px" : "29px",
      letterSpacing: "-1px",
    },

    overviewSubtitle: {
      margin: "7px 0 0",
      color: "#6f757d",
      fontSize: "11px",
    },

    overviewTag: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "7px",
      padding: "8px 11px",
      borderRadius: "5px",
      background: "#111418",
      border: "1px solid #252a30",
      fontSize: "9px",
      color: "#858b94",
    },

    orangeDot: {
      width: "5px",
      height: "5px",
      background: "#ff7a1a",
      borderRadius: "50%",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr 1fr"
        : "repeat(5, minmax(0, 1fr))",
      gap: isMobile ? "9px" : "12px",
      marginBottom: "18px",
    },

    statCard: {
      position: "relative",
      minHeight: isMobile ? "135px" : "158px",
      background:
        "linear-gradient(145deg, #111418, #0d0f12)",
      border: "1px solid #22272d",
      borderRadius: "10px",
      padding: isMobile ? "13px" : "16px",
      overflow: "hidden",
      transition: "all 0.2s ease",
    },

    statTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    statNumber: {
      fontSize: "8px",
      color: "#50565e",
      letterSpacing: "1px",
      fontWeight: 800,
    },

    statIcon: {
      width: "30px",
      height: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,122,26,0.08)",
      border: "1px solid rgba(255,122,26,0.16)",
      borderRadius: "7px",
      color: "#ff8b32",
      fontSize: "13px",
      fontWeight: 900,
    },

    statBottom: {
      position: "absolute",
      left: isMobile ? "13px" : "16px",
      bottom: isMobile ? "14px" : "17px",
    },

    statLabel: {
      fontSize: "8px",
      color: "#626871",
      fontWeight: 800,
      letterSpacing: "0.8px",
      marginBottom: "5px",
    },

    statValue: {
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: 850,
      letterSpacing: "-0.7px",
      color: "#f5f5f5",
    },

    statAccent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "35%",
      height: "2px",
      background: "#ff7a1a",
    },

    overviewBottom: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "1.5fr 1fr",
      gap: "14px",
    },

    infoPanel: {
      background: "#101317",
      border: "1px solid #22272d",
      borderRadius: "10px",
      padding: isMobile ? "16px" : "20px",
    },

    panelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottom: "1px solid #20242a",
      paddingBottom: "15px",
      marginBottom: "15px",
    },

    panelEyebrow: {
      color: "#5e646d",
      fontSize: "8px",
      letterSpacing: "1.4px",
      fontWeight: 800,
    },

    panelTitle: {
      margin: "4px 0 0",
      fontSize: "15px",
    },

    panelIcon: {
      color: "#ff7a1a",
      fontSize: "17px",
    },

    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1px",
      background: "#252a30",
    },

    quickItem: {
      background: "#101317",
      padding: "14px 10px",
      textAlign: "center",
    },

    quickValue: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#f0f1f2",
    },

    quickLabel: {
      fontSize: "8px",
      color: "#656b73",
      marginTop: "4px",
    },

    adminNote: {
      background:
        "linear-gradient(135deg, rgba(255,122,26,0.11), rgba(255,122,26,0.025))",
      border: "1px solid rgba(255,122,26,0.18)",
      borderRadius: "10px",
      padding: "20px",
      display: "flex",
      gap: "14px",
      alignItems: "flex-start",
    },

    noteIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "7px",
      background: "#ff7a1a",
      color: "#090a0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
    },

    noteTitle: {
      fontSize: "9px",
      fontWeight: 900,
      letterSpacing: "1.2px",
      color: "#ff9744",
    },

    noteText: {
      color: "#8b9198",
      fontSize: "11px",
      lineHeight: 1.7,
      margin: "7px 0 0",
    },

    /* SECTION */

    sectionHeader: {
      marginBottom: "22px",
    },

    sectionTitle: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      margin: 0,
      fontSize: isMobile ? "23px" : "27px",
      letterSpacing: "-0.8px",
    },

    sectionDescription: {
      margin: "7px 0 0",
      color: "#6d737b",
      fontSize: "11px",
    },

    countBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "25px",
      height: "22px",
      padding: "0 7px",
      borderRadius: "5px",
      background: "rgba(255,122,26,0.1)",
      border: "1px solid rgba(255,122,26,0.2)",
      color: "#ff9848",
      fontSize: "10px",
      fontWeight: 800,
    },

    /* FORMS */

    formCard: {
      background: "#101317",
      border: "1px solid #22272d",
      borderRadius: "10px",
      padding: isMobile ? "15px" : "19px",
      marginBottom: "18px",
    },

    formTitleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "15px",
      paddingBottom: "13px",
      borderBottom: "1px solid #20242a",
    },

    formEyebrow: {
      color: "#ff7a1a",
      fontSize: "8px",
      fontWeight: 900,
      letterSpacing: "1.5px",
    },

    formTitle: {
      fontSize: "14px",
      margin: "4px 0 0",
    },

    formNumber: {
      color: "#353b42",
      fontSize: "23px",
      fontWeight: 900,
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "9px",
    },

    input: {
      width: "100%",
      minWidth: 0,
      height: "42px",
      padding: "0 12px",
      background: "#0b0d10",
      border: "1px solid #292e35",
      borderRadius: "6px",
      outline: "none",
      color: "#e9eaec",
      fontSize: "11px",
      transition: "all 0.2s ease",
    },

    primaryBtn: {
      height: "42px",
      padding: "0 17px",
      background: "#ff7a1a",
      border: "1px solid #ff7a1a",
      borderRadius: "6px",
      color: "#090a0c",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 900,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      boxShadow: "0 5px 18px rgba(255,122,26,0.12)",
    },

    /* TABLE */

    tableWrapper: {
      background: "#101317",
      border: "1px solid #22272d",
      borderRadius: "10px",
      overflow: "auto",
    },

    table: {
      width: "100%",
      minWidth: isMobile ? "720px" : "700px",
      borderCollapse: "collapse",
    },

    th: {
      textAlign: "left",
      padding: "13px 15px",
      background: "#0d1013",
      borderBottom: "1px solid #252a30",
      color: "#686f78",
      fontSize: "8px",
      fontWeight: 900,
      letterSpacing: "1px",
      whiteSpace: "nowrap",
    },

    tr: {
      borderBottom: "1px solid #1d2126",
      transition: "background 0.15s ease",
    },

    td: {
      padding: "13px 15px",
      color: "#aeb3b9",
      fontSize: "11px",
      whiteSpace: "nowrap",
    },

    idCell: {
      padding: "13px 15px",
      color: "#686f78",
      fontSize: "10px",
      fontFamily: "monospace",
      whiteSpace: "nowrap",
    },

    memberCell: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      color: "#e3e5e7",
      fontWeight: 600,
    },

    tableAvatar: {
      width: "29px",
      height: "29px",
      borderRadius: "7px",
      background: "#191c21",
      border: "1px solid #292e35",
      color: "#ff9541",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 900,
    },

    planName: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      color: "#e5e7e9",
      fontWeight: 700,
    },

    planMark: {
      width: "27px",
      height: "27px",
      borderRadius: "6px",
      background: "rgba(255,122,26,0.08)",
      border: "1px solid rgba(255,122,26,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff9541",
      fontSize: "9px",
      fontWeight: 900,
    },

    priceCell: {
      padding: "13px 15px",
      color: "#ff9848",
      fontSize: "11px",
      fontWeight: 800,
      whiteSpace: "nowrap",
    },

    durationBadge: {
      padding: "5px 8px",
      background: "#171a1f",
      border: "1px solid #292e35",
      color: "#969ca4",
      borderRadius: "5px",
      fontSize: "9px",
    },

    dangerBtn: {
      padding: "7px 11px",
      background: "rgba(255,76,76,0.07)",
      border: "1px solid rgba(255,76,76,0.22)",
      color: "#ff7777",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "9px",
      fontWeight: 700,
      transition: "all 0.2s ease",
    },

    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 9px",
      borderRadius: "5px",
      fontSize: "9px",
      fontWeight: 800,
      textTransform: "capitalize",
    },

    statusActive: {
      background: "rgba(84,217,139,0.07)",
      border: "1px solid rgba(84,217,139,0.18)",
      color: "#6fdb9a",
    },

    statusInactive: {
      background: "rgba(150,150,150,0.07)",
      border: "1px solid rgba(150,150,150,0.15)",
      color: "#777e86",
    },

    statusSmallDot: {
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: "currentColor",
    },

    /* EMPTY */

    emptyState: {
      padding: "55px 20px",
      textAlign: "center",
    },

    emptyIcon: {
      width: "45px",
      height: "45px",
      borderRadius: "10px",
      margin: "0 auto 12px",
      background: "#171a1f",
      border: "1px solid #292e35",
      color: "#555c65",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
    },

    emptyTitle: {
      color: "#a2a7ad",
      fontSize: "12px",
      fontWeight: 700,
    },

    emptyText: {
      color: "#5e646c",
      fontSize: "10px",
      marginTop: "5px",
    },
  };
}

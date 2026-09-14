import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 860 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 860);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { access_token, role, name, user_id } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      localStorage.setItem("user_id", user_id);

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      setMode("login");
      setError("Registration successful. Please log in.");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setTempPassword("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/forgot-password", {
        email: forgotEmail,
      });

      setTempPassword(response.data.temporary_password);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not reset password for this email."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setTempPassword("");
  };

  const s = getStyles(isMobile);

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          min-height: 100%;
        }

        body {
          background: #0B100D;
        }

        button,
        input {
          font-family: inherit;
        }

        @keyframes gs-float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes gs-pulse-run {
          0% {
            stroke-dashoffset: 300;
          }

          45% {
            stroke-dashoffset: 0;
          }

          100% {
            stroke-dashoffset: -300;
          }
        }

        @keyframes gs-dot-fade {
          0%, 100% {
            opacity: 0.35;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes gs-glow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(200, 255, 77, 0);
          }

          50% {
            box-shadow: 0 0 28px rgba(200, 255, 77, 0.08);
          }
        }

        @keyframes gs-shine {
          0% {
            left: -120%;
          }

          100% {
            left: 140%;
          }
        }

        .gs-pulse-path {
          stroke-dasharray: 300;
          animation: gs-pulse-run 3.2s linear infinite;
        }

        .gs-live-dot {
          animation: gs-dot-fade 1.6s ease-in-out infinite;
        }

        .gs-input::placeholder {
          color: #667269;
        }

        .gs-input:focus {
          border-color: #C8FF4D !important;
          background: #121A14 !important;
        }

        .gs-input:hover:not(:focus) {
          border-color: #3A473E !important;
        }

        .gs-primary-btn {
          position: relative;
          overflow: hidden;
        }

        .gs-primary-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.22),
            transparent
          );
          transform: skewX(-20deg);
        }

        .gs-primary-btn:hover:not(:disabled)::before {
          animation: gs-shine 0.65s ease;
        }

        .gs-primary-btn:hover:not(:disabled) {
          background: #B7ED3E !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(200, 255, 77, 0.18);
        }

        .gs-primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .gs-segment-btn:hover {
          color: #F5F8F3 !important;
        }

        .gs-link-pill:hover {
          color: #C8FF4D !important;
        }

        .gs-eye-button:hover {
          opacity: 0.75;
        }

        @media (max-width: 600px) {
          .gs-brand-text {
            font-size: 17px !important;
          }
        }
      `}</style>

      {/* ================= LEFT / HERO PANEL ================= */}

      <div style={s.heroPanel}>
        <div style={s.heroGlowOne}></div>
        <div style={s.heroGlowTwo}></div>
        <div style={s.heroGrid}></div>

        <div style={s.heroTopRow}>
          <div style={s.heroBadge}>
            <DumbbellIcon />
          </div>

          <div>
            <span className="gs-brand-text" style={s.heroBrandSmall}>
              Gym<span style={s.heroBrandAccent}>Sync</span>
            </span>

            <div style={s.brandLine}></div>
          </div>
        </div>

        <div style={s.heroBody}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowLine}></span>
            FITNESS MANAGEMENT
          </div>

          <h1 style={s.wordmark}>
            TRAIN.
            <br />
            TRACK.
            <br />
            <span style={s.wordmarkAccent}>REPEAT.</span>
          </h1>

          <p style={s.heroTagline}>
            One place for check-ins, memberships and payments — built for
            people who don't skip leg day.
          </p>

          <div style={s.heroStats}>
            <div style={s.statItem}>
              <strong style={s.statNumber}>01</strong>
              <span style={s.statLabel}>TRAIN</span>
            </div>

            <div style={s.statDivider}></div>

            <div style={s.statItem}>
              <strong style={s.statNumber}>02</strong>
              <span style={s.statLabel}>TRACK</span>
            </div>

            <div style={s.statDivider}></div>

            <div style={s.statItem}>
              <strong style={s.statNumber}>03</strong>
              <span style={s.statLabel}>GROW</span>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div style={s.pulseWrap}>
            <svg
              viewBox="0 0 300 60"
              style={s.pulseSvg}
              preserveAspectRatio="none"
            >
              <path
                d="M0 30 H90 L105 10 L120 50 L135 18 L150 42 L165 30 H300"
                fill="none"
                stroke="rgba(200,255,77,0.12)"
                strokeWidth="2"
              />

              <path
                className="gs-pulse-path"
                d="M0 30 H90 L105 10 L120 50 L135 18 L150 42 L165 30 H300"
                fill="none"
                stroke="#C8FF4D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div style={s.pulseCaption}>
              <span
                className="gs-live-dot"
                style={s.liveDot}
              ></span>

              Live activity system
            </div>
          </div>
        )}

        <div style={s.heroCornerText}>
          GYMSYNC / 2026
        </div>
      </div>

      {/* ================= FORM PANEL ================= */}

      <div style={s.formPanel}>
        <div style={s.formCard}>
          <div style={s.formTopAccent}></div>

          <div style={s.formInner}>
            <div style={s.formHeadRow}>
              <div style={s.formMiniLabel}>
                <span style={s.formMiniDot}></span>
                GYMSYNC ACCOUNT
              </div>

              <h2 style={s.formTitle}>
                {mode === "login" && "Welcome back"}
                {mode === "register" && "Create your account"}
                {mode === "forgot" && "Reset your password"}
              </h2>

              <p style={s.formSubtitle}>
                {mode === "login" &&
                  "Sign in to pick up where you left off."}

                {mode === "register" &&
                  "Join the floor. It takes less than a minute."}

                {mode === "forgot" &&
                  "We'll issue a temporary password for this email."}
              </p>
            </div>

            {mode !== "forgot" && (
              <div style={s.segmentSwitcher}>
                <button
                  type="button"
                  className="gs-segment-btn"
                  style={{
                    ...s.segmentBtn,
                    ...(mode === "login"
                      ? s.segmentBtnActive
                      : {}),
                  }}
                  onClick={() => switchMode("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="gs-segment-btn"
                  style={{
                    ...s.segmentBtn,
                    ...(mode === "register"
                      ? s.segmentBtnActive
                      : {}),
                  }}
                  onClick={() => switchMode("register")}
                >
                  Register
                </button>
              </div>
            )}

            {error && (
              <div
                style={{
                  ...s.banner,
                  ...(error
                    .toLowerCase()
                    .includes("successful")
                    ? s.bannerSuccess
                    : s.bannerError),
                }}
              >
                <span style={s.bannerIcon}>
                  {error
                    .toLowerCase()
                    .includes("successful")
                    ? "✓"
                    : "!"}
                </span>

                <span>{error}</span>
              </div>
            )}

            {tempPassword && (
              <div style={s.tempPasswordBox}>
                <div style={s.tempPasswordTop}>
                  <span style={s.tempPasswordIcon}>
                    ✓
                  </span>

                  <p style={s.tempPasswordLabel}>
                    Temporary password generated
                  </p>
                </div>

                <p style={s.tempPasswordValue}>
                  {tempPassword}
                </p>

                <p style={s.tempPasswordHint}>
                  Log in with this, then update your password.
                </p>
              </div>
            )}

            {mode === "forgot" ? (
              <form
                onSubmit={handleForgotPassword}
                style={s.form}
              >
                <label style={s.fieldLabel}>
                  Registered email

                  <input
                    className="gs-input"
                    style={s.input}
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) =>
                      setForgotEmail(e.target.value)
                    }
                    required
                  />
                </label>

                <button
                  className="gs-primary-btn"
                  style={{
                    ...s.button,
                    ...(loading
                      ? s.buttonDisabled
                      : {}),
                  }}
                  type="submit"
                  disabled={loading}
                >
                  <span style={s.buttonContent}>
                    {loading
                      ? "Please wait..."
                      : "Send reset password"}

                    {!loading && (
                      <span style={s.buttonArrow}>
                        →
                      </span>
                    )}
                  </span>
                </button>
              </form>
            ) : (
              <form
                onSubmit={
                  mode === "register"
                    ? handleRegister
                    : handleLogin
                }
                style={s.form}
              >
                {mode === "register" && (
                  <>
                    <label style={s.fieldLabel}>
                      Full name

                      <input
                        className="gs-input"
                        style={s.input}
                        type="text"
                        name="name"
                        placeholder="Jordan Lee"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label style={s.fieldLabel}>
                      Phone number

                      <input
                        className="gs-input"
                        style={s.input}
                        type="text"
                        name="phone"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </label>
                  </>
                )}

                <label style={s.fieldLabel}>
                  Email address

                  <input
                    className="gs-input"
                    style={s.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label style={s.fieldLabel}>
                  Password

                  <div style={s.passwordWrapper}>
                    <input
                      className="gs-input"
                      style={{
                        ...s.input,
                        ...s.passwordInput,
                      }}
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />

                    <span
                      className="gs-eye-button"
                      style={s.eyeIcon}
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      role="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon />
                      ) : (
                        <EyeIcon />
                      )}
                    </span>
                  </div>
                </label>

                {mode === "login" && (
                  <span
                    style={s.forgotLink}
                    onClick={() =>
                      switchMode("forgot")
                    }
                  >
                    Forgot password?
                  </span>
                )}

                <button
                  className="gs-primary-btn"
                  style={{
                    ...s.button,
                    ...(loading
                      ? s.buttonDisabled
                      : {}),
                  }}
                  type="submit"
                  disabled={loading}
                >
                  <span style={s.buttonContent}>
                    {loading
                      ? "Please wait..."
                      : mode === "register"
                      ? "Create account"
                      : "Login"}

                    {!loading && (
                      <span style={s.buttonArrow}>
                        →
                      </span>
                    )}
                  </span>
                </button>
              </form>
            )}

            <p style={s.toggleText}>
              {mode === "forgot" && (
                <span
                  className="gs-link-pill"
                  style={s.toggleLink}
                  onClick={() =>
                    switchMode("login")
                  }
                >
                  ← Back to login
                </span>
              )}

              {mode === "login" && (
                <>
                  New member?{" "}
                  <span
                    className="gs-link-pill"
                    style={s.toggleLink}
                    onClick={() =>
                      switchMode("register")
                    }
                  >
                    Register here
                  </span>
                </>
              )}

              {mode === "register" && (
                <>
                  Already have an account?{" "}
                  <span
                    className="gs-link-pill"
                    style={s.toggleLink}
                    onClick={() =>
                      switchMode("login")
                    }
                  >
                    Login here
                  </span>
                </>
              )}
            </p>

            <div style={s.securityRow}>
              <div style={s.securityIcon}>
                <ShieldIcon />
              </div>

              <div>
                <strong style={s.securityTitle}>
                  Secure access
                </strong>

                <span style={s.securityText}>
                  Your account information is protected.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={s.formFooter}>
          <span>GYMSYNC</span>
          <span style={s.footerDot}></span>
          <span>FITNESS MANAGEMENT</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function DumbbellIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#101711"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 6.5v11" />
      <path d="M17.5 6.5v11" />
      <path d="M3.5 9v6" />
      <path d="M20.5 9v6" />
      <path d="M6.5 12h11" />
      <path d="M3.5 10.5h3" />
      <path d="M17.5 10.5h3" />
      <path d="M3.5 13.5h3" />
      <path d="M17.5 13.5h3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A8C936"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A8C936"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 4v5c0 4.7-3 7.8-7 9-4-1.2-7-4.3-7-9V7l7-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* =========================================================
   STYLES
========================================================= */

function getStyles(isMobile) {
  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      fontFamily:
        "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#0B100D",
      color: "#F5F8F3",
      overflow: isMobile ? "visible" : "hidden",
    },

    /* ================= HERO ================= */

    heroPanel: {
      position: "relative",
      width: isMobile ? "100%" : "48%",
      minHeight: isMobile ? "365px" : "100vh",
      background:
        "radial-gradient(circle at 72% 20%, rgba(200,255,77,0.065), transparent 30%), linear-gradient(145deg, #0B100D 0%, #101711 100%)",
      color: "#F5F8F3",
      padding: isMobile
        ? "28px 24px 34px"
        : "48px 62px",
      display: "flex",
      flexDirection: "column",
      justifyContent: isMobile
        ? "flex-start"
        : "space-between",
      clipPath: isMobile
        ? "none"
        : "polygon(0 0, 100% 0, 86% 100%, 0% 100%)",
      boxSizing: "border-box",
      overflow: "hidden",
      borderRight: isMobile
        ? "none"
        : "1px solid #29342C",
    },

    heroGlowOne: {
      position: "absolute",
      width: "390px",
      height: "390px",
      borderRadius: "50%",
      right: "-190px",
      top: "10%",
      background:
        "rgba(200,255,77,0.035)",
      filter: "blur(16px)",
      pointerEvents: "none",
    },

    heroGlowTwo: {
      position: "absolute",
      width: "230px",
      height: "230px",
      borderRadius: "50%",
      left: "-130px",
      bottom: "8%",
      background:
        "rgba(168,201,54,0.025)",
      filter: "blur(15px)",
      pointerEvents: "none",
    },

    heroGrid: {
      position: "absolute",
      inset: 0,
      opacity: 0.2,
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(rgba(200,255,77,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,77,0.035) 1px, transparent 1px)",
      backgroundSize: "44px 44px",
      maskImage:
        "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 85%)",
      WebkitMaskImage:
        "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 85%)",
    },

    heroTopRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      position: "relative",
      zIndex: 2,
    },

    heroBadge: {
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      background: "#C8FF4D",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow:
        "0 8px 28px rgba(200,255,77,0.13)",
      animation:
        "gs-float 4s ease-in-out infinite",
    },

    heroBrandSmall: {
      fontFamily:
        "'Oswald', 'Inter', sans-serif",
      fontSize: "19px",
      fontWeight: 600,
      letterSpacing: "0.3px",
      color: "#F5F8F3",
    },

    heroBrandAccent: {
      color: "#C8FF4D",
    },

    brandLine: {
      width: "25px",
      height: "2px",
      background: "#C8FF4D",
      marginTop: "4px",
      borderRadius: "10px",
    },

    heroBody: {
      marginTop: isMobile ? "35px" : "0",
      position: "relative",
      zIndex: 2,
    },

    eyebrow: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "2px",
      color: "#A8C936",
      marginBottom: "15px",
    },

    eyebrowLine: {
      width: "27px",
      height: "1px",
      background: "#A8C936",
    },

    wordmark: {
      fontFamily:
        "'Oswald', 'Inter', sans-serif",
      fontSize: isMobile
        ? "58px"
        : "clamp(60px, 7vw, 94px)",
      lineHeight: "0.88",
      letterSpacing: "2px",
      margin: 0,
      color: "#F5F8F3",
      fontWeight: 600,
    },

    wordmarkAccent: {
      color: "#C8FF4D",
    },

    heroTagline: {
      marginTop: isMobile ? "18px" : "24px",
      maxWidth: "410px",
      fontSize: "13px",
      lineHeight: "1.75",
      color: "#8F9B91",
      marginBottom: 0,
    },

    heroStats: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginTop: isMobile ? "24px" : "32px",
    },

    statItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },

    statNumber: {
      fontFamily:
        "'Oswald', 'Inter', sans-serif",
      fontSize: "17px",
      fontWeight: 600,
      color: "#C8FF4D",
    },

    statLabel: {
      fontSize: "8px",
      fontWeight: 800,
      letterSpacing: "1.5px",
      color: "#667269",
    },

    statDivider: {
      width: "1px",
      height: "28px",
      background: "#29342C",
    },

    pulseWrap: {
      marginTop: "20px",
      position: "relative",
      zIndex: 2,
      maxWidth: "410px",
    },

    pulseSvg: {
      width: "100%",
      height: "50px",
      display: "block",
    },

    pulseCaption: {
      marginTop: "9px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "10px",
      color: "#606C63",
      letterSpacing: "0.2px",
    },

    liveDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#C8FF4D",
      display: "inline-block",
      boxShadow:
        "0 0 10px rgba(200,255,77,0.45)",
    },

    heroCornerText: {
      position: "absolute",
      bottom: "25px",
      left: isMobile ? "24px" : "62px",
      fontSize: "8px",
      letterSpacing: "2px",
      color: "#364039",
      fontWeight: 700,
      zIndex: 2,
    },

    /* ================= FORM PANEL ================= */

    formPanel: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile
        ? "28px 18px 40px"
        : "45px 65px 38px",
      boxSizing: "border-box",
      position: "relative",
      background:
        "radial-gradient(circle at 80% 15%, rgba(200,255,77,0.025), transparent 28%), #0B100D",
      minWidth: 0,
    },

    formCard: {
      width: "100%",
      maxWidth: "445px",
      position: "relative",
      background: "#151D17",
      border: "1px solid #29342C",
      borderRadius: "20px",
      padding: isMobile
        ? "28px 22px 25px"
        : "34px 38px 30px",
      boxShadow:
        "0 24px 70px rgba(0,0,0,0.28)",
    },

    formTopAccent: {
      position: "absolute",
      top: 0,
      left: "32px",
      right: "32px",
      height: "2px",
      background:
        "linear-gradient(90deg, transparent, #C8FF4D, transparent)",
      borderRadius: "0 0 10px 10px",
      opacity: 0.8,
    },

    formInner: {
      width: "100%",
      margin: "0 auto",
    },

    formHeadRow: {
      marginBottom: "22px",
    },

    formMiniLabel: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "1.7px",
      color: "#78857B",
      marginBottom: "11px",
    },

    formMiniDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#C8FF4D",
      boxShadow:
        "0 0 9px rgba(200,255,77,0.3)",
    },

    formTitle: {
      fontFamily:
        "'Oswald', 'Inter', sans-serif",
      fontSize: isMobile ? "31px" : "34px",
      fontWeight: 600,
      color: "#F5F8F3",
      margin: 0,
      letterSpacing: "0.2px",
      lineHeight: "1.1",
    },

    formSubtitle: {
      marginTop: "8px",
      marginBottom: 0,
      fontSize: "12px",
      color: "#7E8A81",
      lineHeight: "1.55",
    },

    /* ================= SWITCHER ================= */

    segmentSwitcher: {
      display: "flex",
      background: "#101711",
      borderRadius: "11px",
      padding: "4px",
      marginBottom: "22px",
      gap: "4px",
      border: "1px solid #29342C",
    },

    segmentBtn: {
      flex: 1,
      padding: "10px 0",
      borderRadius: "8px",
      border: "none",
      background: "transparent",
      color: "#6F7B72",
      fontSize: "11px",
      fontWeight: 700,
      cursor: "pointer",
      transition:
        "all 0.2s ease",
    },

    segmentBtnActive: {
      background: "#C8FF4D",
      color: "#101711",
      boxShadow:
        "0 5px 16px rgba(200,255,77,0.12)",
    },

    /* ================= FORM ================= */

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "17px",
    },

    fieldLabel: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      fontSize: "10px",
      fontWeight: 700,
      color: "#9AA69D",
      letterSpacing: "0.2px",
    },

    input: {
      padding: "12px 13px",
      border: "1px solid #29342C",
      borderRadius: "9px",
      background: "#101711",
      color: "#F5F8F3",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition:
        "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
    },

    passwordWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    passwordInput: {
      paddingRight: "42px",
    },

    eyeIcon: {
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "7px",
      transition:
        "opacity 0.15s ease",
    },

    forgotLink: {
      alignSelf: "flex-end",
      fontSize: "10px",
      color: "#A8C936",
      cursor: "pointer",
      marginTop: "-7px",
      fontWeight: 700,
      transition: "color 0.2s ease",
    },

    /* ================= BUTTON ================= */

    button: {
      marginTop: "4px",
      padding: "13px 16px",
      minHeight: "48px",
      borderRadius: "10px",
      border: "1px solid #C8FF4D",
      background: "#C8FF4D",
      color: "#101711",
      fontSize: "12px",
      fontWeight: 800,
      letterSpacing: "0.1px",
      cursor: "pointer",
      transition:
        "background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    },

    buttonContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      position: "relative",
      zIndex: 2,
    },

    buttonArrow: {
      fontSize: "17px",
      lineHeight: 1,
      fontWeight: 500,
    },

    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },

    /* ================= BANNERS ================= */

    banner: {
      padding: "11px 12px",
      borderRadius: "10px",
      marginBottom: "16px",
      fontSize: "11px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "9px",
      lineHeight: "1.4",
    },

    bannerError: {
      background: "rgba(255,92,85,0.08)",
      color: "#FF8A84",
      border: "1px solid rgba(255,92,85,0.22)",
    },

    bannerSuccess: {
      background: "rgba(200,255,77,0.08)",
      color: "#C8FF4D",
      border: "1px solid rgba(200,255,77,0.2)",
    },

    bannerIcon: {
      width: "19px",
      height: "19px",
      minWidth: "19px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(200,255,77,0.09)",
      fontSize: "10px",
      fontWeight: 800,
    },

    /* ================= TEMP PASSWORD ================= */

    tempPasswordBox: {
      background:
        "linear-gradient(135deg, rgba(200,255,77,0.08), rgba(168,201,54,0.04))",
      border: "1px solid rgba(200,255,77,0.2)",
      borderRadius: "12px",
      padding: "15px",
      marginBottom: "16px",
      textAlign: "center",
      animation:
        "gs-glow 2.5s ease-in-out infinite",
    },

    tempPasswordTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
    },

    tempPasswordIcon: {
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      background: "#C8FF4D",
      color: "#101711",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
    },

    tempPasswordLabel: {
      fontSize: "10px",
      color: "#9AA69D",
      margin: 0,
      fontWeight: 700,
    },

    tempPasswordValue: {
      fontFamily:
        "'Oswald', 'Inter', sans-serif",
      fontSize: "21px",
      fontWeight: 600,
      color: "#C8FF4D",
      margin: "7px 0",
      letterSpacing: "1.5px",
    },

    tempPasswordHint: {
      fontSize: "9px",
      color: "#68756C",
      margin: 0,
    },

    /* ================= TOGGLE ================= */

    toggleText: {
      textAlign: "center",
      marginTop: "20px",
      marginBottom: 0,
      fontSize: "11px",
      color: "#6F7B72",
    },

    toggleLink: {
      color: "#A8C936",
      fontWeight: 700,
      cursor: "pointer",
      padding: "3px 5px",
      borderRadius: "5px",
      transition: "color 0.15s ease",
    },

    /* ================= SECURITY ================= */

    securityRow: {
      marginTop: "20px",
      paddingTop: "14px",
      borderTop: "1px solid #29342C",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
    },

    securityIcon: {
      width: "25px",
      height: "25px",
      borderRadius: "7px",
      background: "rgba(200,255,77,0.08)",
      color: "#C8FF4D",
      border: "1px solid rgba(200,255,77,0.14)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
    },

    securityTitle: {
      display: "block",
      fontSize: "10px",
      color: "#A8B2AA",
      fontWeight: 800,
    },

    securityText: {
      display: "block",
      marginTop: "2px",
      fontSize: "9px",
      color: "#626E65",
    },

    /* ================= FOOTER ================= */

    formFooter: {
      marginTop: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontSize: "7px",
      letterSpacing: "1.7px",
      fontWeight: 800,
      color: "#465148",
    },

    footerDot: {
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: "#A8C936",
    },
  };
}

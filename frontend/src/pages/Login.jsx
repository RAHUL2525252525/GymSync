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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
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

        @keyframes gs-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes gs-glow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(255, 122, 26, 0);
          }
          50% {
            box-shadow: 0 0 28px rgba(255, 122, 26, 0.08);
          }
        }

        .gs-pulse-path {
          stroke-dasharray: 300;
          animation: gs-pulse-run 3.2s linear infinite;
        }

        .gs-live-dot {
          animation: gs-dot-fade 1.6s ease-in-out infinite;
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
            rgba(255,255,255,0.16),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.55s ease;
        }

        .gs-primary-btn:hover:not(:disabled)::before {
          left: 140%;
        }

        .gs-primary-btn:hover:not(:disabled) {
          background: #ffffff !important;
          color: #0b0b0c !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(11, 11, 12, 0.14);
        }

        .gs-primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .gs-segment-btn:hover {
          color: #0b0b0c;
        }

        .gs-link-pill:hover {
          background: #fff0e0;
        }

        .gs-input::placeholder {
          color: #b7ab9c;
        }

        .gs-input:focus {
          border-bottom-color: #ff7a1a !important;
        }

        .gs-eye-button:hover {
          opacity: 0.7;
        }
      `}</style>

      {/* ================= HERO PANEL ================= */}
      <div style={s.heroPanel}>
        <div style={s.heroGlowOne}></div>
        <div style={s.heroGlowTwo}></div>

        <div style={s.heroTopRow}>
          <div style={s.heroBadge}>
            <span style={s.badgeIcon}>💪</span>
          </div>

          <div>
            <span style={s.heroBrandSmall}>GymSync</span>
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
              <strong>01</strong>
              <span>TRAIN</span>
            </div>

            <div style={s.statDivider}></div>

            <div style={s.statItem}>
              <strong>02</strong>
              <span>TRACK</span>
            </div>

            <div style={s.statDivider}></div>

            <div style={s.statItem}>
              <strong>03</strong>
              <span>GROW</span>
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
                stroke="rgba(255,122,26,0.18)"
                strokeWidth="2"
              />

              <path
                className="gs-pulse-path"
                d="M0 30 H90 L105 10 L120 50 L135 18 L150 42 L165 30 H300"
                fill="none"
                stroke="#ff7a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div style={s.pulseCaption}>
              <span className="gs-live-dot" style={s.liveDot}></span>
              Live activity feed
            </div>
          </div>
        )}

        <div style={s.heroCornerText}>GYMSYNC / 2026</div>
      </div>

      {/* ================= FORM PANEL ================= */}
      <div style={s.formPanel}>
        <div style={s.formCard}>
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
                    ...(mode === "login" ? s.segmentBtnActive : {}),
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
                    ...(mode === "register" ? s.segmentBtnActive : {}),
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
                  ...(error.toLowerCase().includes("successful")
                    ? s.bannerSuccess
                    : s.bannerError),
                }}
              >
                <span style={s.bannerIcon}>
                  {error.toLowerCase().includes("successful") ? "✓" : "!"}
                </span>

                <span>{error}</span>
              </div>
            )}

            {tempPassword && (
              <div style={s.tempPasswordBox}>
                <div style={s.tempPasswordTop}>
                  <span style={s.tempPasswordIcon}>✓</span>

                  <p style={s.tempPasswordLabel}>
                    Temporary password generated
                  </p>
                </div>

                <p style={s.tempPasswordValue}>{tempPassword}</p>

                <p style={s.tempPasswordHint}>
                  Log in with this, then update your password.
                </p>
              </div>
            )}

            {mode === "forgot" ? (
              <form onSubmit={handleForgotPassword} style={s.form}>
                <label style={s.fieldLabel}>
                  Registered email

                  <input
                    className="gs-input"
                    style={s.input}
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor = "#ff7a1a")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "#e4ddd2")
                    }
                  />
                </label>

                <button
                  className="gs-primary-btn"
                  style={{
                    ...s.button,
                    ...(loading ? s.buttonDisabled : {}),
                  }}
                  type="submit"
                  disabled={loading}
                >
                  <span style={s.buttonContent}>
                    {loading ? "Please wait..." : "Send reset password"}

                    {!loading && <span style={s.buttonArrow}>→</span>}
                  </span>
                </button>
              </form>
            ) : (
              <form
                onSubmit={
                  mode === "register" ? handleRegister : handleLogin
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
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "#ff7a1a")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor = "#e4ddd2")
                        }
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
                        onFocus={(e) =>
                          (e.target.style.borderBottomColor = "#ff7a1a")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderBottomColor = "#e4ddd2")
                        }
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
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor = "#ff7a1a")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "#e4ddd2")
                    }
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
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      onFocus={(e) =>
                        (e.target.style.borderBottomColor = "#ff7a1a")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor = "#e4ddd2")
                      }
                    />

                    <span
                      className="gs-eye-button"
                      style={s.eyeIcon}
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      role="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </div>
                </label>

                {mode === "login" && (
                  <span
                    style={s.forgotLink}
                    onClick={() => switchMode("forgot")}
                  >
                    Forgot password?
                  </span>
                )}

                <button
                  className="gs-primary-btn"
                  style={{
                    ...s.button,
                    ...(loading ? s.buttonDisabled : {}),
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

                    {!loading && <span style={s.buttonArrow}>→</span>}
                  </span>
                </button>
              </form>
            )}

            <p style={s.toggleText}>
              {mode === "forgot" && (
                <span
                  className="gs-link-pill"
                  style={s.toggleLink}
                  onClick={() => switchMode("login")}
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
                    onClick={() => switchMode("register")}
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
                    onClick={() => switchMode("login")}
                  >
                    Login here
                  </span>
                </>
              )}
            </p>

            <div style={s.securityRow}>
              <div style={s.securityIcon}>✓</div>

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
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff7a1a"
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
      stroke="#ff7a1a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getStyles(isMobile) {
  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      fontFamily:
        "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#faf8f5",
      overflow: "hidden",
    },

    /* ================= HERO ================= */

    heroPanel: {
      position: "relative",
      width: isMobile ? "100%" : "46%",
      minHeight: isMobile ? "330px" : "100vh",
      background:
        "radial-gradient(circle at 75% 20%, rgba(255,122,26,0.09), transparent 28%), #0b0b0c",
      color: "#f5f0e8",
      padding: isMobile ? "25px 24px 30px" : "48px 56px",
      display: "flex",
      flexDirection: "column",
      justifyContent: isMobile ? "flex-start" : "space-between",
      clipPath: isMobile
        ? "none"
        : "polygon(0 0, 100% 0, 84% 100%, 0% 100%)",
      boxSizing: "border-box",
      overflow: "hidden",
    },

    heroGlowOne: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      right: "-130px",
      top: "15%",
      background: "rgba(255,122,26,0.035)",
      filter: "blur(10px)",
      pointerEvents: "none",
    },

    heroGlowTwo: {
      position: "absolute",
      width: "180px",
      height: "180px",
      borderRadius: "50%",
      left: "-100px",
      bottom: "8%",
      background: "rgba(255,122,26,0.025)",
      filter: "blur(8px)",
      pointerEvents: "none",
    },

    heroTopRow: {
      display: "flex",
      alignItems: "center",
      gap: "11px",
      position: "relative",
      zIndex: 2,
    },

    heroBadge: {
      width: "38px",
      height: "38px",
      borderRadius: "11px",
      background:
        "linear-gradient(135deg, #ff7a1a, #ffb156)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
      flexShrink: 0,
      boxShadow: "0 8px 24px rgba(255,122,26,0.15)",
      animation: "gs-float 4s ease-in-out infinite",
    },

    badgeIcon: {
      filter: "grayscale(1) brightness(10)",
      fontSize: "16px",
    },

    heroBrandSmall: {
      fontSize: "14px",
      fontWeight: 800,
      letterSpacing: "0.6px",
      color: "#f5f0e8",
    },

    brandLine: {
      width: "22px",
      height: "2px",
      background: "#ff7a1a",
      marginTop: "4px",
      borderRadius: "10px",
    },

    heroBody: {
      marginTop: isMobile ? "30px" : "0",
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
      color: "#ff7a1a",
      marginBottom: "15px",
    },

    eyebrowLine: {
      width: "25px",
      height: "1px",
      background: "#ff7a1a",
    },

    wordmark: {
      fontFamily: "'Bebas Neue', 'Inter', sans-serif",
      fontSize: isMobile
        ? "58px"
        : "clamp(56px, 7vw, 92px)",
      lineHeight: isMobile ? "0.88" : "0.87",
      letterSpacing: "2px",
      margin: 0,
      color: "#f5f0e8",
    },

    wordmarkAccent: {
      color: "#ff7a1a",
    },

    heroTagline: {
      marginTop: isMobile ? "17px" : "24px",
      maxWidth: "390px",
      fontSize: "13px",
      lineHeight: "1.7",
      color: "#a9a29a",
    },

    heroStats: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
      marginTop: isMobile ? "23px" : "32px",
    },

    statItem: {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    },

    statItemStrong: {
      fontSize: "16px",
    },

    statDivider: {
      width: "1px",
      height: "27px",
      background: "rgba(255,255,255,0.12)",
    },

    statItem: {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    },

    pulseWrap: {
      marginTop: "20px",
      position: "relative",
      zIndex: 2,
    },

    pulseSvg: {
      width: "100%",
      height: "50px",
      display: "block",
    },

    pulseCaption: {
      marginTop: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "11px",
      color: "#716b64",
      letterSpacing: "0.2px",
    },

    liveDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#ff7a1a",
      display: "inline-block",
      boxShadow: "0 0 9px rgba(255,122,26,0.55)",
    },

    heroCornerText: {
      position: "absolute",
      bottom: "24px",
      left: "56px",
      fontSize: "8px",
      letterSpacing: "2px",
      color: "#403e3b",
      fontWeight: 700,
      zIndex: 2,
    },

    /* ================= FORM ================= */

    formPanel: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "25px 18px 45px" : "45px",
      boxSizing: "border-box",
      position: "relative",
      background: "#faf8f5",
    },

    formCard: {
      width: "100%",
      maxWidth: "440px",
      padding: isMobile ? "0" : "10px 20px",
      position: "relative",
    },

    formInner: {
      width: "100%",
      maxWidth: "380px",
      margin: "0 auto",
    },

    formHeadRow: {
      marginBottom: "23px",
    },

    formMiniLabel: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "1.6px",
      color: "#a2988b",
      marginBottom: "11px",
    },

    formMiniDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#ff7a1a",
      boxShadow: "0 0 8px rgba(255,122,26,0.25)",
    },

    formTitle: {
      fontSize: isMobile ? "27px" : "30px",
      fontWeight: 800,
      color: "#1c1c1e",
      margin: 0,
      letterSpacing: "-0.8px",
      lineHeight: "1.1",
    },

    formSubtitle: {
      marginTop: "8px",
      marginBottom: 0,
      fontSize: "13px",
      color: "#8f867a",
      lineHeight: "1.5",
    },

    segmentSwitcher: {
      display: "flex",
      background: "#f1ece3",
      borderRadius: "12px",
      padding: "4px",
      marginBottom: "25px",
      gap: "4px",
      border: "1px solid #e8dfd3",
    },

    segmentBtn: {
      flex: 1,
      padding: "10px 0",
      borderRadius: "9px",
      border: "none",
      background: "transparent",
      color: "#8f867a",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    segmentBtnActive: {
      background: "#0b0b0c",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(11,11,12,0.12)",
    },

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "19px",
    },

    fieldLabel: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      fontSize: "11px",
      fontWeight: 700,
      color: "#6b6b6f",
      letterSpacing: "0.1px",
    },

    input: {
      padding: "10px 4px 11px",
      border: "none",
      borderBottom: "2px solid #e4ddd2",
      borderRadius: 0,
      background: "transparent",
      color: "#1c1c1e",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "border-color 0.2s ease",
    },

    passwordWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    passwordInput: {
      paddingRight: "32px",
    },

    eyeIcon: {
      position: "absolute",
      right: "0",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "5px",
      transition: "opacity 0.15s ease",
    },

    forgotLink: {
      alignSelf: "flex-end",
      fontSize: "11px",
      color: "#e2651a",
      cursor: "pointer",
      marginTop: "-9px",
      fontWeight: 700,
    },

    button: {
      marginTop: "4px",
      padding: "14px 16px",
      minHeight: "48px",
      borderRadius: "11px",
      border: "2px solid #0b0b0c",
      background: "#0b0b0c",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 700,
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
      transition: "transform 0.2s ease",
    },

    buttonDisabled: {
      opacity: 0.55,
      cursor: "not-allowed",
    },

    banner: {
      padding: "11px 13px",
      borderRadius: "11px",
      marginBottom: "17px",
      fontSize: "12px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "9px",
      lineHeight: "1.4",
    },

    bannerError: {
      background: "#fff0ee",
      color: "#e0432a",
      border: "1px solid #ffd0c8",
    },

    bannerSuccess: {
      background: "#fff0e0",
      color: "#c2660f",
      border: "1px solid #ffd9b3",
    },

    bannerIcon: {
      width: "19px",
      height: "19px",
      minWidth: "19px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(226,101,26,0.1)",
      fontSize: "10px",
      fontWeight: 800,
    },

    tempPasswordBox: {
      background:
        "linear-gradient(135deg, #fff8f0, #fff4e8)",
      border: "1px solid #ffd9b3",
      borderRadius: "13px",
      padding: "15px",
      marginBottom: "17px",
      textAlign: "center",
      animation: "gs-glow 2.5s ease-in-out infinite",
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
      background: "#ff7a1a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
    },

    tempPasswordLabel: {
      fontSize: "11px",
      color: "#a68f75",
      margin: 0,
      fontWeight: 700,
    },

    tempPasswordValue: {
      fontSize: "19px",
      fontWeight: 800,
      color: "#c2660f",
      margin: "7px 0",
      letterSpacing: "1.5px",
    },

    tempPasswordHint: {
      fontSize: "10px",
      color: "#bcae9c",
      margin: 0,
    },

    toggleText: {
      textAlign: "center",
      marginTop: "23px",
      fontSize: "12px",
      color: "#8f867a",
    },

    toggleLink: {
      color: "#e2651a",
      fontWeight: 700,
      cursor: "pointer",
      padding: "3px 6px",
      borderRadius: "6px",
      transition: "background 0.15s ease",
    },

    securityRow: {
      marginTop: "24px",
      paddingTop: "15px",
      borderTop: "1px solid #eee6dc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
    },

    securityIcon: {
      width: "22px",
      height: "22px",
      borderRadius: "7px",
      background: "#fff0e0",
      color: "#e2651a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
    },

    securityTitle: {
      display: "block",
      fontSize: "10px",
      color: "#6f665c",
      fontWeight: 800,
    },

    securityText: {
      display: "block",
      marginTop: "2px",
      fontSize: "9px",
      color: "#afa69b",
    },
  };
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
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

        .gs-pulse-path {
          stroke-dasharray: 300;
          animation: gs-pulse-run 3.2s linear infinite;
        }

        .gs-live-dot {
          animation: gs-dot-fade 1.6s ease-in-out infinite;
        }

        .gs-primary-btn:hover:not(:disabled) {
          background: #ffffff !important;
          color: #0b0b0c !important;
        }

        .gs-segment-btn:hover {
          color: #0b0b0c;
        }

        .gs-link-pill:hover {
          background: #fff0e0;
        }

        input.gs-input::placeholder {
          color: #b7ab9c;
        }

        input.gs-input:focus {
          border-bottom-color: #ff7a1a !important;
        }

        button {
          font-family: inherit;
        }
      `}</style>

      {/* =========================
          LEFT HERO PANEL
      ========================= */}

      <div style={s.heroPanel}>
        <div style={s.heroTopRow}>
          <div style={s.heroBadge}>💪</div>

          <span style={s.heroBrandSmall}>
            GymSync
          </span>
        </div>

        <div style={s.heroBody}>
          <h1 style={s.wordmark}>
            TRAIN.
            <br />
            TRACK.
            <br />
            REPEAT.
          </h1>

          <p style={s.heroTagline}>
            One place for check-ins, memberships and payments — built for
            people who don't skip leg day.
          </p>
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
                stroke="rgba(255,122,26,0.22)"
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
              <span
                className="gs-live-dot"
                style={s.liveDot}
              ></span>

              Live activity feed
            </div>
          </div>
        )}
      </div>

      {/* =========================
          RIGHT FORM PANEL
      ========================= */}

      <div style={s.formPanel}>
        <div style={s.formInner}>

          <div style={s.formHeadRow}>
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

          {/* LOGIN / REGISTER SWITCH */}

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

          {/* ERROR / SUCCESS MESSAGE */}

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
              {error}
            </div>
          )}

          {/* TEMP PASSWORD */}

          {tempPassword && (
            <div style={s.tempPasswordBox}>
              <p style={s.tempPasswordLabel}>
                Your temporary password
              </p>

              <p style={s.tempPasswordValue}>
                {tempPassword}
              </p>

              <p style={s.tempPasswordHint}>
                Log in with this, then update your password.
              </p>
            </div>
          )}

          {/* =========================
              FORGOT PASSWORD
          ========================= */}

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
                  onFocus={(e) =>
                    (e.target.style.borderBottomColor =
                      "#ff7a1a")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderBottomColor =
                      "#e4ddd2")
                  }
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
                {loading
                  ? "Please wait..."
                  : "Send reset password"}
              </button>
            </form>
          ) : (

            /* =========================
               LOGIN / REGISTER FORM
            ========================= */

            <form
              onSubmit={
                mode === "register"
                  ? handleRegister
                  : handleLogin
              }
              style={s.form}
            >

              {/* REGISTER FIELDS */}

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
                        (e.target.style.borderBottomColor =
                          "#ff7a1a")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor =
                          "#e4ddd2")
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
                        (e.target.style.borderBottomColor =
                          "#ff7a1a")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor =
                          "#e4ddd2")
                      }
                    />
                  </label>
                </>
              )}

              {/* EMAIL */}

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
                    (e.target.style.borderBottomColor =
                      "#ff7a1a")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderBottomColor =
                      "#e4ddd2")
                  }
                />
              </label>

              {/* PASSWORD */}

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
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor =
                        "#ff7a1a")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor =
                        "#e4ddd2")
                    }
                  />

                  <span
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
                    {showPassword ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </span>
                </div>
              </label>

              {/* FORGOT PASSWORD */}

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

              {/* SUBMIT */}

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
                {loading
                  ? "Please wait..."
                  : mode === "register"
                  ? "Create account"
                  : "Login"}
              </button>
            </form>
          )}

          {/* =========================
              BOTTOM MODE SWITCH
          ========================= */}

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

          {/* ADMIN HINT */}

          <div style={s.hint}>
            <strong style={{ color: "#e2651a" }}>
              Admin login:
            </strong>{" "}
            use your admin email &amp; password configured
            in the backend .env
          </div>

        </div>
      </div>
    </div>
  );
}

/* =====================================================
   EYE ICON
===================================================== */

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

/* =====================================================
   EYE OFF ICON
===================================================== */

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
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
      />
    </svg>
  );
}

/* =====================================================
   STYLES
===================================================== */

function getStyles(isMobile) {
  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      fontFamily:
        "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#faf8f5",
    },

    /* =========================
       HERO
    ========================= */

    heroPanel: {
      position: "relative",
      width: isMobile ? "100%" : "46%",
      minHeight: isMobile ? "220px" : "100vh",
      background: "#0b0b0c",
      color: "#f5f0e8",
      padding: isMobile
        ? "24px 24px 28px"
        : "48px 56px",
      display: "flex",
      flexDirection: "column",
      justifyContent: isMobile
        ? "flex-start"
        : "space-between",
      clipPath: isMobile
        ? "none"
        : "polygon(0 0, 100% 0, 84% 100%, 0% 100%)",
      boxSizing: "border-box",
      overflow: "hidden",
    },

    heroTopRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    heroBadge: {
      width: "34px",
      height: "34px",
      borderRadius: "9px",
      background:
        "linear-gradient(135deg, #ff7a1a, #ffb156)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      flexShrink: 0,
    },

    heroBrandSmall: {
      fontSize: "13px",
      fontWeight: 700,
      letterSpacing: "0.4px",
      color: "#cfc7ba",
    },

    heroBody: {
      marginTop: isMobile ? "20px" : "0",
    },

    wordmark: {
      fontFamily:
        "'Bebas Neue', 'Inter', sans-serif",
      fontSize: isMobile
        ? "42px"
        : "clamp(48px, 6.5vw, 84px)",
      lineHeight: isMobile
        ? "0.98"
        : "0.92",
      letterSpacing: "1px",
      margin: 0,
      color: "#f5f0e8",
    },

    heroTagline: {
      marginTop: isMobile
        ? "10px"
        : "22px",
      maxWidth: "360px",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#a9a29a",
    },

    pulseWrap: {
      marginTop: "20px",
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
      fontSize: "12px",
      color: "#8a8378",
    },

    liveDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#ff7a1a",
      display: "inline-block",
    },

    /* =========================
       FORM PANEL
    ========================= */

    formPanel: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile
        ? "28px 20px 40px"
        : "48px",
      boxSizing: "border-box",
    },

    formInner: {
      width: "100%",
      maxWidth: "380px",
    },

    formHeadRow: {
      marginBottom: "20px",
    },

    formTitle: {
      fontSize: "26px",
      fontWeight: 800,
      color: "#1c1c1e",
      margin: 0,
      letterSpacing: "-0.4px",
    },

    formSubtitle: {
      marginTop: "6px",
      fontSize: "13px",
      color: "#8f867a",
    },

    /* =========================
       SEGMENT SWITCHER
    ========================= */

    segmentSwitcher: {
      display: "flex",
      background: "#f1ece3",
      borderRadius: "999px",
      padding: "4px",
      marginBottom: "22px",
      gap: "4px",
    },

    segmentBtn: {
      flex: 1,
      padding: "9px 0",
      borderRadius: "999px",
      border: "none",
      background: "transparent",
      color: "#8f867a",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      transition:
        "color 0.15s ease",
    },

    segmentBtnActive: {
      background: "#0b0b0c",
      color: "#ffffff",
    },

    /* =========================
       FORM
    ========================= */

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "18px",
    },

    fieldLabel: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#6b6b6f",
    },

    input: {
      padding: "10px 4px",
      border: "none",
      borderBottom:
        "2px solid #e4ddd2",
      borderRadius: 0,
      background: "transparent",
      color: "#1c1c1e",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition:
        "border-color 0.15s ease",
    },

    passwordWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    passwordInput: {
      paddingRight: "30px",
    },

    eyeIcon: {
      position: "absolute",
      right: "0",
      top: "50%",
      transform:
        "translateY(-50%)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    forgotLink: {
      alignSelf: "flex-end",
      fontSize: "12px",
      color: "#e2651a",
      cursor: "pointer",
      marginTop: "-8px",
      fontWeight: 600,
    },

    /* =========================
       BUTTON
    ========================= */

    button: {
      marginTop: "4px",
      padding: "14px",
      borderRadius: "10px",
      border:
        "2px solid #0b0b0c",
      background: "#0b0b0c",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition:
        "background 0.15s ease, color 0.15s ease",
    },

    buttonDisabled: {
      opacity: 0.55,
      cursor: "not-allowed",
    },

    /* =========================
       BANNERS
    ========================= */

    banner: {
      padding: "10px 12px",
      borderRadius: "10px",
      marginBottom: "16px",
      fontSize: "13px",
      fontWeight: 600,
    },

    bannerError: {
      background: "#fff0ee",
      color: "#e0432a",
      border:
        "1px solid #ffd0c8",
    },

    bannerSuccess: {
      background: "#fff0e0",
      color: "#c2660f",
      border:
        "1px solid #ffd9b3",
    },

    /* =========================
       TEMP PASSWORD
    ========================= */

    tempPasswordBox: {
      background: "#fff8f0",
      border:
        "1px solid #ffd9b3",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "16px",
      textAlign: "center",
    },

    tempPasswordLabel: {
      fontSize: "12px",
      color: "#a68f75",
      margin: 0,
    },

    tempPasswordValue: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#c2660f",
      margin: "6px 0",
      letterSpacing: "1px",
    },

    tempPasswordHint: {
      fontSize: "11px",
      color: "#bcae9c",
      margin: 0,
    },

    /* =========================
       BOTTOM TEXT
    ========================= */

    toggleText: {
      textAlign: "center",
      marginTop: "22px",
      fontSize: "13px",
      color: "#8f867a",
    },

    toggleLink: {
      color: "#e2651a",
      fontWeight: 700,
      cursor: "pointer",
      padding: "2px 6px",
      borderRadius: "6px",
      transition:
        "background 0.15s ease",
    },

    hint: {
      marginTop: "22px",
      fontSize: "11px",
      color: "#bcae9c",
      textAlign: "center",
      borderTop:
        "1px solid #f0e6d8",
      paddingTop: "12px",
    },
  };
}

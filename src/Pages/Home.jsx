import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const BACKEND_URL = "https://saint-joseph-school-app-backend.onrender.com/";
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RETRY_INTERVAL_MS = 3000;         // retry every 5s until server is up

export default function Home() {
    const [serverReady, setServerReady] = useState(false);
    const [statusText, setStatusText] = useState("Starting server, please wait…");
    const [dotCount, setDotCount] = useState(0);

    const retryRef = useRef(null);
    const pingRef = useRef(null);
    const dotRef = useRef(null);

    // Animated dots for "please wait" effect
    useEffect(() => {
        dotRef.current = setInterval(() => {
            setDotCount((d) => (d + 1) % 4);
        }, 500);
        return () => clearInterval(dotRef.current);
    }, []);

    const wakeServer = async () => {
        try {
            const res = await fetch(BACKEND_URL);
            const text = await res.text();
            if (res.ok && text.includes("Welcome")) {
                setServerReady(true);
                setStatusText("Server is ready!");
                clearInterval(retryRef.current);
                clearInterval(dotRef.current);
                startKeepAlive();
            }
        } catch {
            // still sleeping — retry handled by interval
        }
    };

    const startKeepAlive = () => {
        pingRef.current = setInterval(async () => {
            try {
                await fetch(BACKEND_URL);
            } catch {
                // silent — keep-alive ping, non-critical
            }
        }, PING_INTERVAL_MS);
    };

    useEffect(() => {
        wakeServer();
        retryRef.current = setInterval(wakeServer, RETRY_INTERVAL_MS);

        return () => {
            clearInterval(retryRef.current);
            clearInterval(pingRef.current);
            clearInterval(dotRef.current);
        };
    }, []);

    const dots = ".".repeat(dotCount);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* School crest / icon */}
                <div style={styles.crest}>✝</div>

                <h1 style={styles.title}>Saint Joseph School</h1>
                <p style={styles.subtitle}>Student & Staff Portal</p>

                <div style={styles.divider} />

                {/* Server status */}
                <div style={styles.statusRow}>
                    <span
                        style={{
                            ...styles.statusDot,
                            background: serverReady ? "#4ade80" : "#facc15",
                            boxShadow: serverReady
                                ? "0 0 8px #4ade80"
                                : "0 0 8px #facc15",
                        }}
                    />
                    <span style={styles.statusText}>
                        {serverReady
                            ? "Server is ready!"
                            : `${statusText}${dots}`}
                    </span>
                </div>

                {/* Login button */}
                {serverReady ? (
                    <NavLink to="/login" style={styles.loginLink}>
                        <button style={styles.loginBtn}>Login</button>
                    </NavLink>
                ) : (
                    <button style={styles.loginBtnDisabled} disabled>
                        Please wait, server is starting{dots}
                    </button>
                )}

                <p style={styles.hint}>
                    {serverReady
                        ? "You're all set. Click Login to continue."
                        : "Our server wakes up on first visit. This takes about 30–60 seconds."}
                </p>
            </div>
        </div>
    );
}

// ── Inline styles ──────────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
    },
    card: {
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        padding: "48px 40px",
        maxWidth: "420px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        color: "#f1f5f9",
    },
    crest: {
        fontSize: "48px",
        marginBottom: "12px",
        color: "#f8c843",
        textShadow: "0 0 20px rgba(248,200,67,0.5)",
    },
    title: {
        fontSize: "1.75rem",
        fontWeight: "bold",
        margin: "0 0 6px",
        letterSpacing: "0.04em",
        color: "#f8f8f8",
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#94a3b8",
        margin: "0 0 24px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },
    divider: {
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        margin: "0 0 28px",
    },
    statusRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "24px",
    },
    statusDot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        display: "inline-block",
        flexShrink: 0,
        transition: "background 0.4s, box-shadow 0.4s",
    },
    statusText: {
        fontSize: "0.9rem",
        color: "#cbd5e1",
        minWidth: "220px",
        textAlign: "left",
    },
    loginLink: {
        textDecoration: "none",
        display: "block",
    },
    loginBtn: {
        width: "100%",
        padding: "14px",
        fontSize: "1rem",
        fontFamily: "inherit",
        fontWeight: "bold",
        letterSpacing: "0.06em",
        background: "linear-gradient(135deg, #f8c843, #e0a020)",
        color: "#0f172a",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "opacity 0.2s, transform 0.15s",
        boxShadow: "0 4px 20px rgba(248,200,67,0.35)",
    },
    loginBtnDisabled: {
        width: "100%",
        padding: "14px",
        fontSize: "0.9rem",
        fontFamily: "inherit",
        background: "rgba(255,255,255,0.07)",
        color: "#64748b",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        cursor: "not-allowed",
        letterSpacing: "0.03em",
    },
    hint: {
        marginTop: "16px",
        fontSize: "0.8rem",
        color: "#475569",
        lineHeight: 1.5,
    },
};
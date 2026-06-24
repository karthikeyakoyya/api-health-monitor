import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API = "https://api-health-monitor-backend-wodm.onrender.com";

const SEVERITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e"
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0f1117", border: "1px solid #7c3aed", borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ color: "#a78bfa", fontSize: 18, fontWeight: 700 }}>{payload[0].value}ms</div>
        <div style={{ color: "#64748b", fontSize: 11 }}>response time</div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [endpoints, setEndpoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStatus();
    fetchAnomalies();
    const interval = setInterval(() => {
      fetchStatus();
      fetchAnomalies();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) fetchHistory(selected);
  }, [selected]);

  const fetchStatus = async () => {
    const res = await fetch(`${API}/api/endpoints/status`);
    const data = await res.json();
    setEndpoints(data);
    setLastUpdated(new Date().toLocaleTimeString());
    if (!selected && data.length > 0) setSelected(data[0].id);
  };

  const fetchHistory = async (id) => {
    const res = await fetch(`${API}/api/endpoints/${id}/history`);
    const data = await res.json();
    setHistory(data.reverse().map((d, i) => ({ i, ms: d.response_time, ok: d.is_success })));
  };

  const fetchAnomalies = async () => {
    const res = await fetch(`${API}/api/anomalies`);
    setAnomalies(await res.json());
  };

  const upCount = endpoints.filter(e => e.is_up).length;
  const downCount = endpoints.filter(e => !e.is_up).length;
  const selectedEp = endpoints.find(e => e.id === selected);

  return (
    <div style={{ background: "#080b14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Segoe UI', monospace" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(90deg, #0f0c29, #302b63, #24243e)", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e2130" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
            <span style={{ color: "#7c3aed" }}>⚡</span> API Health Monitor
          </h1>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Real-time observability dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{upCount}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>ONLINE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>{downCount}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>OFFLINE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316" }}>{anomalies.length}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>ALERTS</div>
          </div>
          <div style={{ fontSize: 11, color: "#475569", borderLeft: "1px solid #1e2130", paddingLeft: 20 }}>
            Updated<br /><span style={{ color: "#7c3aed" }}>{lastUpdated}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px,1fr))", gap: 14, marginBottom: 24 }}>
          {endpoints.map(ep => (
            <div key={ep.id} onClick={() => setSelected(ep.id)}
              style={{
                background: selected === ep.id
                  ? "linear-gradient(135deg, #1e1b4b, #2d1b69)"
                  : "linear-gradient(135deg, #0f1117, #1a1f2e)",
                border: `1px solid ${selected === ep.id ? "#7c3aed" : ep.is_up ? "#16a34a33" : "#dc262633"}`,
                borderTop: `3px solid ${ep.is_up ? "#22c55e" : "#ef4444"}`,
                borderRadius: 12, padding: 18, cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: selected === ep.id ? "0 0 20px #7c3aed33" : "none"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#cbd5e1" }}>{ep.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: ep.is_up ? "#22c55e" : "#ef4444",
                    boxShadow: `0 0 6px ${ep.is_up ? "#22c55e" : "#ef4444"}`,
                    animation: !ep.is_up ? "pulse 1s infinite" : "none"
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: ep.is_up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: ep.is_up ? "#22c55e" : "#ef4444"
                  }}>{ep.is_up ? "UP" : "DOWN"}</span>
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>
                {ep.response_time ?? "—"}<span style={{ fontSize: 13, fontWeight: 400, color: "#64748b" }}>ms</span>
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>avg {ep.avg_response_time ?? "—"}ms · HTTP {ep.status_code ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Chart + Anomalies */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>

          {/* Chart */}
          <div style={{ background: "linear-gradient(135deg, #0f1117, #1a1f2e)", border: "1px solid #1e2748", borderRadius: 12, padding: 24 }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 1 }}>RESPONSE TIME HISTORY</div>
                {selectedEp && <div style={{ fontSize: 13, color: "#a78bfa", marginTop: 2 }}>{selectedEp.name}</div>}
              </div>
              {selectedEp && (
                <div style={{ fontSize: 11, color: selectedEp.is_up ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                  {selectedEp.is_up ? "● ONLINE" : "● OFFLINE"}
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2748" />
                <XAxis dataKey="i" hide />
                <YAxis stroke="#334155" fontSize={11} tickFormatter={v => `${v}ms`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ms" stroke="#7c3aed" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: "#a78bfa" }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {endpoints.map(ep => (
                <button key={ep.id} onClick={() => setSelected(ep.id)}
                  style={{
                    background: selected === ep.id ? "#7c3aed" : "#1e2130",
                    border: "none", borderRadius: 6, padding: "4px 10px",
                    color: selected === ep.id ? "white" : "#64748b",
                    fontSize: 11, cursor: "pointer", fontWeight: selected === ep.id ? 700 : 400
                  }}>{ep.name}</button>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          <div style={{ background: "linear-gradient(135deg, #0f1117, #1a1f2e)", border: "1px solid #1e2748", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 1 }}>ANOMALIES</div>
              {anomalies.length > 0 && (
                <span style={{ background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                  {anomalies.length}
                </span>
              )}
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {anomalies.length === 0 ? (
                <div style={{ color: "#22c55e", textAlign: "center", padding: 40, fontSize: 13 }}>✅ All systems normal</div>
              ) : anomalies.map(a => (
                <div key={a.id} style={{ borderBottom: "1px solid #1e2748", padding: "12px 0" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                      background: `${SEVERITY_COLORS[a.severity]}22`,
                      color: SEVERITY_COLORS[a.severity]
                    }}>{a.severity}</span>
                    <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>{a.endpoint_name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.description}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>
                    {new Date(a.detected_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
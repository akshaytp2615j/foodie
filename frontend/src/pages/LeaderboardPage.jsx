import React, { useState, useEffect, useContext } from "react";
import { AuthContext, API_URL } from "../context/AuthContext";
import { Trophy, Award, Medal, Leaf, UtensilsCrossed } from "lucide-react";

const LeaderboardPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { authState } = authContext;
  const { token } = authState;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("monthly");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLeaderboard();
    }
  }, [token]);

  if (loading || !data) {
    return (
      <div className="flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "15px" }}>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #e5e7eb",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6b7280", fontWeight: 500 }}>Loading leaderboards...</p>
      </div>
    );
  }

  const restaurants = activeTab === "monthly" ? data.top_restaurants_monthly : data.top_restaurants_all_time;
  const ngos = activeTab === "monthly" ? data.top_ngos_monthly : data.top_ngos_all_time;

  const renderRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy size={20} color="#d97706" />;
      case 1:
        return <Award size={20} color="#6b7280" />;
      case 2:
        return <Medal size={20} color="#b45309" />;
      default:
        return <span style={{ fontWeight: "bold", color: "#6b7280" }}>{index + 1}</span>;
    }
  };

  const getRankClass = (index) => {
    if (index === 0) return "rank-1";
    if (index === 1) return "rank-2";
    if (index === 2) return "rank-3";
    return "";
  };

  return (
    <main className="bg-gray-50" style={{ paddingTop: "120px", paddingBottom: "80px", minHeight: "80vh" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>Community Leaderboards</h1>
          <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "1.1rem", maxWidth: "600px", margin: "8px auto 0" }}>
            Celebrating the incredible impact of our restaurant and NGO partners.
          </p>
        </div>

        <div className="leaderboard-tabs">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`leaderboard-tab-btn ${activeTab === "monthly" ? "active" : ""}`}
          >
            {data.current_month_name} Leaders
          </button>
          <button
            onClick={() => setActiveTab("all-time")}
            className={`leaderboard-tab-btn ${activeTab === "all-time" ? "active" : ""}`}
          >
            All-Time Champions
          </button>
        </div>

        <div className="leaderboard-grid">
          <div className="card">
            <h2 className="dashboard-section-title" style={{ justifyContent: "flex-start" }}>
              <Leaf size={26} color="#10b981" />
              Top Restaurants <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>(servings saved)</span>
            </h2>
            
            {restaurants.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>
                No donations recorded in this period yet.
              </p>
            ) : (
              <ol className="leaderboard-list">
                {restaurants.map((r, idx) => (
                  <li key={idx} className={`leaderboard-item ${getRankClass(idx)}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "30px", display: "flex", justifyContent: "center" }}>
                        {renderRankIcon(idx)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{r.rest__name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: "#047857" }}>{r.total_qty} served</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="card">
            <h2 className="dashboard-section-title" style={{ justifyContent: "flex-start" }}>
              <UtensilsCrossed size={26} color="#3b82f6" />
              Top NGOs <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>(meals served)</span>
            </h2>

            {ngos.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>
                No pickups recorded in this period yet.
              </p>
            ) : (
              <ol className="leaderboard-list">
                {ngos.map((n, idx) => (
                  <li key={idx} className={`leaderboard-item ${getRankClass(idx)}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "30px", display: "flex", justifyContent: "center" }}>
                        {renderRankIcon(idx)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{n.claimed_ngo__name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{n.total_qty} meals</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LeaderboardPage;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API_URL } from "../context/AuthContext";
import {
  PlusCircle,
  Edit,
  Trash2,
  HeartHandshake,
  Calendar,
  Recycle,
  MapPin,
  ShoppingBasket,
  Truck,
  Building,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const DashboardPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { authState } = authContext;
  const { user, token, isAuthenticated, loading: authLoading } = authState;
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [dish, setDish] = useState("");
  const [qty, setQty] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/donations/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      } else {
        triggerAlert("error", data.error || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setDish("");
    setQty("");
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
    setPickupTime(localISOTime);
    setModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setDish(order.dish);
    setQty(order.qty.toString());
    const date = new Date(order.pickupDatetime);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    setPickupTime(localISOTime);
    setModalOpen(true);
  };

  const handleSaveDonation = async (e) => {
    e.preventDefault();
    if (!dish || !qty || !pickupTime) {
      triggerAlert("error", "Please fill in all listing fields");
      return;
    }

    if (new Date(pickupTime) <= new Date()) {
      triggerAlert("error", "Pickup & Expiry time must be in the future");
      return;
    }

    try {
      const url = editingOrder ? `${API_URL}/donations/${editingOrder._id}` : `${API_URL}/donations`;
      const method = editingOrder ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dish, qty, pickupTime }),
      });
      const data = await res.json();

      if (res.ok) {
        triggerAlert("success", editingOrder ? "Listing updated successfully!" : "Listing created successfully!");
        setModalOpen(false);
        fetchDashboard();
      } else {
        triggerAlert("error", data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Error saving listing");
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`${API_URL}/donations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        triggerAlert("success", "Listing deleted");
        fetchDashboard();
      } else {
        const data = await res.json();
        triggerAlert("error", data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Error deleting listing");
    }
  };

  const handleClaimDonation = async (id) => {
    try {
      const res = await fetch(`${API_URL}/donations/${id}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("success", "Donation claimed successfully!");
        fetchDashboard();
      } else {
        triggerAlert("error", data.error || "Claim failed");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Error claiming donation");
    }
  };

  const handleCollectDonation = async (id) => {
    try {
      const res = await fetch(`${API_URL}/donations/${id}/collect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("success", "Donation marked as completed!");
        fetchDashboard();
      } else {
        triggerAlert("error", data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Error updating status");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (authLoading || loading || !user || !dashboardData) {
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
        <p style={{ color: "#6b7280", fontWeight: 500 }}>Loading your dashboard...</p>
      </div>
    );
  }

  const isRest = user.type === "Rest";

  return (
    <div className="container dashboard-container">
      {alert && (
        <div
          style={{
            position: "fixed",
            top: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: alert.type === "success" ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${alert.type === "success" ? "#34d399" : "#fca5a5"}`,
            color: alert.type === "success" ? "#065f46" : "#b91c1c",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "calc(100% - 40px)",
          }}
        >
          {alert.type === "success" ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
          <span style={{ fontWeight: 500 }}>{alert.message}</span>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome, {isRest ? user.rest?.name : user.ngo?.name}!
        </h1>
        <p style={{ color: "#6b7280", marginTop: "5px" }}>
          {isRest
            ? "Manage your listings and view impact statistics."
            : "Claim surplus food listings and manage active collections."}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* LEFT COLUMN: ACTIVE LISTINGS & HISTORY */}
        <div>
          {isRest ? (
            <>
              <div style={{ marginBottom: "25px" }}>
                <button onClick={handleOpenAddModal} className="btn btn-green flex-center" style={{ gap: "10px" }}>
                  <PlusCircle size={18} />
                  Add New Food Donation
                </button>
              </div>

              {/* ACTIVE DONATIONS */}
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">
                  <HeartHandshake size={22} color="#10b981" />
                  Active Donations
                </h2>
                <div className="listings-list">
                  {dashboardData.activeDonations.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
                      No active listings. Create a new donation to begin.
                    </p>
                  ) : (
                    dashboardData.activeDonations.map((d) => (
                      <div
                        key={d._id}
                        className={`listing-item ${d.status === "Clmd" ? "listing-item-claimed" : ""}`}
                      >
                        <div>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                            {d.dish} <span style={{ color: "#6b7280", fontWeight: 500 }}>(Serves {d.qty})</span>
                          </h3>
                          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
                            Pickup by: {formatDate(d.pickupDatetime)}
                          </p>
                          {d.status === "Clmd" && d.claimedNgo && (
                            <p style={{ fontSize: "0.85rem", color: "#047857", fontWeight: 600, marginTop: "4px" }}>
                              Claimed by NGO: {d.claimedNgo.name}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {d.status === "Ld" ? (
                            <>
                              <span className="badge badge-amber">Listed</span>
                              <button
                                onClick={() => handleOpenEditModal(d)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteDonation(d._id)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="badge badge-green">Claimed</span>
                              <button onClick={() => handleCollectDonation(d._id)} className="btn btn-green" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                                Mark Picked Up
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DONATION HISTORY */}
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">
                  <Calendar size={22} color="#10b981" />
                  Your Donation History
                </h2>
                <div className="table-container">
                  {dashboardData.donationHistory.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No donation history yet.</p>
                  ) : (
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Food Item</th>
                          <th>Qty</th>
                          <th>Claimed By</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.donationHistory.map((d) => (
                          <tr key={d._id}>
                            <td>{new Date(d.pickupDatetime).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 600 }}>{d.dish}</td>
                            <td>{d.qty} servings</td>
                            <td>{d.claimedNgo?.name || "N/A"}</td>
                            <td style={{ color: d.status === "Wstd" ? "#ef4444" : "#047857", fontWeight: 600 }}>
                              {d.status === "Wstd" ? "Expired / Wasted" : "Collected"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* NGO LAYOUT */
            <>
              {/* AVAILABLE LISTINGS */}
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">
                  <ShoppingBasket size={22} color="#f59e0b" />
                  Available Donations Near You
                </h2>
                <div className="listings-list">
                  {dashboardData.availableDonations.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
                      No available listings near you right now. Check back soon!
                    </p>
                  ) : (
                    dashboardData.availableDonations.map((d) => (
                      <div
                        key={d.id}
                        className="listing-item"
                        style={{ flexDirection: "column", alignItems: "stretch", gap: "15px" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <p style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 700 }}>{d.rest.name}</p>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "2px" }}>
                              {d.dish} <span style={{ color: "#6b7280", fontWeight: 500 }}>(Serves {d.qty})</span>
                            </h3>
                            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "6px" }}>
                              <strong>Pickup by:</strong> {formatDate(d.pickupDatetime)} <br />
                              <strong>Address:</strong> {d.rest.location}
                            </p>
                          </div>

                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.9rem", fontWeight: "bold" }}>
                              <MapPin size={16} />
                              {d.distance} km away
                            </span>
                            <button onClick={() => handleClaimDonation(d.id)} className="btn btn-green" style={{ padding: "8px 20px" }}>
                              Claim
                            </button>
                          </div>
                        </div>

                        {d.rest.latitude && d.rest.longitude && (
                          <iframe
                            height="200"
                            style={{ border: 0, borderRadius: "8px", width: "100%" }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${d.rest.latitude},${d.rest.longitude}&hl=es;z=14&output=embed`}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ACTIVE NGO PICKUPS */}
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">
                  <Truck size={22} color="#f59e0b" />
                  Your Active Pickups
                </h2>
                <div className="listings-list">
                  {dashboardData.activePickups.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No active pickups claimed.</p>
                  ) : (
                    dashboardData.activePickups.map((d) => (
                      <div key={d._id} className="listing-item listing-item-active-pickup">
                        <div>
                          <p style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 700 }}>{d.rest.name}</p>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                            {d.dish} <span style={{ color: "#6b7280", fontWeight: 500 }}>(Serves {d.qty})</span>
                          </h3>
                          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
                            Pickup by: {formatDate(d.pickupDatetime)} <br />
                            Address: {d.rest.location}
                          </p>
                        </div>

                        <div>
                          <button onClick={() => handleCollectDonation(d._id)} className="btn btn-amber" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: METRIC WIDGETS */}
        <div className="metrics-sidebar">
          {isRest ? (
            <>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#d1fae5", color: "#059669" }}>
                  <HeartHandshake size={24} />
                </div>
                <div className="metric-val metric-val-green">{dashboardData.metrics.totalMealsDonated}</div>
                <div className="metric-label">Total Meals Donated</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <Calendar size={24} />
                </div>
                <div className="metric-val metric-val-amber">{dashboardData.metrics.donationsThisMonth}</div>
                <div className="metric-label">Donations This Month</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  <Recycle size={24} />
                </div>
                <div className="metric-val metric-val-blue">~{dashboardData.metrics.wasteReduced} kg</div>
                <div className="metric-label">Food Waste Reduced</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>
                  <AlertTriangle size={24} />
                </div>
                <div className="metric-val" style={{ color: "#ef4444" }}>{dashboardData.metrics.totalMealsWasted || 0}</div>
                <div className="metric-label">Meals Expired (Wasted)</div>
              </div>
            </>
          ) : (
            <>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#d1fae5", color: "#059669" }}>
                  <ShoppingBasket size={24} />
                </div>
                <div className="metric-val metric-val-green">{dashboardData.metrics.totalMealsReceived}</div>
                <div className="metric-label">Total Meals Received</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <Truck size={24} />
                </div>
                <div className="metric-val metric-val-amber">{dashboardData.metrics.pickupsThisMonth}</div>
                <div className="metric-label">Pickups This Month</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  <Building size={24} />
                </div>
                <div className="metric-val metric-val-blue">{dashboardData.metrics.activeRestaurantPartners}</div>
                <div className="metric-label">Active Restaurant Partners</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD / EDIT DONATION MODAL (RESTAURANTS ONLY) */}
      {modalOpen && isRest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setModalOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "20px" }}>
              {editingOrder ? "Edit Surplus Listing" : "Add a New Donation"}
            </h2>

            <form onSubmit={handleSaveDonation}>
              <div className="form-group">
                <label className="form-label" htmlFor="food-name">
                  Food Name
                </label>
                <input
                  id="food-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vegetable Biryani, Dal Makhani"
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantity">
                  Quantity (Servings)
                </label>
                <input
                  id="quantity"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 20"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pickup-time">
                  Pickup & Expiry By (Date and Time)
                </label>
                <input
                  id="pickup-time"
                  type="datetime-local"
                  className="form-input"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>
                  Select the final date and time for pickup.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-green">
                  {editingOrder ? "Update Listing" : "List Donation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

import React, { useContext, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RestaurantSignUpPage from "./pages/RestaurantSignUpPage";
import NGOSignUpPage from "./pages/NGOSignUpPage";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { LogOut, Trophy, User as UserIcon } from "lucide-react";

const App = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { authState, logout } = authContext;
  const { isAuthenticated, user } = authState;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (anchor) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="container header-container">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo" style={{ textDecoration: "none" }}>
            Foodie.
          </Link>

          <nav className="nav-links" style={{ display: mobileMenuOpen ? "flex" : undefined }}>
            <span onClick={() => handleNavClick("how-it-works")} className="nav-link" style={{ cursor: "pointer" }}>
              How It Works
            </span>
            <span onClick={() => handleNavClick("impact")} className="nav-link" style={{ cursor: "pointer" }}>
              Our Impact
            </span>
            <span onClick={() => handleNavClick("testimonials")} className="nav-link" style={{ cursor: "pointer" }}>
              Testimonials
            </span>
          </nav>

          <div className="auth-buttons">
            {isAuthenticated && user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      marginTop: "10px",
                      width: "220px",
                      backgroundColor: "white",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                      padding: "8px 0",
                      zIndex: 1010,
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }}>Signed in as</p>
                      <p style={{ fontSize: "0.9rem", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.type === "Rest" ? user.rest?.name : user.ngo?.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        color: "#374151",
                        textDecoration: "none",
                      }}
                      className="nav-link-dropdown"
                    >
                      <UserIcon size={16} />
                      Dashboard
                    </Link>

                    <Link
                      to="/leaderboard"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        color: "#374151",
                        textDecoration: "none",
                      }}
                      className="nav-link-dropdown"
                    >
                      <Trophy size={16} />
                      Leaderboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        borderTop: "1px solid #e5e7eb",
                        marginTop: "4px",
                      }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontWeight: 600 }}>
                  Login
                </Link>
                <Link to="/signup/restaurant" className="btn btn-green" style={{ padding: "0.5rem 1.25rem", fontWeight: 700 }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN ROUTES */}
      <main style={{ minHeight: "calc(100vh - 80px)" }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/restaurant" element={<RestaurantSignUpPage />} />
          <Route path="/signup/ngo" element={<NGOSignUpPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">Foodie.</div>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                Reducing food waste and fighting hunger, together. Connecting surplus food in India with local NGOs.
              </p>
            </div>
            <div>
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">About Us</Link></li>
                <li><Link to="/" className="footer-link">Contact</Link></li>
                <li><Link to="/" className="footer-link">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">Privacy Policy</Link></li>
                <li><Link to="/" className="footer-link">Terms of Service</Link></li>
                <li><Link to="/" className="footer-link">Food Safety Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Follow Us</h4>
              <ul className="footer-links" style={{ flexDirection: "row", gap: "15px" }}>
                <li><a href="#" className="footer-link">Twitter</a></li>
                <li><a href="#" className="footer-link">Instagram</a></li>
                <li><a href="#" className="footer-link">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Foodie Initiative. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

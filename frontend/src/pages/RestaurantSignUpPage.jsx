import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

const RestaurantSignUpPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { registerRestaurant, authState, error, setError } = authContext;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fssai, setFssai] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const addressInputRef = useRef(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authState.isAuthenticated, navigate]);

  useEffect(() => {
    setError(null);
  }, [setError]);

  // Initialize Google Maps Places Autocomplete on the standard input field
  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !addressInputRef.current) return;

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ["geocode", "establishment"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          
          if (place.formatted_address) {
            setAddress(place.formatted_address);
          } else if (place.name) {
            setAddress(place.name);
          }
          
          if (place.geometry && place.geometry.location) {
            setLatitude(place.geometry.location.lat());
            setLongitude(place.geometry.location.lng());
          } else {
            // Assign safe fallback coordinates if geometry is not provided
            setLatitude(12.9716);
            setLongitude(77.5946);
          }
        });
      } catch (err) {
        console.error("Error attaching Google Maps Autocomplete:", err);
      }
    };

    const timeout = setTimeout(initAutocomplete, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!address) {
      setLocalError("Please enter a valid address");
      return;
    }

    // Set default coordinates if not already set by Google autocomplete selection
    const finalLat = latitude !== null ? latitude : 12.9716;
    const finalLng = longitude !== null ? longitude : 77.5946;

    setSubmitting(true);
    try {
      await registerRestaurant({
        "restaurant-name": name,
        addr: address,
        latitude: finalLat,
        longitude: finalLng,
        email,
        phone,
        fssai,
        password,
        "confirm-password": confirmPassword,
      });
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>
            Join Foodie as a <span style={{ color: "#10b981" }}>Restaurant Partner</span>
          </h2>
          <p style={{ color: "#6b7280", marginTop: "5px" }}>
            Start turning your surplus food into a community blessing.
          </p>
        </div>

        {(localError || error) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={20} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="rest-name">
              Restaurant Name
            </label>
            <input
              id="rest-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address-input">
              Full Address
            </label>
            <input
              id="address-input"
              ref={addressInputRef}
              type="text"
              className="form-input"
              placeholder="Start typing your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fssai">
              FSSAI License Number
            </label>
            <input
              id="fssai"
              type="text"
              className="form-input"
              value={fssai}
              onChange={(e) => setFssai(e.target.value)}
              required
            />
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>
              A valid FSSAI license is required for food donation in India.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-green"
            style={{ width: "100%", padding: "12px", marginTop: "15px" }}
            disabled={submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem", color: "#6b7280" }}>
          <p>
            <Link to="/signup/ngo" style={{ color: "#f59e0b", fontWeight: 600 }}>
              Sign up as an NGO instead
            </Link>
          </p>
          <p style={{ marginTop: "8px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#10b981", fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignUpPage;

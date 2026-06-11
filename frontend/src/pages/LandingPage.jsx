import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Bell, Truck } from "lucide-react";

const LandingPage = () => {
  // Typewriter effect state
  const [typedText, setTypedText] = useState("");
  const targetWord = "Support.";
  
  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      if (!isDeleting) {
        setTypedText(targetWord.substring(0, index + 1));
        index++;
        if (index === targetWord.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2000);
        } else {
          timer = setTimeout(tick, 150);
        }
      } else {
        setTypedText(targetWord.substring(0, index - 1));
        index--;
        if (index === 0) {
          isDeleting = false;
          timer = setTimeout(tick, 500);
        } else {
          timer = setTimeout(tick, 75);
        }
      }
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  // Testimonials Slider State
  const testimonials = [
    {
      quote: "Foodie is a game-changer. We've reduced our daily waste significantly and our staff feels proud to be part of this initiative. It's incredibly simple to use.",
      author: "Priya Sharma",
      role: "Owner, The Curry Leaf, Bengaluru",
      color: "green",
    },
    {
      quote: "As an NGO, timely information is everything. The instant alerts from Foodie help us plan our pickups efficiently and feed more people every night. We are grateful.",
      author: "Rajesh Kumar",
      role: "Coordinator, Annapurna Foundation, Delhi",
      color: "amber",
    },
    {
      quote: "The platform is beautifully designed and very intuitive. Listing our surplus paneer and naan at the end of the day takes just a minute. It's a win-win.",
      author: "Aarav Singh",
      role: "Head Chef, Tandoori Nights, Mumbai",
      color: "green",
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(sliderInterval);
  }, [testimonials.length]);

  // Count up impact stats state
  const [meals, setMeals] = useState(0);
  const [rests, setRests] = useState(0);
  const [ngos, setNgos] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const interval = 30;
    const steps = duration / interval;

    const targetMeals = 25000;
    const targetRests = 350;
    const targetNgos = 80;

    let currentStep = 0;

    const counterTimer = setInterval(() => {
      currentStep++;
      setMeals(Math.min(Math.ceil((targetMeals / steps) * currentStep), targetMeals));
      setRests(Math.min(Math.ceil((targetRests / steps) * currentStep), targetRests));
      setNgos(Math.min(Math.ceil((targetNgos / steps) * currentStep), targetNgos));

      if (currentStep >= steps) {
        clearInterval(counterTimer);
      }
    }, interval);

    return () => clearInterval(counterTimer);
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Turn Surplus into{" "}
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span className="typewriter-text">{typedText}</span>
            </span>
          </h1>
          <p className="hero-subtitle">
            Foodie connects restaurants in India with surplus food to NGOs who feed the hungry.
            Reduce waste, build community, and make a tangible difference, one meal at a time.
          </p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/signup/restaurant" className="btn btn-large btn-green">
              I'm a Restaurant
            </Link>
            <Link to="/signup/ngo" className="btn btn-large btn-amber">
              We are an NGO
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ backgroundColor: "white", padding: "100px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "15px" }}>
              Making an Impact is <span className="glitter-text">Easy</span>
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
              Our streamlined process makes food donation simple and efficient for everyone involved.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div className="card-icon card-icon-green">
                <ClipboardList size={30} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>1. List Your Surplus</h3>
              <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                Restaurants use our simple form to list leftover food in under 60 seconds. Specify the dish, quantity, and pickup time.
              </p>
            </div>

            <div className="card">
              <div className="card-icon card-icon-amber">
                <Bell size={30} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>2. NGOs Get Notified</h3>
              <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                Nearby, verified NGOs receive real-time alerts. They can view details and claim the donation with a single click.
              </p>
            </div>

            <div className="card">
              <div className="card-icon card-icon-blue">
                <Truck size={30} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>3. Coordinate Pickup</h3>
              <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                The NGO arranges for a swift pickup. The food reaches those who need it most, fresh and ready to serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR COLLECTIVE IMPACT */}
      <section id="impact" style={{ backgroundColor: "#111827", color: "white", padding: "100px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "15px" }}>
              Our Collective <span className="glitter-text">Impact</span>
            </h2>
            <p style={{ color: "#9ca3af", maxWidth: "600px", margin: "0 auto" }}>
              Together, we are fighting hunger and reducing food waste across India.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "40px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "4rem", fontWeight: 800, color: "#34d399", margin: 0 }}>
                {meals.toLocaleString()}+
              </p>
              <p style={{ fontSize: "1.25rem", color: "#9ca3af", marginTop: "10px" }}>Meals Donated</p>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "4rem", fontWeight: 800, color: "#fbbf24", margin: 0 }}>
                {rests.toLocaleString()}+
              </p>
              <p style={{ fontSize: "1.25rem", color: "#9ca3af", marginTop: "10px" }}>Partner Restaurants</p>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "4rem", fontWeight: 800, color: "#60a5fa", margin: 0 }}>
                {ngos.toLocaleString()}+
              </p>
              <p style={{ fontSize: "1.25rem", color: "#9ca3af", marginTop: "10px" }}>NGOs Onboarded</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ backgroundColor: "white", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "15px" }}>What Our Partners Say</h2>
            <p style={{ color: "#6b7280" }}>Real stories from the heart of our community.</p>
          </div>

          <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", minHeight: "220px" }}>
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: idx === activeTestimonial ? "block" : "none",
                  backgroundColor: "#f9fafb",
                  padding: "40px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  border: "1px solid #e5e7eb",
                  transition: "opacity 0.5s ease-in-out",
                }}
              >
                <p style={{ fontSize: "1.2rem", fontStyle: "italic", color: "#374151", marginBottom: "20px", lineHeight: "1.7" }}>
                  "{t.quote}"
                </p>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold", color: t.color === "green" ? "#047857" : "#b45309", fontSize: "1.1rem" }}>
                    {t.author}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>{t.role}</p>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px" }}>
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  style={{
                    width: idx === activeTestimonial ? "24px" : "10px",
                    height: "10px",
                    borderRadius: "50px",
                    backgroundColor: idx === activeTestimonial ? "#10b981" : "#d1d5db",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

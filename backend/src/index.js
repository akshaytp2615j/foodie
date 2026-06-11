const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, NGO, Restaurant, Order } = require("./models");
const { authMiddleware } = require("./middleware");

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/savr";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_savr_jwt_key_123!";

// Middleware
app.use(cors());
app.use(express.json());

// URL Rewrite Middleware: Redirects requests missing '/api' prefix to their correct endpoint
app.use((req, res, next) => {
  if (req.url.startsWith("/auth") || req.url.startsWith("/donations") || req.url.startsWith("/leaderboard")) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Root endpoints for deployment health checks
app.get("/", (req, res) => {
  res.json({ message: "Foodie API is running successfully!" });
});
app.get("/api", (req, res) => {
  res.json({ message: "Foodie API endpoints are available under /api" });
});

// Helper: Haversine Geodetic Distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// 1. Restaurant Sign Up
app.post("/api/auth/register-restaurant", async (req, res) => {
  const name = req.body.name || req.body["restaurant-name"];
  const location = req.body.location || req.body.addr;
  const phone = req.body.phone || req.body["phone-number"];
  const { latitude, longitude, email, fssai, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const rest = new Restaurant({
      name,
      location,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      email,
      phone: parseInt(phone),
      fssai: parseInt(fssai),
    });
    await rest.save();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      passwordHash,
      type: "Rest",
      rest: rest._id,
    });
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: user.type,
        restId: rest._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        rest,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error during registration: " + err.message });
  }
});

// 2. NGO Sign Up
app.post("/api/auth/register-ngo", async (req, res) => {
  const name = req.body.name || req.body["ngo-name"];
  const location = req.body.location || req.body.addr;
  const { latitude, longitude, email, ngoid, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const ngo = new NGO({
      name,
      location,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      email,
      ngoid: parseInt(ngoid),
    });
    await ngo.save();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      passwordHash,
      type: "NGO",
      ngo: ngo._id,
    });
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: user.type,
        ngoId: ngo._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        ngo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error during registration: " + err.message });
  }
});

// 3. Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("rest").populate("ngo");
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      type: user.type,
    };

    if (user.type === "Rest" && user.rest) {
      payload.restId = user.rest._id;
    } else if (user.type === "NGO" && user.ngo) {
      payload.ngoId = user.ngo._id;
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        rest: user.rest,
        ngo: user.ngo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// 4. Get Current User Details
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(req.user.userId).populate("rest").populate("ngo");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        rest: user.rest,
        ngo: user.ngo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error fetching session" });
  }
});

// ----------------------------------------------------
// DONATIONS / DASHBOARD ROUTES
// ----------------------------------------------------

// Get Dashboard Data
app.get("/api/donations/dashboard", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (req.user.type === "Rest") {
      const restId = req.user.restId;
      if (!restId) return res.status(400).json({ error: "Restaurant profile missing" });

      const activeDonations = await Order.find({
        rest: restId,
        status: { $in: ["Ld", "Clmd"] },
      }).populate("claimedNgo");

      const donationHistory = await Order.find({
        rest: restId,
        status: { $in: ["Clcd", "Wstd"] },
      }).populate("claimedNgo").sort({ pickupDatetime: -1 });

      const totalMealsDonated = await Order.countDocuments({ rest: restId, status: "Clcd" });
      const totalMealsWasted = await Order.countDocuments({ rest: restId, status: "Wstd" });
      const donationsThisMonth = await Order.countDocuments({
        rest: restId,
        status: "Clcd",
        pickupDatetime: { $gte: startOfMonth },
      });
      const wasteReduced = totalMealsDonated * 10;

      return res.json({
        activeDonations,
        donationHistory,
        metrics: {
          totalMealsDonated,
          donationsThisMonth,
          wasteReduced,
          totalMealsWasted,
        },
      });
    } else {
      const ngoId = req.user.ngoId;
      if (!ngoId) return res.status(400).json({ error: "NGO profile missing" });

      const ngoProfile = await NGO.findById(ngoId);
      if (!ngoProfile) return res.status(404).json({ error: "NGO not found" });

      const availableRaw = await Order.find({ status: "Ld" }).populate("rest");

      const availableDonations = availableRaw.map((order) => {
        let distance = 0;
        if (
          order.rest &&
          order.rest.latitude !== undefined &&
          order.rest.longitude !== undefined &&
          ngoProfile.latitude !== undefined &&
          ngoProfile.longitude !== undefined
        ) {
          distance = haversineDistance(
            order.rest.latitude,
            order.rest.longitude,
            ngoProfile.latitude,
            ngoProfile.longitude
          );
        }
        return {
          id: order._id,
          dish: order.dish,
          qty: order.qty,
          pickupDatetime: order.pickupDatetime,
          status: order.status,
          rest: order.rest,
          distance: parseFloat(distance.toFixed(2)),
        };
      }).sort((a, b) => a.distance - b.distance);

      const activePickups = await Order.find({
        claimedNgo: ngoId,
        status: "Clmd",
      }).populate("rest");

      const totalMealsReceived = await Order.countDocuments({ claimedNgo: ngoId, status: "Clcd" });
      const pickupsThisMonth = await Order.countDocuments({
        claimedNgo: ngoId,
        status: "Clcd",
        pickupDatetime: { $gte: startOfMonth },
      });

      const distinctRest = await Order.distinct("rest", { claimedNgo: ngoId, status: "Clcd" });
      const activeRestaurantPartners = distinctRest.length;

      return res.json({
        availableDonations,
        activePickups,
        metrics: {
          totalMealsReceived,
          pickupsThisMonth,
          activeRestaurantPartners,
        },
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error fetching dashboard: " + err.message });
  }
});

// List New Food Donation
app.post("/api/donations", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.type !== "Rest") {
      return res.status(403).json({ error: "Only Restaurants can list food donations" });
    }

    const { dish, qty, pickupTime } = req.body;
    if (!dish || !qty || !pickupTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (new Date(pickupTime) <= new Date()) {
      return res.status(400).json({ error: "Pickup & Expiry time must be in the future" });
    }

    const order = new Order({
      dish,
      qty: parseInt(qty),
      rest: req.user.restId,
      pickupDatetime: new Date(pickupTime),
      status: "Ld",
    });

    await order.save();
    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error listing food donation" });
  }
});

// Update Food Donation
app.put("/api/donations/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.type !== "Rest") {
      return res.status(403).json({ error: "Only Restaurants can update listings" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.rest.toString() !== req.user.restId) {
      return res.status(403).json({ error: "Unauthorized access to other restaurant's order" });
    }

    const { dish, qty, pickupTime } = req.body;
    if (pickupTime && new Date(pickupTime) <= new Date()) {
      return res.status(400).json({ error: "Pickup & Expiry time must be in the future" });
    }

    if (dish) order.dish = dish;
    if (qty) order.qty = parseInt(qty);
    if (pickupTime) order.pickupDatetime = new Date(pickupTime);

    await order.save();
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error updating food donation" });
  }
});

// Delete Food Donation
app.delete("/api/donations/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.type !== "Rest") {
      return res.status(403).json({ error: "Only Restaurants can delete listings" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.rest.toString() !== req.user.restId) {
      return res.status(403).json({ error: "Unauthorized access to other restaurant's order" });
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error deleting food donation" });
  }
});

// Claim Food Donation (NGO only)
app.post("/api/donations/:id/claim", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.type !== "NGO") {
      return res.status(403).json({ error: "Only NGOs can claim food donations" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "Ld") {
      return res.status(400).json({ error: "This food donation is no longer available" });
    }

    order.claimedNgo = req.user.ngoId;
    order.status = "Clmd";
    await order.save();

    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error claiming food donation" });
  }
});

// Mark Collected / Picked Up
app.post("/api/donations/:id/collect", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const isOwnerRest = req.user && req.user.type === "Rest" && order.rest.toString() === req.user.restId;
    const isOwnerNgo = req.user && req.user.type === "NGO" && order.claimedNgo && order.claimedNgo.toString() === req.user.ngoId;

    if (!isOwnerRest && !isOwnerNgo) {
      return res.status(403).json({ error: "Unauthorized to update status of this order" });
    }

    order.status = "Clcd";
    await order.save();

    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error collecting food donation" });
  }
});

// ----------------------------------------------------
// LEADERBOARD ROUTE
// ----------------------------------------------------
app.get("/api/leaderboard", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // 1. Top Restaurants (All time)
    const topRestaurantsAllTime = await Order.aggregate([
      { $match: { status: "Clcd" } },
      { $lookup: { from: "restaurants", localField: "rest", foreignField: "_id", as: "restaurant" } },
      { $unwind: "$restaurant" },
      { $group: { _id: "$restaurant.name", total_qty: { $sum: "$qty" } } },
      { $sort: { total_qty: -1 } },
    ]);

    // 2. Top NGOs (All time)
    const topNgosAllTime = await Order.aggregate([
      { $match: { status: "Clcd" } },
      { $lookup: { from: "ngos", localField: "claimedNgo", foreignField: "_id", as: "ngo" } },
      { $unwind: "$ngo" },
      { $group: { _id: "$ngo.name", total_qty: { $sum: "$qty" } } },
      { $sort: { total_qty: -1 } },
    ]);

    // 3. Top Restaurants (Monthly)
    const topRestaurantsMonthly = await Order.aggregate([
      {
        $match: {
          status: "Clcd",
          pickupDatetime: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $lookup: { from: "restaurants", localField: "rest", foreignField: "_id", as: "restaurant" } },
      { $unwind: "$restaurant" },
      { $group: { _id: "$restaurant.name", total_qty: { $sum: "$qty" } } },
      { $sort: { total_qty: -1 } },
    ]);

    // 4. Top NGOs (Monthly)
    const topNgosMonthly = await Order.aggregate([
      {
        $match: {
          status: "Clcd",
          pickupDatetime: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $lookup: { from: "ngos", localField: "claimedNgo", foreignField: "_id", as: "ngo" } },
      { $unwind: "$ngo" },
      { $group: { _id: "$ngo.name", total_qty: { $sum: "$qty" } } },
      { $sort: { total_qty: -1 } },
    ]);

    const monthName = now.toLocaleString("default", { month: "long" });

    return res.json({
      current_month_name: monthName,
      top_restaurants_monthly: topRestaurantsMonthly.map((item) => ({ rest__name: item._id, total_qty: item.total_qty })),
      top_ngos_monthly: topNgosMonthly.map((item) => ({ claimed_ngo__name: item._id, total_qty: item.total_qty })),
      top_restaurants_all_time: topRestaurantsAllTime.map((item) => ({ rest__name: item._id, total_qty: item.total_qty })),
      top_ngos_all_time: topNgosAllTime.map((item) => ({ claimed_ngo__name: item._id, total_qty: item.total_qty })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error calculating leaderboard: " + err.message });
  }
});

// ----------------------------------------------------
// DATABASE CONNECTION & STARTUP
// ----------------------------------------------------

// Background job: Automatically mark expired food donations as wasted ('Wstd')
setInterval(async () => {
  try {
    const now = new Date();
    const result = await Order.updateMany(
      {
        status: { $in: ["Ld", "Clmd"] },
        pickupDatetime: { $lt: now },
      },
      {
        $set: { status: "Wstd" },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Auto-Expiry] Marked ${result.modifiedCount} expired food donations as wasted ('Wstd')`);
    }
  } catch (err) {
    console.error("Auto-expiry job error:", err);
  }
}, 30000); // Check every 30 seconds

// Catch-all route to return JSON instead of default Express HTML 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found. Make sure your API_URL configuration includes the '/api' prefix.` });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

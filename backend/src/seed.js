const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { User, NGO, Restaurant, Order } = require("./models");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/savr";

async function seed() {
  try {
    console.log("Connecting to MongoDB at", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    console.log("Clearing database...");
    await User.deleteMany({});
    await NGO.deleteMany({});
    await Restaurant.deleteMany({});
    await Order.deleteMany({});

    console.log("Creating password hashes...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    console.log("Creating Restaurants...");
    const rest1 = new Restaurant({
      name: "The Curry Leaf",
      location: "Indiranagar, Bengaluru, Karnataka, India",
      latitude: 12.971891,
      longitude: 77.641151,
      email: "curry@leaf.com",
      phone: 9876543210,
      fssai: 12345678901234,
    });
    await rest1.save();

    const rest2 = new Restaurant({
      name: "Tandoori Nights",
      location: "Andheri West, Mumbai, Maharashtra, India",
      latitude: 19.113646,
      longitude: 72.869733,
      email: "tandoori@nights.com",
      phone: 9876543211,
      fssai: 98765432109876,
    });
    await rest2.save();

    console.log("Creating NGOs...");
    const ngo1 = new NGO({
      name: "Annapurna Foundation",
      location: "Koramangala, Bengaluru, Karnataka, India",
      latitude: 12.935192,
      longitude: 77.62448,
      email: "anna@purna.org",
      ngoid: 56789,
    });
    await ngo1.save();

    const ngo2 = new NGO({
      name: "Feeding Hands",
      location: "Jayanagar, Bengaluru, Karnataka, India",
      latitude: 12.925006,
      longitude: 77.58976,
      email: "feeding@hands.org",
      ngoid: 98765,
    });
    await ngo2.save();

    console.log("Creating Users...");
    const userRest1 = new User({
      email: "curry@leaf.com",
      passwordHash,
      type: "Rest",
      rest: rest1._id,
    });
    await userRest1.save();

    const userRest2 = new User({
      email: "tandoori@nights.com",
      passwordHash,
      type: "Rest",
      rest: rest2._id,
    });
    await userRest2.save();

    const userNgo1 = new User({
      email: "anna@purna.org",
      passwordHash,
      type: "NGO",
      ngo: ngo1._id,
    });
    await userNgo1.save();

    const userNgo2 = new User({
      email: "feeding@hands.org",
      passwordHash,
      type: "NGO",
      ngo: ngo2._id,
    });
    await userNgo2.save();

    console.log("Creating Food Donations...");
    const now = new Date();

    const o1 = new Order({
      dish: "Vegetable Biryani",
      qty: 25,
      rest: rest1._id,
      pickupDatetime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: "Ld",
    });
    await o1.save();

    const o2 = new Order({
      dish: "Butter Chicken & Naan",
      qty: 15,
      rest: rest2._id,
      pickupDatetime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      status: "Ld",
    });
    await o2.save();

    const o3 = new Order({
      dish: "Dal Makhani & Roti",
      qty: 30,
      rest: rest1._id,
      pickupDatetime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      status: "Clmd",
      claimedNgo: ngo1._id,
    });
    await o3.save();

    const o4 = new Order({
      dish: "Paneer Masala & Jeera Rice",
      qty: 20,
      rest: rest1._id,
      pickupDatetime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: "Clcd",
      claimedNgo: ngo1._id,
    });
    await o4.save();

    const o5 = new Order({
      dish: "Idli Sambar Combo",
      qty: 40,
      rest: rest1._id,
      pickupDatetime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: "Clcd",
      claimedNgo: ngo2._id,
    });
    await o5.save();

    const o6 = new Order({
      dish: "Mix Vegetable Curry",
      qty: 18,
      rest: rest2._id,
      pickupDatetime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: "Clcd",
      claimedNgo: ngo1._id,
    });
    await o6.save();

    console.log("Seeding complete! Log in credentials for testing:");
    console.log("-----------------------------------------------");
    console.log("Restaurant 1: curry@leaf.com | password123");
    console.log("Restaurant 2: tandoori@nights.com | password123");
    console.log("NGO 1:        anna@purna.org | password123");
    console.log("NGO 2:        feeding@hands.org | password123");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();

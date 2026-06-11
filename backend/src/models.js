const mongoose = require("mongoose");
const { Schema } = mongoose;

// NGO Schema
const NGOSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    email: { type: String, required: true },
    ngoid: { type: Number, required: true },
    profile: { type: String },
  },
  { timestamps: true }
);

// Restaurant Schema
const RestaurantSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    fssai: { type: Number, required: true },
    profile: { type: String },
  },
  { timestamps: true }
);

// User Schema
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    type: { type: String, required: true, enum: ["NGO", "Rest"] },
    ngo: { type: Schema.Types.ObjectId, ref: "NGO" },
    rest: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  },
  { timestamps: true }
);

// Order Schema
const OrderSchema = new Schema(
  {
    dish: { type: String, required: true },
    qty: { type: Number, required: true },
    rest: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    pickupDatetime: { type: Date, required: true },
    status: { type: String, default: "Ld", enum: ["Ld", "Clmd", "Clcd", "Wstd"] },
    claimedNgo: { type: Schema.Types.ObjectId, ref: "NGO" },
  },
  { timestamps: true }
);

// Export Models
const NGO = mongoose.model("NGO", NGOSchema);
const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
const User = mongoose.model("User", UserSchema);
const Order = mongoose.model("Order", OrderSchema);

module.exports = {
  NGO,
  Restaurant,
  User,
  Order,
};

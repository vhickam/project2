const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const activitySchema = new Schema({
  title: String,
  description: String,
  category: String,
  date: Date,
  buddies: Array,
  owner: Schema.Types.ObjectId
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  contactInfo: {
    whatsapp: {
      type: String,
      default: undefined, // Store as undefined instead of empty string
      validate: {
        validator: function(v: string) {
          // Skip validation if undefined or empty string
          if (v == null || v === '') return true;
          return /^\+?[1-9]\d{9,14}$/.test(v);
        },
        message: 'Invalid WhatsApp number format (use +1234567890 or leave empty)'
      }
    },
    telegram: {
      type: String,
      default: undefined,
      validate: {
        validator: function(v: string) {
          // Skip validation if undefined or empty string
          if (v == null || v === '') return true;
          return /^\+?[1-9]\d{9,14}$/.test(v) || /^@[a-zA-Z0-9_]{5,32}$/.test(v);
        },
        message: 'Invalid Telegram format (use @username, +1234567890 or leave empty)'
      }
    },
    supportMessage: {
      type: String,
      default: undefined,
      maxlength: 500
    }
  },
}, { timestamps: true }); // Added timestamps for created/updated tracking

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
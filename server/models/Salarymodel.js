import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    period: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,  // format: YYYY-MM
    },

    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

salarySchema.pre("save", function (next) {
  this.netSalary = this.baseSalary + this.bonus + this.allowance - this.tax;
  next();
});

salarySchema.index({ employee: 1, period: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);
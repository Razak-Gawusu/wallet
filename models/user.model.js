const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        capitalize: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        capitalize: true,
        trim: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      maxLength: 50,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 13,
      match: [/\+233\d{9}/, "Please fill a valid phone number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A password field is required"],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "A password confirmation field is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password are not the same",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    photo: {
      type: String,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
      select: false,
    },
  },
  // {
  //   virtuals: {
  //     fullName: {
  //       get() {
  //         return this.name.first + " " + this.name.last;
  //       },
  //     },
  //   },
  // }

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  return token;
};

userSchema.virtual("fullName").get(function () {
  return this.name.first + " " + this.name.last;
});

const User = mongoose.model("User", userSchema);

function validateUser(data) {
  const schema = Joi.object({
    first: Joi.string().min(2).max(50).required(),
    last: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(50).required().email(),
    phone: Joi.string().min(13).max(13).required(),
    password: Joi.string().min(8).max(255).required(),
    confirmPassword: Joi.string().min(8).max(255).required(),
  });
  return schema.validate(data);
}

module.exports = {
  User,
  validateUser,
};

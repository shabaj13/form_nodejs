require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    minlength: 3,
    required: true,
  },

  lastname: {
    type: String,
    trim: true,
    minlength: 3,
    required: true,
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Enail");
      }
    }
    
  },
  phone: {
    type: Number,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength:4
  },
  confirm_password: {
    type: String,
    required: true,
    minlength:4
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
})

//*generating token
userSchema.methods.generateToken = async function () {
  try {
    const token = await jwt.sign({_id: this._id.toString()},process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    res.status(400).send(error)
  }
}

//*bcrypting password while registration
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) { 
      this.password = await bcrypt.hash(this.password, 10);
      this.confirm_password = await bcrypt.hash(this.password, 10);
    }
      next();
  } catch (error) {
    res.status(400).send(error)
  }
})


const User = mongoose.model("User", userSchema);

module.exports = User;
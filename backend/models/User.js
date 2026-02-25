import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },

  profile: {

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    phone: String,

    bio: String

  }

}, { timestamps: true });



// ✅ FIXED — NO next()
userSchema.pre('save', async function () {

  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

});




// compare password
userSchema.methods.comparePassword = async function(password) {

  return bcrypt.compare(password, this.password);

};



// remove password
userSchema.methods.toJSON = function () {

  const obj = this.toObject();

  delete obj.password;

  return obj;

};


export default mongoose.model('User', userSchema);
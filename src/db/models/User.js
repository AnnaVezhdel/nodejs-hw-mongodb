import { Schema, model } from 'mongoose';
import { emailRegexp } from '../../constants/users.js';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.post('save', handleSaveError);

userSchema.post('findOneAndUpdate', handleSaveError);

userSchema.pre('findOneAndUpdate', setUpdateSettings);

const UserCollection = model('user', userSchema);

export default UserCollection;

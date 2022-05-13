import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userCode: {
      type: String,
      maxlength: [10, '最大10文字までです'],
      trim: true,
      unique: true,
      required: [true, '必須です'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, '必須です'],
    },
    mailAddress: {
      type: String,
      trim: true,
      required: [true, '必須です'],
    },
    displayName: {
      type: String,
      maxlength: [15, '最大15文字までです'],
      default: '名無しさん',
    },
    iconImage: {
      type: String,
      default: null,
    },
    employeeFlg: {
      type: Number,
      default: 0,
    },
    authorityManager: {
      type: Number,
      default: 0,
    },
    authorityAdmin: {
      type: Number,
      default: 0,
    },
    updateVersion: {
      type: Number,
      default: 0,
    },
    deleteFlg: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const userModel = mongoose.model('User', UserSchema);

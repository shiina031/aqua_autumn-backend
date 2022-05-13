import mongoose from 'mongoose';

const UserEventMappingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
    },
    watchHistory: {
      type: Array,
      default: [],
    },
    interestedIn: {
      type: Array,
      default: [],
    },
    reservation: {
      type: Array,
      default: [],
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

export const userEventMappingModel = mongoose.model('UserEventMapping', UserEventMappingSchema);

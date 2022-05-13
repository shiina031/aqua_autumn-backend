import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      maxlength: [15, '最大15文字までです'],
      required: [true, '必須です'],
    },
    eventType: {
      type: String,
      required: [true, '必須です'],
    },
    mainImage: {
      type: String,
      required: [true, '必須です'],
    },
    subImage: {
      type: String,
    },
    description: {
      type: String,
    },
    deteil: {
      type: String,
    },
    inCharge: {
      type: String,
      required: [true, '必須です'],
    },
    makedUser: {
      type: String,
      required: [true, '必須です'],
    },
    updatedUser: {
      type: String,
    },
    startDate: {
      type: Date,
      required: [true, '必須です'],
    },
    finalDate: {
      type: Date,
      required: [true, '必須です'],
    },
    fee: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      default: 9999,
    },
    reserved: {
      type: Number,
      default: 0,
    },
    closedFlg: {
      type: Boolean,
      default: false,
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

export const eventModel = mongoose.model('Event', EventSchema);

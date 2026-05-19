import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  image?: string;
  password?: string;
  role: 'CHILD' | 'PARENT' | 'ADMIN';
  magicEnergy: number;
  lastEnergyReset: Date;
  storybookCount: number;
  lastStorybookReset: Date;
  magicSparks: number;
  lastSparkReset: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ['CHILD', 'PARENT', 'ADMIN'],
      default: 'PARENT',
    },
    magicEnergy: {
      type: Number,
      default: 5,
    },
    lastEnergyReset: {
      type: Date,
      default: Date.now,
    },
    storybookCount: {
      type: Number,
      default: 0,
    },
    lastStorybookReset: {
      type: Date,
      default: Date.now,
    },
    magicSparks: {
      type: Number,
      default: 2,
    },
    lastSparkReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

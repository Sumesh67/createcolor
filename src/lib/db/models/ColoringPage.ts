import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEditHistoryItem {
  editText: string;
  editMode: 'tweak' | 'add' | 'remove' | 'replace';
  imageUrl: string;
  timestamp: Date;
}

export interface IColoringPage extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  editHistory: IEditHistoryItem[];
  tags: string[];
  isPublic: boolean;
  remixCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EditHistorySchema = new Schema<IEditHistoryItem>(
  {
    editText: {
      type: String,
      required: true,
    },
    editMode: {
      type: String,
      enum: ['tweak', 'add', 'remove', 'replace'],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ColoringPageSchema = new Schema<IColoringPage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    editHistory: {
      type: [EditHistorySchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    remixCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for common queries
ColoringPageSchema.index({ userId: 1, createdAt: -1 });
ColoringPageSchema.index({ isPublic: 1, createdAt: -1 });
ColoringPageSchema.index({ tags: 1 });

const ColoringPage: Model<IColoringPage> =
  mongoose.models.ColoringPage || mongoose.model<IColoringPage>('ColoringPage', ColoringPageSchema);

export default ColoringPage;

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGallery extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  pages: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ColoringPage',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
GallerySchema.index({ userId: 1, createdAt: -1 });

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);

export default Gallery;

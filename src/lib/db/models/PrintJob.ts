import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPrintJob extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  pageId: Types.ObjectId;
  layout: 'single' | 'double' | 'quad';
  pdfUrl?: string;
  qrCode?: string;
  status: 'pending' | 'complete' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PrintJobSchema = new Schema<IPrintJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: 'ColoringPage',
      required: true,
    },
    layout: {
      type: String,
      enum: ['single', 'double', 'quad'],
      default: 'single',
    },
    pdfUrl: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'complete', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
PrintJobSchema.index({ userId: 1, createdAt: -1 });
PrintJobSchema.index({ status: 1 });

const PrintJob: Model<IPrintJob> =
  mongoose.models.PrintJob || mongoose.model<IPrintJob>('PrintJob', PrintJobSchema);

export default PrintJob;

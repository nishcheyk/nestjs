import { Schema, model, Document, Types } from 'mongoose';


export interface IPost extends Document {
  title: string;
  content: string;
  authorId: Types.ObjectId;
  createdAt: Date;
  likes: Types.ObjectId[];  // Array of user IDs who liked the post
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true, maxlength: 255 },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
});

export const PostModel = model<IPost>('Post', postSchema);

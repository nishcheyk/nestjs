import { PostModel, IPost } from './post.schema';  // assuming you have a mongoose schema/model
import { Types } from 'mongoose';
 
export class PostService{
    async createPost(data:{title:string;content:string;authorId:string}):Promise<IPost>{
        const post = new PostModel({
            title:data.title,
            content:data.content,
            authorId:new Types.ObjectId(data.authorId),
            createdAt: new Date(),
        });
        return post.save();
    }
    async getPosts():Promise<IPost[]>{
        return PostModel.find().sort({createdAt:-1}).exec();
    }

    async getById(postId: string): Promise<IPost | null> {
        return PostModel.findById(postId).exec();
      }
      
      async update(postId: string, data: Partial<{ title: string; content: string }>): Promise<IPost | null> {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.content !== undefined) updateData.content = data.content;
      
        return PostModel.findByIdAndUpdate(postId, updateData, { new: true }).exec();
      }
  
      async delete(postId: string): Promise<void> {
        await PostModel.findByIdAndDelete(postId).exec();
      }
            
}





export interface User {
  username?: string;
  fullname?: string;
  email?: string;
  profile?: string;
  followers: string[];
following: string[];
chating: string[];
posts: string[];
  _id?: string;
  status?: boolean;
}

export interface Post {
  _id: string;
  poster: User;
  text: string;
  images: string[];
  likes: string[];
  totalComments: number;
  unlikes: string[];
}
export interface Comment {
  _id: any;
  poster: User;
  comment: string;
  likes: string[];
  totalReplies: number;
  unlikes: string[];
  commentOn: string;
  createdAt: string;
}
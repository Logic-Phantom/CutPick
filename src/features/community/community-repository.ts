import type { PostCategory, ReportReason, StyleTag } from './moderation-policy';

/** Provider-agnostic boundary for the community backend. */

export type BackendStatus = 'not-configured' | 'ready';

export interface CommunitySession {
  userId: string;
  email: string | null;
}

export interface CommunityProfile {
  userId: string;
  handle: string;
  displayName: string | null;
  createdAt: string;
}

export type ModerationStatus = 'pending' | 'visible' | 'hidden' | 'removed';

export interface FeedPost {
  id: string;
  authorId: string;
  authorHandle: string;
  imageUrl: string;
  thumbUrl: string;
  imagePath: string;
  thumbnailPath: string;
  category: PostCategory;
  styleTags: StyleTag[];
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  moderationStatus: ModerationStatus;
}

export interface FeedQuery {
  category?: PostCategory | null;
  styleTag?: StyleTag | null;
  before?: string | null;
  limit: number;
}

export interface NewPostInput {
  image: { bytes: Uint8Array; width: number; height: number };
  thumb: { bytes: Uint8Array; width: number; height: number };
  category: PostCategory;
  styleTags: StyleTag[];
}

export interface BlockedUser {
  userId: string;
  handle: string | null;
  createdAt: string;
}

export interface CommunityRepository {
  status(): BackendStatus;
  getSession(): Promise<CommunitySession | null>;
  onSessionChange(cb: (s: CommunitySession | null) => void): () => void;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<CommunitySession>;
  signOut(): Promise<void>;
  /** Deletes storage images, posts, likes, blocks, profile and the auth user. */
  deleteAccount(): Promise<void>;

  getMyProfile(): Promise<CommunityProfile | null>;
  upsertMyProfile(handle: string, displayName: string | null): Promise<CommunityProfile>;

  listFeed(q: FeedQuery): Promise<FeedPost[]>;
  getPost(id: string): Promise<FeedPost | null>;
  listMyPosts(): Promise<FeedPost[]>;
  createPost(input: NewPostInput): Promise<FeedPost>;
  /** Removes storage objects first, then the row. Safe to retry. */
  deleteMyPost(post: Pick<FeedPost, 'id' | 'imagePath' | 'thumbnailPath'>): Promise<void>;

  like(postId: string): Promise<void>;
  unlike(postId: string): Promise<void>;

  reportPost(postId: string, reason: ReportReason): Promise<void>;
  reportUser(userId: string, reason: ReportReason): Promise<void>;

  block(userId: string): Promise<void>;
  unblock(userId: string): Promise<void>;
  listBlocked(): Promise<BlockedUser[]>;
}

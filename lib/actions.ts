/**
 * lib/actions.ts — Barrel Re-Export
 *
 * This file maintains backward compatibility with all existing imports
 * across the application. Every function previously defined here is still
 * accessible via `import { ... } from '@/lib/actions'`.
 *
 * For new code, prefer importing directly from the domain modules:
 *   import { createPost } from '@/lib/actions/post.actions'
 *   import { loginWithEmail } from '@/lib/actions/auth.actions'
 *   import { updateProfile } from '@/lib/actions/user.actions'
 *   import { getAllBatches } from '@/lib/actions/batch.actions'
 *
 * For pure DB queries (callable from RSC without 'use server'):
 *   import { getApprovedPosts } from '@/lib/db/posts.db'
 *   import { getUserById } from '@/lib/db/users.db'
 */

export * from './actions/auth.actions';
export * from './actions/post.actions';
export * from './actions/user.actions';
export * from './actions/batch.actions';

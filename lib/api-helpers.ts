/**
 * Shared API route helpers: auth and invitation loading
 * Use these to avoid repeating getUser + 401 and invitation fetch + owner/token checks.
 */

import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { apiError, ErrorCodes, type ApiErrorBody } from '@/lib/api-response';

export type RequireAuthResult =
  | { user: User; response: null }
  | { user: null; response: NextResponse<ApiErrorBody> };

/**
 * Get current user; if not authenticated, return 401 response.
 * Usage: const auth = await requireAuth(supabase); if (auth.response) return auth.response; const user = auth.user;
 */
export async function requireAuth(supabase: SupabaseClient): Promise<RequireAuthResult> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, response: apiError(ErrorCodes.UNAUTHORIZED, 401, 'Authentication required') };
  }
  return { user, response: null };
}

export interface GetInvitationBySlugOptions {
  /** Require the request to be from the owner (owner_id === user.id) */
  requireOwner?: boolean;
  /** If requireOwner, pass the authenticated user id */
  userId?: string;
  /** For public read: optional token (when invitation.require_token is true) */
  token?: string | null;
}

export type GetInvitationResult<T = { id: string; owner_id: string; [key: string]: unknown }> =
  | { invitation: T; response: null }
  | { invitation: null; response: NextResponse<ApiErrorBody> };

/**
 * Load invitation by slug from DB. Optionally enforce owner or token.
 * Returns { invitation, response: null } or { invitation: null, response }.
 * Caller should check: if (result.response) return result.response;
 */
export async function getInvitationBySlug<T = { id: string; owner_id: string; [key: string]: unknown }>(
  supabase: SupabaseClient,
  slug: string,
  options: GetInvitationBySlugOptions = {}
): Promise<GetInvitationResult<T>> {
  const { requireOwner, userId, token } = options;

  const select = requireOwner && userId
    ? supabase.from('invitations').select('*').eq('slug', slug).eq('owner_id', userId).maybeSingle()
    : supabase.from('invitations').select('*').eq('slug', slug).maybeSingle();

  const { data: invitation, error } = await select;

  if (error) {
    return {
      invitation: null,
      response: apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error.message),
    };
  }

  if (!invitation) {
    return { invitation: null, response: apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found') };
  }

  if (requireOwner && userId && (invitation as { owner_id?: string }).owner_id !== userId) {
    return { invitation: null, response: apiError(ErrorCodes.FORBIDDEN, 403, 'Only the invitation owner can perform this action') };
  }

  // Token check can be done by caller if needed (invitation.require_token + token)
  return { invitation: invitation as T, response: null };
}

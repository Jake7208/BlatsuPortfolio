'use client'

import React, { useState, useSyncExternalStore } from 'react'

import { Heart } from '@/components/icons'

// which comments this browser has already liked — keeps the count honest across
// reloads and stops a reader double-liking, without needing an account
const STORAGE_KEY = 'liked-comments'

function readLiked(): Record<string, true> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

// 'storage' only fires for writes from other tabs; same-tab likes are covered
// by the optimistic state in the component
function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

export default function CommentLikeButton({
  commentId,
  initialLikes,
}: {
  commentId: string
  initialLikes: number
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [optimisticLiked, setOptimisticLiked] = useState(false)
  const [pending, setPending] = useState(false)

  // localStorage is client-only; the server snapshot renders un-liked and the
  // stored value settles on the client without a hydration mismatch
  const storedLiked = useSyncExternalStore(
    subscribeToStorage,
    () => Boolean(readLiked()[commentId]),
    () => false,
  )
  const liked = optimisticLiked || storedLiked

  const like = async () => {
    if (liked || pending) return
    setPending(true)
    // optimistic — bump the count now, reconcile with the server below
    setOptimisticLiked(true)
    setLikes((n) => n + 1)
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json()
      if (typeof data?.likes === 'number') setLikes(data.likes)
      const store = readLiked()
      store[commentId] = true
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      // roll back so the button can be tried again
      setOptimisticLiked(false)
      setLikes((n) => Math.max(0, n - 1))
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      className={`comment-like ${liked ? 'is-liked' : ''}`}
      onClick={like}
      disabled={liked || pending}
      aria-pressed={liked}
      aria-label={
        liked
          ? `Liked — ${likes} ${likes === 1 ? 'like' : 'likes'}`
          : 'Like this comment'
      }
    >
      <Heart />
      <span className="comment-like-count">{likes}</span>
    </button>
  )
}

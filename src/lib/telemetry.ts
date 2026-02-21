import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'

const SESSION_ID_STORAGE_KEY = 'chess_timer.session_id'

let cachedSessionId: string | null = null

const toSnakeCase = (value: string) =>
  value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()

const normalizeProperties = (properties?: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {}
  if (!properties) return normalized

  for (const [key, value] of Object.entries(properties)) {
    normalized[toSnakeCase(key)] = value
  }

  return normalized
}

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const getSessionId = () => {
  if (cachedSessionId) return cachedSessionId
  if (typeof window === 'undefined') {
    cachedSessionId = createSessionId()
    return cachedSessionId
  }

  try {
    const persisted = window.localStorage.getItem(SESSION_ID_STORAGE_KEY)
    if (persisted) {
      cachedSessionId = persisted
      return persisted
    }

    const generated = createSessionId()
    window.localStorage.setItem(SESSION_ID_STORAGE_KEY, generated)
    cachedSessionId = generated
    return generated
  } catch {
    cachedSessionId = createSessionId()
    return cachedSessionId
  }
}

export function initTelemetry() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const sentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONMENT

  if (posthogKey) {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
      })
    } catch {
      // noop
    }
  }

  if (sentryDsn) {
    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: sentryEnvironment || 'development',
        tracesSampleRate: 0.1,
      })
    } catch {
      // noop
    }
  }
}

export function captureEvent(eventName: string, properties?: Record<string, unknown>) {
  const normalizedEventName = toSnakeCase(eventName)
  if (!normalizedEventName) return

  const payload = normalizeProperties(properties)
  payload.session_id = getSessionId()

  try {
    posthog.capture(normalizedEventName, payload)
  } catch {
    // noop
  }

  try {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: normalizedEventName,
      level: 'info',
      data: payload,
    })
  } catch {
    // noop
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const normalizedContext = normalizeProperties(context)
  const normalizedError = error instanceof Error ? error : new Error(String(error ?? 'unknown_error'))

  const errorPayload: Record<string, unknown> = {
    ...normalizedContext,
    session_id: getSessionId(),
    error_name: normalizedError.name,
    error_message: normalizedError.message,
  }

  try {
    posthog.capture('error_captured', errorPayload)
  } catch {
    // noop
  }

  try {
    Sentry.captureException(normalizedError, {
      extra: normalizedContext,
    })
  } catch {
    // noop
  }
}

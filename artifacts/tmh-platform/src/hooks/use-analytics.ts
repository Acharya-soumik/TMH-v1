/**
 * React glue for the analytics module.
 *
 * - `useAnalyticsBootstrap()` mounts once at the app root. It initializes
 *   PostHog/Clarity (passing through the consent state derived from the
 *   IpConsentBanner feature flag + localStorage), and re-syncs whenever the
 *   site settings or stored consent change.
 * - `usePageView()` fires `$pageview` on each wouter route change.
 * - `useTrack()` returns a stable `track(event, props)` callback for components.
 */

import { useEffect, useCallback } from "react"
import { useLocation } from "wouter"
import { init, setConsent, track as rawTrack } from "@/lib/analytics"
import { useSiteSettings } from "@/hooks/use-cms-data"
import { getIpConsent, IP_CONSENT_CHANGED_EVENT } from "@/components/IpConsentBanner"

const SESSION_STARTED_KEY = "tmh_analytics_session_started"
const UTM_TRACKED_KEY = "tmh_analytics_utm_tracked"

function isConsentGranted(consentBannerEnabled: boolean): boolean {
  if (!consentBannerEnabled) return true
  return getIpConsent() === "accepted"
}

export function useAnalyticsBootstrap(): void {
  const { data: settings } = useSiteSettings()
  const ipConsentEnabled = settings?.featureToggles?.ipConsent?.enabled ?? false

  useEffect(() => {
    const granted = isConsentGranted(ipConsentEnabled)
    init({ consentGranted: granted })

    if (granted) {
      // session_started fires once per browser session.
      if (!sessionStorage.getItem(SESSION_STARTED_KEY)) {
        sessionStorage.setItem(SESSION_STARTED_KEY, "1")
        const isReturning = !!localStorage.getItem("tmh_voter_token")
        rawTrack("session_started", { isLoggedIn: false, isReturning })
      }

      // utm_landed fires once per session if URL has UTM params.
      if (!sessionStorage.getItem(UTM_TRACKED_KEY)) {
        const params = new URLSearchParams(window.location.search)
        const source = params.get("utm_source")
        if (source) {
          sessionStorage.setItem(UTM_TRACKED_KEY, "1")
          rawTrack("utm_landed", {
            source,
            medium: params.get("utm_medium"),
            campaign: params.get("utm_campaign"),
            content: params.get("utm_content"),
          })
        }
      }
    }
  }, [ipConsentEnabled])

  // Listen for same-tab consent changes (custom event from IpConsentBanner)
  // and cross-tab changes (storage event).
  useEffect(() => {
    function syncConsent() {
      setConsent(isConsentGranted(ipConsentEnabled))
    }
    function onStorage(ev: StorageEvent) {
      if (ev.key === "tmh_ip_consent") syncConsent()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(IP_CONSENT_CHANGED_EVENT, syncConsent)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(IP_CONSENT_CHANGED_EVENT, syncConsent)
    }
  }, [ipConsentEnabled])
}

export function usePageView(): void {
  const [location] = useLocation()

  useEffect(() => {
    rawTrack("$pageview", { path: location })
  }, [location])
}

export function useTrack() {
  return useCallback((event: string, props: Record<string, unknown> = {}) => {
    rawTrack(event, props)
  }, [])
}

// Privacy-first analytics: Never logs actual user text, only metadata like word count, mode, and tone.

export function trackEvent(name: string, properties: Record<string, any> = {}) {
  // Ensure no sensitive text payload is accidentally logged
  const safeProps = { ...properties };
  delete safeProps.text;
  delete safeProps.original_text;
  delete safeProps.rewritten_text;

  if (typeof window !== "undefined") {
    // Console log in dev or push to PostHog if configured
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Analytics Event: ${name}]`, safeProps);
    }
    const win = window as any;
    if (win.posthog && typeof win.posthog.capture === "function") {
      win.posthog.capture(name, safeProps);
    }
  }
}

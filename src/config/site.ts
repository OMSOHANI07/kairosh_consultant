// =============================================================================
// Site-wide settings. Change the brand, contact details, social links and
// feature flags here. Colours live in src/theme.css.
// =============================================================================

export const site = {
  name: 'Kairosh Consultants',
  shortName: 'Kairosh',
  tagline: 'Websites and AI automation for growing businesses',
  url: 'https://kairoshconsultants.in',
  email: 'hello@kairoshconsultants.in', // PLACEHOLDER: your public contact email
  phone: '+91 00000 00000', // PLACEHOLDER: your public phone number
  location: 'India',
  social: {
    linkedin: 'https://www.linkedin.com/', // PLACEHOLDER
    instagram: 'https://www.instagram.com/', // PLACEHOLDER
    x: 'https://x.com/', // PLACEHOLDER
    github: 'https://github.com/OMSOHANI07',
  },
} as const

export const features = {
  /**
   * true  -> phone login sends a real SMS OTP via Neon Auth's Phone Number
   *          plugin (needs the plugin enabled and a send.otp webhook that
   *          forwards codes to an SMS provider; see README).
   * false -> the phone number is collected WITHOUT verification and stored
   *          with phone_verified = false.
   */
  PHONE_OTP_ENABLED: false,

  /** Minutes of active time before the optional login popup appears, and between re-prompts. */
  LOGIN_POPUP_INTERVAL_MINUTES: 10,

  /** A new tracking session starts after this many minutes of inactivity. */
  SESSION_TIMEOUT_MINUTES: 30,

  /** Free IP geolocation (country/city), only called after cookie consent. Set to '' to disable. */
  GEO_IP_URL: 'https://get.geojs.io/v1/ip/geo.json',
} as const

/** Base Neon URL: https://<endpoint>.<region>.aws.neon.tech/<database> */
export const NEON_URL = import.meta.env.VITE_NEON_URL as string | undefined

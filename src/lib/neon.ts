// Full Neon SDK: Managed Better Auth + Data API client carrying the signed-in
// user's JWT. Heavy, so it is only imported dynamically: by the login modal
// and by the admin dashboard. Public pages use ./api.ts instead.
import { createInternalNeonAuth } from '@neondatabase/auth'
import { NeonPostgrestClient, fetchWithToken } from '@neondatabase/postgrest-js'
import { urls } from './api'

const neonAuth = createInternalNeonAuth(urls.auth, { allowAnonymous: true })

/** Better Auth client: emailOtp, signIn.emailOtp, phoneNumber, getSession, signOut… */
export const auth = neonAuth.adapter

/** Data API client: sends the user's JWT when signed in, otherwise an anonymous one. */
export const db = new NeonPostgrestClient({
  dataApiUrl: urls.dataApi,
  options: { global: { fetch: fetchWithToken(() => neonAuth.getJWTToken()) } },
})

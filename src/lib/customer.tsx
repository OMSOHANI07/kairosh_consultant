// Customer login state shared by the public site (optional login modal) and
// the admin area (which uses the same Neon Auth session).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { isConfigured, rpc } from './api'
import { getItem, keys, removeItem, setItem } from './storage'
import { getVisitorId, track } from './tracking'

type StoredCustomer = { id: string; method: 'email' | 'phone'; label: string; verified: boolean }
type AuthUser = { id: string; email: string; name?: string; emailVerified?: boolean }

type CustomerContextValue = {
  /** Neon Auth user (email OTP or phone OTP sign-in), if any. */
  user: AuthUser | null
  /** Customer record linked to this browser (also set by the unverified phone fallback). */
  customer: StoredCustomer | null
  ready: boolean
  loginOpen: boolean
  openLogin: (source: 'timer' | 'manual') => void
  closeLogin: (reason: 'dismissed' | 'completed') => void
  loginSource: 'timer' | 'manual'
  sendEmailCode: (email: string) => Promise<void>
  verifyEmailCode: (email: string, code: string) => Promise<void>
  sendPhoneCode: (phone: string) => Promise<void>
  verifyPhoneCode: (phone: string, code: string) => Promise<void>
  registerPhone: (phone: string) => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
  signOut: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextValue | null>(null)

/** The auth SDK is large, so it is only downloaded when someone signs in. */
const sdk = () => import('./neon')

const errMessage = (e: unknown, fallback: string) =>
  (e as { message?: string })?.message || fallback

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [customer, setCustomer] = useState<StoredCustomer | null>(() => getItem<StoredCustomer>(keys.customer))
  const [ready, setReady] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginSource, setLoginSource] = useState<'timer' | 'manual'>('manual')

  const refreshUser = useCallback(async () => {
    if (!isConfigured) return null
    setReady(false)
    try {
      const { auth } = await sdk()
      const { data } = await auth.getSession()
      const u = (data?.user as AuthUser | undefined) ?? null
      setUser(u)
      return u
    } catch {
      setUser(null)
      return null
    } finally {
      setReady(true)
    }
  }, [])

  const saveCustomer = useCallback((c: StoredCustomer) => {
    setItem(keys.customer, c)
    setCustomer(c)
  }, [])

  const linkSignedInUser = useCallback(
    async (method: 'email' | 'phone', label: string) => {
      const { db } = await sdk()
      const { data, error } = await db.rpc('link_customer', { p_visitor_id: getVisitorId() })
      if (error) throw new Error(error.message)
      saveCustomer({ id: data as string, method, label, verified: true })
      track('login_completed', { method, verified: true })
    },
    [saveCustomer],
  )

  const sendEmailCode = useCallback(async (email: string) => {
    const { auth } = await sdk()
    const { error } = await auth.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
    if (error) throw new Error(errMessage(error, 'Could not send the code. Please try again.'))
  }, [])

  const verifyEmailCode = useCallback(
    async (email: string, code: string) => {
      const { auth } = await sdk()
      const { error } = await auth.signIn.emailOtp({ email, otp: code })
      if (error) throw new Error(errMessage(error, 'That code is not valid. Please try again.'))
      await refreshUser()
      await linkSignedInUser('email', email)
    },
    [linkSignedInUser, refreshUser],
  )

  const sendPhoneCode = useCallback(async (phone: string) => {
    const { auth } = await sdk()
    const { error } = await auth.phoneNumber.sendOtp({ phoneNumber: phone })
    if (error) throw new Error(errMessage(error, 'Could not send the SMS. Please try again.'))
  }, [])

  const verifyPhoneCode = useCallback(
    async (phone: string, code: string) => {
      const { auth } = await sdk()
      const { error } = await auth.phoneNumber.verify({ phoneNumber: phone, code })
      if (error) throw new Error(errMessage(error, 'That code is not valid. Please try again.'))
      await refreshUser()
      await linkSignedInUser('phone', phone)
    },
    [linkSignedInUser, refreshUser],
  )

  /** PHONE_OTP_ENABLED = false fallback: store the number without verification. */
  const registerPhone = useCallback(
    async (phone: string) => {
      const { data, error } = await rpc<string>('register_phone_customer', {
        p_visitor_id: getVisitorId(),
        p_phone: phone,
      })
      if (error) throw new Error(error.message.includes('invalid phone') ? 'Please enter a valid phone number.' : error.message)
      saveCustomer({ id: data as string, method: 'phone', label: phone, verified: false })
      track('login_completed', { method: 'phone', verified: false })
    },
    [saveCustomer],
  )

  const signOut = useCallback(async () => {
    try {
      const { auth } = await sdk()
      await auth.signOut()
    } catch {
      /* ignore */
    }
    removeItem(keys.customer)
    setCustomer(null)
    setUser(null)
  }, [])

  const openLogin = useCallback((source: 'timer' | 'manual') => {
    sdk() // start downloading the SDK while the visitor types
    setLoginSource(source)
    setLoginOpen(true)
    track('login_popup_shown', { trigger: source })
  }, [])

  const closeLogin = useCallback((reason: 'dismissed' | 'completed') => {
    setLoginOpen(false)
    if (reason === 'dismissed') track('login_popup_dismissed')
  }, [])

  const value = useMemo<CustomerContextValue>(
    () => ({
      user,
      customer,
      ready,
      loginOpen,
      loginSource,
      openLogin,
      closeLogin,
      sendEmailCode,
      verifyEmailCode,
      sendPhoneCode,
      verifyPhoneCode,
      registerPhone,
      refreshUser,
      signOut,
    }),
    [
      user,
      customer,
      ready,
      loginOpen,
      loginSource,
      openLogin,
      closeLogin,
      sendEmailCode,
      verifyEmailCode,
      sendPhoneCode,
      verifyPhoneCode,
      registerPhone,
      refreshUser,
      signOut,
    ],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used inside <CustomerProvider>')
  return ctx
}

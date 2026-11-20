/** Public self-serve signup is off unless ALLOW_PUBLIC_SIGNUP=true. Existing users can still sign in. */
export function publicSignupEnabled(): boolean {
  return process.env.ALLOW_PUBLIC_SIGNUP === 'true'
}

export const PASSWORD_MIN_LENGTH = 12

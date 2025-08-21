import { z } from 'zod'

export const AuthV4ManualAuthSchema = z
  .object({
    email: z.string().email().min(3).max(64),
    password: z.string().min(3).max(64).optional(),
    otp: z.string().length(6).optional(),
    turnstileToken: z.string(),
  })
  .refine(({ password, otp }) => {
    if (!password && !otp) {
      return false
    }
    return true
  }, 'either password or otp is required')

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    accessToken: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await (window as any).Clerk?.session?.getToken()) ?? ''
    },
  },
)

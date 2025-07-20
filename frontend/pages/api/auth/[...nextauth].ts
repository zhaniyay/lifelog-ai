import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    // Demo credentials provider for testing
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@lifelog.ai' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple demo authentication - accept any email/password for testing
        if (credentials?.email) {
          return {
            id: '1',
            name: 'Demo User',
            email: credentials.email,
            image: null
          }
        }
        return null
      }
    }),
    // Google OAuth (requires credentials)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})

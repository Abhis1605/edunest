import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import connectDB from "@/lib/mongodb";
import User from "@/models/User";


export const authOptions = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    await connectDB()

                    const user = await User.findOne({
                        email: credentials.email,
                        isActive: true
                    })

                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    // Check password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isPasswordValid) {
                        throw new Error("Invalid password")
                    }

                    // return user object
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        isProfileComplete: user.isProfileComplete,
                    }
                } catch (error) {
                    throw new Error(error.message)
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token , user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.avatar = user.avatar;
                token.isProfileComplete = user.isProfileComplete
            }
            if (trigger === 'update' && session ) {
                token.avatar = session.avatar
                token.isProfileComplete = session.isProfileComplete
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.avatar = token.avatar;
                session.user.isProfileComplete = token.isProfileComplete
            }
            return session
        }
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: 'jwt',
    },

    secret: process.env.NEXTAUTH_SECRET,
};


const handler = NextAuth(authOptions) ;
export { handler as GET, handler as POST}
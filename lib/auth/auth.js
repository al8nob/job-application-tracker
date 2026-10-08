import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { initializeUserBoard } from "../init-user-board";
import { connectDB } from "../db";

const mongooseInstance = await connectDB()
const client = mongooseInstance.connection.getClient()
const db = client.db();
export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60
        }
    },
    emailAndPassword: {
        enabled: true
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    console.log("USER CREATED:", user)

                    if (user.id) {
                        console.log("INITIALIZING BOARD...")
                        await initializeUserBoard(user.id)
                        console.log("BOARD INITIALIZED")
                    }
                }
            }
        }
    }
})

export const getSession = async () => {
    const result = await auth.api.getSession({ headers: await headers() })
    return result
}

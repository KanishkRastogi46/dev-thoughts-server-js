import { Request } from "express-serve-static-core"

declare module 'express-serve-static-core' {
    interface Request {
        user: {
            id: number | string,
            role: number | string
        }
    }
}
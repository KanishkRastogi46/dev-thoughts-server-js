import { Request } from "express-serve-static-core"
import { JwtPayload } from "src/services/auth/interface/jwt-payload.interface"

declare module 'express-serve-static-core' {
    interface Request {
        user: JwtPayload
    }
}
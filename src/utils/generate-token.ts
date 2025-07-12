import { sign, SignOptions } from "jsonwebtoken";

export function generateToken(
    payload: any,
    secret: string,
    options: SignOptions
) {
    return sign(
        payload,
        secret,
        options
    )
}
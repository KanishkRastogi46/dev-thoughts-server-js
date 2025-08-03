import { Response } from "express";

export const generateCookie = (res: Response, key: string, value: string) => {
    res.cookie(key, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1 * 60 * 60 * 1000, // 1 hr
    })
}
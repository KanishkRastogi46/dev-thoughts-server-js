export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 899999).toString()
}
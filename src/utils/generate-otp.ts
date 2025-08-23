export function generateOTP(): string {
    return Math.floor(100000 * (1 + Math.random())).toString()
}
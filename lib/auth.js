import bcrypt from "bcryptjs";

export async function verifyPassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        return false;
    }
}
import jwt from "jsonwebtoken";

export const generateToken = (phone: string) => {
    return jwt.sign(
        { phone },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );
};

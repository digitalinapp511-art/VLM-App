import axios from "axios";
import { generateToken } from "../utils/generateToken";

export const sendOtpService = async (phone: string) => {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${process.env.MSG91_AUTH_KEY}`;
    const response = await axios.post(url);
    return response.data;
};

export const verifyOtpService = async (phone: string, otp: string) => {
    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`;
    const response = await axios.get(url, {
        headers: {
            authkey: process.env.MSG91_AUTH_KEY
        }
    });

    if (response.data.type !== "success") {
        throw new Error("Invalid OTP");
    }

    const token = generateToken(phone);

    return token;
};

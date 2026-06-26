import { Request, Response } from "express";
import { sendOtpService, verifyOtpService } from "../services/authService";

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const data = await sendOtpService(phone);

        res.json({
            success: true,
            data
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;
        const token = await verifyOtpService(phone, otp);

        res.json({
            verified: true,
            token
        });

    } catch (error: any) {
        res.status(400).json({
            verified: false,
            message: error.message
        });
    }
};

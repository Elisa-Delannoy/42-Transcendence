import { FastifyReply, FastifyRequest } from "fastify";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { friends, users } from '../../server';
import { checkTempToken, createJWT } from "../../middleware/jwt";
import { CookieSerializeOptions } from "@fastify/cookie";
import { devNull } from "os";
import { IUsers } from "../../DB/users";
import { notification } from "../friends/friends";

// create secret + otpauth_url（for creating qrcode）
export async function setupTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        if (userId === null)
            return;
        const secret = speakeasy.generateSecret({ length: 20, name: `Transcendence:${userId}` });
        if (!secret.otpauth_url) {
            throw new Error("Failed to generate OTP Auth URL");
        }
        await users.setTwoFA(userId, secret.base32, false);
        const qr = await qrcode.toDataURL(secret.otpauth_url!);
        return reply.send({
            base32: secret.base32,
            otpauth_url: secret.otpauth_url,
            qr
        });
    }catch(err) {
        console.error(err);
        return reply.send({ ok: false, error: "Failed to setup 2FA" });
    }
}

// Enable 2FA after scanning QR and submitting code
export async function enableTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        const { code } = request.body as { code: string };
        if (userId === null)
            return;
        // Retrieve user's stored secret
        const user = await users.getIDUser(userId);
        if (!user.twofa_secret) {
            return reply.send({ ok:false, error: "2FA not set up. Please run /setup first." });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: "base32",
            token: code,
            window: 1,
        });

        if (!verified) {
            return reply.send({ ok: false, error: "Invalid 2FA code." });
        }

        // Enable 2FA in DB
        await users.setTwoFA(userId, user.twofa_secret!, true);

        return reply.send({ ok: true, message: "2FA enabled successfully." });
    } catch (err) {
        console.error(err);
        return reply.send({ ok: false, error: "Failed to enable 2FA." });
    }
}

// Disable 2FA
export async function disableTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        if (userId === null)
            return;
        await users.setTwoFA(userId, null, false);
        return reply.send({ ok: true, message: "2FA disabled successfully." });
    } catch (err) {
        console.error(err);
        return reply.send({ ok: false, error: "Failed to disable 2FA." });
    }
}

export async function checkTwoFA(request: FastifyRequest, reply: FastifyReply, code: number)
{
	try
	{
		const user = await checkTempToken(request);
		const verified = speakeasy.totp.verify({
			secret: user.twofa_secret,
			encoding: "base32",
			token: code.toString(),
			window: 1,
		});
		if (!verified)
		{
			return reply.send({ ok: false, field: "2fa", error: "Invalid 2FA code." });
		}
		const options: CookieSerializeOptions = {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/",
		};
		const jwtoken = createJWT(user.user_id, user.pseudo, user.avatar);
		users.updateStatus(user.user_id, "online");
		reply.clearCookie("tempToken", options).setCookie("token", jwtoken, options).status(200).send({ twofa:false, ok:true, message: "Login successful"})
	}
	catch (err)
	{
		reply.send({ ok: false, error: err })
	}
}

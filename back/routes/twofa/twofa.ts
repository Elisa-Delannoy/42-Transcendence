import { FastifyReply, FastifyRequest } from "fastify";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { users } from '../../server';

// create secret + otpauth_url（for creating qrcode）
export async function setupTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        const secret = speakeasy.generateSecret({ length: 20, name: `Transcendence:${userId}` });
        await users.setTwoFA(userId, secret.base32, false);
        const qr = await qrcode.toDataURL(secret.otpauth_url);
        return reply.send({
            base32: secret.base32,
            otpauth_url: secret.otpauth_url,
            qr
        });
    }catch(err) {
        console.error(err);
        return reply.status(500).send({ error: "Failed to setup 2FA" });
    }
}

// Enable 2FA after scanning QR and submitting code
export async function enableTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        const { code } = request.body as { code: string };

        // Retrieve user's stored secret
        const user = await users.getIDUser(userId);
        if (!user.twofa_secret) {
            return reply.status(400).send({ error: "2FA not set up. Please run /setup first." });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: "base32",
            token: code,
            window: 1,
        });

        if (!verified) {
            return reply.status(400).send({ error: "Invalid 2FA code." });
        }

        // Enable 2FA in DB
        await users.setTwoFA(userId, user.twofa_secret!, true);

        return reply.send({ ok: true, message: "2FA enabled successfully." });
    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Failed to enable 2FA." });
    }
}

// Disable 2FA
export async function disableTwoFA(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user!.user_id;
        await users.setTwoFA(userId, null, false);
        return reply.send({ ok: true, message: "2FA disabled successfully." });
    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Failed to disable 2FA." });
    }
}

import { FastifyReply, FastifyRequest } from "fastify";
import { google } from "googleapis";
import { friends, users, users_stats } from '../../server';
import { createJWT, createTemp2FAToken } from "../../middleware/jwt";
import { notification } from "../friends/friends";
import bcrypt from "bcryptjs";

// Google account password placeholder
export const GOOGLE_PASSWORD_PLACEHOLDER = "__OAUTH_GOOGLE__";
//console.log("Google redirect_uri =", `${process.env.PUBLIC_BASE_URL}/api/oauth/google/callback`);
// 1. Google OAuth2 setting
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,       
  `${process.env.PUBLIC_BASE_URL}/api/oauth/google/callback`
);
const SCOPES = ["openid", "profile", "email"];

export async function registerGoogle(request: FastifyRequest, reply: FastifyReply) {

  try {
    // 2. jump to Google login page
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    return reply.redirect(url);

  } catch (err) {
    request.log.error(err, "Google OAuth redirect failed");
    return reply.send({
      ok: false,
      error: "Failed to initiate Google OAuth login",
    });
  }
}

export async function callbackGoogle(request: FastifyRequest, reply: FastifyReply) {

    try {
      // 3. callback OAuth (from google redirect)
      const {code, error} = request.query as any;
      if (error)
          return reply.redirect(`${process.env.PUBLIC_BASE_URL}/login?oauth=error`);
      if (!code)
          return reply.send({ ok: false, error: "Missing OAuth code"});
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // 4. get user info from google
      const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
      const userInfo = await oauth2.userinfo.get();
      const { email, name } = userInfo.data;

      // 5. check/create user
      let user = await users.getEmailUser(email!);

      const passwordGoogle = await bcrypt.hash("google", 12);
      if (!user || user.length === 0) {
        const cleanName = name?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 16)
        const existingUser = await users.getPseudoUser(cleanName!);
        const finalName = (existingUser.pseudo === cleanName) ? `google_${Math.random().toString(36).slice(2, 4)}` : cleanName

        await users.addUser(finalName!, email!, passwordGoogle, 500);
		users_stats.addUser((await users.getPseudoUser(finalName!)).user_id);
        user = await users.getEmailUser(email!);
      }

      // check if user.pseudo === "inactive user"
      // YES => return inactive user try to login

      if (user.pseudo === "inactive user")
      {
        // console.log('inactive user try to login');
        return reply.redirect(`${process.env.PUBLIC_BASE_URL}/login?error=account_inactive`);
      }

      // 6.  if 2FA enabled
      if (user.twofa_enabled === 1) {
        const tempToken = createTemp2FAToken(user.user_id);
        reply.setCookie("tempToken", tempToken, { httpOnly: true, secure: true, sameSite: "strict", path: "/" });
        return reply.redirect(`${process.env.PUBLIC_BASE_URL}/oauth/callback`);
      }

      // 7. JWT
      const jwtoken = createJWT(user.user_id, user.pseudo, user.avatar);
      users.updateStatus(user.user_id, "online");
      reply.setCookie("token", jwtoken, { httpOnly: true, secure: true, sameSite: "strict", path: "/" });
      return reply.redirect(`${process.env.PUBLIC_BASE_URL}/oauth/callback`);
    } catch (err) {
      console.error(err);
      reply.send({ ok: false, error: "OAuth Google login failed" });
    }
}

import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
import bcrypt from "bcryptjs";
import path from "path"
import { pipeline } from "stream/promises"
import fs from "fs";

export async function getUpdateInfo(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as any;
		const profil = await users.getIDUser(id);
		if (!profil)
      		return reply.code(404).send({message: "User not found"});
    	return profil;
  	} catch (error) {
    	fastify.log.error(error)
    	return reply.code(500).send({message: "Internal Server Error"});
  	}
}

export async function getUpdateUsername(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const { newUsername, password } = request.body as any;
		const id = request.user?.user_id as any;

		const user = await users.getIDUser(id);
		if (!user)
			return reply.code(404).send({message: "User not found!"});

		const duplicate = await users.getPseudoUser(newUsername);
		if (duplicate?.pseudo === newUsername) {
			return reply.code(409).send({message: "Username already taken!"});
		}

		if (newUsername.length > 16 || newUsername.length < 1)
			return reply.code(411).send({message: "Username length invalid! 1-16 characters" });

		const valid = /^[a-zA-Z0-9_]+$/.test(newUsername);
		if (!valid)
			return reply.code(400).send({message: "Username can only contain letters, numbers and underscores!" });;

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return reply.code(400).send({ message: "Wrong password. Please try again!" });
		}

		const updatedUser = await users.updateUsername(id, newUsername);
		return reply.code(200).send({ message: "Username updated successfully", pseudo: updatedUser.pseudo });

	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ message: "Internal Server Error" });
	}
}

export async function getUpdateEmail(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const { newEmail, password } = request.body as any;
		const id = request.user?.user_id as any;
		const newE = newEmail.toLowerCase();

		const user = await users.getIDUser(id);
		if (!user)
			return reply.code(404).send({message: "User not found!"});

		const duplicate = await users.getEmailUser(newE);
		if (duplicate?.email === newE) {
			return reply.code(409).send({message: "Email already in use."});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newE))
			return reply.code(400).send({message: "Invalid email format." });;

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return reply.code(400).send({ message: "Wrong password. Please try again!" });
		}

		const updatedUser = await users.updateEmail(id, newE);
		return reply.code(200).send({ message: "Email updated successfully", email: updatedUser.email });

	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ message: "Internal Server Error" });
	}
}

// export async function getUpdatePassword(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	// try {
	// 	const { newEmail, password } = request.body as any;
	// 	const id = request.user?.user_id as any;

	// 	const user = await users.getIDUser(id);
	// 	if (!user)
	// 		return reply.code(404).send({message: "User not found!"});

	// 	const duplicate = await users.getEmailUser(newE);
	// 	if (duplicate?.email === newE) {
	// 		return reply.code(409).send({message: "Email already in use."});
	// 	}

	// 	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newE))
	// 		return reply.code(400).send({message: "Invalid email format." });;

	// 	const isMatch = await bcrypt.compare(password, user.password);
	// 	if (!isMatch) {
	// 		return reply.code(401).send({ message: "Wrong password. Please try again!" });
	// 	}

	// 	const updatedUser = await users.updateEmail(id, newE);
	// 	return reply.code(200).send({ message: "Email updated successfully", email: updatedUser.email });

	// } catch (error) {
	// 	fastify.log.error(error);
	// 	return reply.code(500).send({ message: "Internal Server Error" });
	// }
// }
export async function getUploadAvatar(request: FastifyRequest, reply: FastifyReply) {
	const avatar = await request.file();
		// console.log("avatar = ", avatar);
		if (!avatar?.filename) {
			return reply.status(400).send({ error: "Nothing uploaded"});
		}
		const avatar_name = request.user?.user_id + ".png";
		const avatar_path = path.join(__dirname, "../../uploads", avatar_name);
		await pipeline(avatar.file, fs.createWriteStream(avatar_path));
		return reply.status(200).send({ message: "Upload succes", filename: avatar_name})
}

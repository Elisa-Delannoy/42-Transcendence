import { manageRegister } from "../services/register.service";

export async function registerController(
	pseudo: string,
	email: string,
	password: string
) {
	try {
		const msg = await manageRegister(pseudo, email, password);
		return msg;
	} catch (err) {
		return (err as Error).message;
	}
}

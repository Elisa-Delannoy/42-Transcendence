export interface User {
	id?: number;
	pseudo: string;
	email: string;
	password: string;
}

export enum UserStatus {
  offline = 0,
  online = 1,
  playing = 2
}
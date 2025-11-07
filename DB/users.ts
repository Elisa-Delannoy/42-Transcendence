class Users
{
	user_id : number;
	email : string;
	pseudo : string;
	password : string;
	status : UserStatus;
	creation_date : Date;
	money : number;
	nb_games : number;
	won_games : number;
	lost_games : number;
	won_tournaments : number;
	elo : number;

	constructor (user_id : number, email : string, pseudo : string, password : string)
	{
		this.user_id = user_id
		this.email = email;
		this.pseudo = pseudo;
		this.password = password;
		this.status = UserStatus.offline;
		this.creation_date = new Date();
		this.money = 0
		this.nb_games = 0;
		this.won_games = 0;
		this.lost_games = 0;
		this.won_tournaments = 0;
		this.elo = 0;
	}

	createDB()
	{

	}
}

enum    UserStatus
{
	offline, 
	online,
	playing
}
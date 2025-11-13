"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
class Users {
    constructor(db, email, pseudo, password) {
        this._db = db;
        this.user_id = 0;
        this.pseudo = pseudo;
        this.email = email;
        this.password = password;
        // this.avatar = "";
        this.status = UserStatus.offline;
        this.creation_date = new Date();
        this.modification_date = new Date();
        this.money = 0;
        this.elo = 0;
    }
    static createUserTable(db) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.execute(`
			CREATE TABLE IF NOT EXISTS Users (
				user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                pseudo TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                status INTEGER NOT NULL,
                creation_date TEXT NOT NULL,
				modification_date TEXT NOT NULL,
                money INTEGER DEFAULT 0,
                elo INTEGER DEFAULT 0
			)
		`);
        });
    }
    addUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
			INSERT INTO Users (pseudo, email, password, status, creation_date, modification_date, money, elo)
			VALUES (?,?,?,?,?,?,?,?)
		`;
            const parameters = [
                this.pseudo,
                this.email,
                this.password,
                // this.avatar,
                this.status,
                this.creation_date.toISOString(),
                this.modification_date.toISOString(),
                this.money,
                this.elo
            ];
            yield this._db.execute(query, parameters);
        });
    }
    static deleteUserTable(db) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `DROP TABLE IF EXISTS Users`;
            yield db.execute(query, []);
        });
    }
}
exports.Users = Users;
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["offline"] = 0] = "offline";
    UserStatus[UserStatus["online"] = 1] = "online";
    UserStatus[UserStatus["playing"] = 2] = "playing";
})(UserStatus || (UserStatus = {}));

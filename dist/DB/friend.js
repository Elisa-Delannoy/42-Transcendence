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
exports.Friend = void 0;
class Friend {
    constructor(db, user_id1, user_id2) {
        this._db = db;
        this.id = 0;
        this.user_id1 = user_id1;
        this.user_id2 = user_id2;
        this.status = FriendshipStatus.pending;
        this.friendship_date = new Date();
    }
    static createFriendTable(db) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.execute(`
			CREATE TABLE IF NOT EXISTS Friendship (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id1 INTEGER NOT NULL, 
				user_id2 INTEGER NOT NULL,
                friendship_date TEXT NOT NULL,
                status INTEGER NOT NULL
			)
		`);
        });
    }
    addFriendship() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
			INSERT INTO Friendship (user_id1, user_id2, friendship_date, status)
			VALUES (?,?,?,?)
		`;
            const parameters = [
                this.user_id1,
                this.user_id2,
                this.friendship_date.toISOString(),
                this.status
            ];
            yield this._db.execute(query, parameters);
        });
    }
}
exports.Friend = Friend;
var FriendshipStatus;
(function (FriendshipStatus) {
    FriendshipStatus[FriendshipStatus["pending"] = 0] = "pending";
    FriendshipStatus[FriendshipStatus["accepted"] = 1] = "accepted";
    FriendshipStatus[FriendshipStatus["blocked"] = 2] = "blocked";
})(FriendshipStatus || (FriendshipStatus = {}));

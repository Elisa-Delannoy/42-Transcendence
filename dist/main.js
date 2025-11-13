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
exports.db = void 0;
const manageDB_1 = require("./DB/manageDB");
const users_1 = require("./DB/users");
exports.db = new manageDB_1.ManageDB('./src//DB/database.db');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.db.connect();
        // await Users.deleteUserTable(db);
        yield users_1.Users.createUserTable(exports.db);
        // console.log('Table user ok');
        const user = new users_1.Users(exports.db, "ely", "e@db.com", "psw10");
        yield user.addUser();
        yield exports.db.close();
    });
}
main()
    .then(() => console.log("tout fini comme il faut"))
    .catch((error) => console.error("error:,", error));

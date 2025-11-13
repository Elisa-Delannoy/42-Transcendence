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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageDB = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class ManageDB {
    constructor(path) {
        this._db = null;
        this._path = path;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this._db = new sqlite3_1.default.Database(this._path, (error) => {
                if (error)
                    reject(new Error(`Error connexion DB : ${error.message}`));
                else {
                    console.log("connexion ok"); /*a supp */
                    resolve();
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            if (!this._db)
                return resolve();
            this._db.close((error) => {
                if (error)
                    reject(error);
                else {
                    console.log("connexion closed"); /*a supp*/
                    resolve();
                }
            });
        });
    }
    execute(query, parameters = []) {
        return new Promise((resolve, reject) => {
            if (!this._db)
                return reject(new Error("Database not connected"));
            this._db.run(query, parameters, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    deleteUserTable(table, db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!/^[a-zA-Z0-9_]+$/.test(table)) {
                throw new Error("Nom de table invalide");
            }
            const query = `DROP TABLE IF EXISTS ${table}`;
            yield db.execute(query);
        });
    }
}
exports.ManageDB = ManageDB;

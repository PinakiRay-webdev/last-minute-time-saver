"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_config_1 = __importDefault(require("./config/db.config"));
const port = 5000;
app_1.default.listen(port, async () => {
    await (0, db_config_1.default)();
    console.log(`Server started on port ${port}`);
});

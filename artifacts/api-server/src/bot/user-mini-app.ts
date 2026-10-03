import { assembleMiniApp } from "./mini-app/assemble";
import indexHtml from "./mini-app/user/index.html";
import styleCss from "./mini-app/user/style.css";
import appJs from "./mini-app/user/app.js";

export const userMiniAppHtml = assembleMiniApp(indexHtml, styleCss, appJs);

import { assembleMiniApp } from "./mini-app/assemble";
import indexHtml from "./mini-app/admin/index.html";
import styleCss from "./mini-app/admin/style.css";
import appJs from "./mini-app/admin/app.js";

export const adminMiniAppHtml = assembleMiniApp(indexHtml, styleCss, appJs);

"use strict";

const ipcMain = require("electron").ipcMain;
const fs = require("fs");

module.exports = {

    localizeCfgs: null,

    load() {
        ipcMain.on("editor:ready", this.onEditorReady.bind(this));
        //
        this.profiles.load();
        this.loadLangConfig();
    },

    unload() {
        // execute when package unloaded
    },

    onEditorReady() {
        //
    },

    loadLangConfig() {
        const configPath = this.profiles.get("path");
        const lang = this.profiles.get("lang");
        const fileName = this.profiles.get("fileName");
        try {
            this.localizeCfgs = JSON.parse(fs.readFileSync(`${Editor.Project.path}/${configPath}/${lang}/${fileName}`, "utf-8"));
            Editor.success("localized config load success:", lang);
        } catch (e) {
            Editor.warn("localized config load fail:", e);
        }
    },

    messages: {
        open() {
            Editor.Panel.open("game-helper");
        },
        // reload lang config
        reload() {
            this.loadLangConfig();
        },
        // 获取多语言配置字符串
        getLangStr(event, param) {
            if (this.localizeCfgs === null) {
                event.reply(new Error("config not load"), null);
            }
            const [tid, ...args] = param.split(",");
            let str = this.localizeCfgs[tid];
            if (str) {
                args.forEach((arg, index) => {
                    str = str.replace("${p" + (index + 1) + "}", arg);
                });
                event.reply(null, str);
            } else {
                event.reply(null, tid);
            }
        },
    },

    profiles: {
        config: null,
        path: "",
        load() {
            this.path = Editor.url("packages://game-helper/package.json");
            this.config = JSON.parse(fs.readFileSync(this.path, "utf8"));
        },
        get(key) {
            return this.config.profiles.local[key];
        },
    },
};

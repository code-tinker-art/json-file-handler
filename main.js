import fs from "node:fs/promises";
import { watch } from "node:fs";

export class JSON_FileHandler {
    constructor(fileName, createTemp = true, _watch=true) {
        this.isReady = false;
        this.name = fileName;
        this.json = null;
        this.obj = null;
        this.atomicWriting = createTemp;
        this.isSaving = false;
        this._watch = _watch;
        this.watcher = null;
        this.writeQueue = Promise.resolve();
    }

    async init() {
        try {
            await fs.access(this.name);
        } catch {
            console.error(`No files found matching given name. "${this.name}"`);
            return;
        }

        await this.load();
        if (this._watch)
            this.startWatcher();

    }

    async load() {
        try {
            let data = await fs.readFile(this.name, "utf-8");
            if (data.charCodeAt(0) === 0xFEFF) { //Invinsible character written at the first 
                data = data.slice(1);
            }

            this.json = data;
            this.obj = JSON.parse(this.json);
            this.isReady = true;
        } catch (parseError) {
            console.log(parseError)
            console.error(`File "${this.name}" exists but contains invalid JSON.`);
        }
    }

    startWatcher() {
        if (this.watcher) return;

        let watchTimeout = null;

        this.watcher = watch(this.name, (eventType) => {
            if (eventType === "change") {
                if (this.isSaving) return;

                clearTimeout(watchTimeout);
                watchTimeout = setTimeout(async () => {
                    if (this.isSaving) return;
                    await this.load();
                }, 50); //Waits for the OS to finish writing
            }
        });

        this.watcher.on("error", (error) => {
            console.error(`Watcher error on file "${this.name}":`, error);
        });
    }

    async save() {
        if (!this.isReady) return;

        this.writeQueue = this.writeQueue.then(async () => {
            this.isSaving = true;
            this.json = JSON.stringify(this.obj, null, 4);

            try {
                if (this.atomicWriting) {
                    await fs.writeFile(`${this.name}.tmp`, this.json);
                    await fs.rename(`${this.name}.tmp`, this.name);
                } else {
                    await fs.writeFile(this.name, this.json);
                }
            } catch (err) {
                console.error("Error occurred while writing JSON file...", err);
            } finally {
                // Safely wait out the OS disk flush before turning off the lock
                await new Promise(resolve => setTimeout(resolve, 100));
                this.isSaving = false;
            }
        });

        return this.writeQueue;
    }


    get(path) {
        if (!this.isReady) return;

        const keys = path.split(".");
        let current = this.obj;

        for (const key of keys) {
            if (current === null || typeof current !== "object" || !(key in current)) {
                console.error(`Undefined path "${path}" passed as argument...`);
                return;
            }
            current = current[key];
        }

        return current;
    }

    async set(path, value) {
        console.log(this.isReady)
        if (!this.isReady) return;

        const keys = path.split(".");
        let current = this.obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || current[key] === null || typeof current[key] !== "object") {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
        await this.save();
    }

    async delete(path) {
        if (!this.isReady) return false;

        const keys = path.split(".");
        let current = this.obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || current[key] === null || typeof current[key] !== "object") {
                return false;
            }
            current = current[key];
        }

        const lastKey = keys[keys.length - 1];
        if (current && typeof current === "object" && lastKey in current) {
            delete current[lastKey];
            await this.save();
            return true;
        }

        return false;
    }

    exists(path) {
        if (!this.isReady) return false;

        const keys = path.split(".");
        let current = this.obj;

        for (const key of keys) {
            if (current === null || typeof current !== "object" || !(key in current)) {
                return false;
            }
            current = current[key];
        }

        return true;
    }
}

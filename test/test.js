import { JSON_FileHandler } from "../main.js";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetPath = join(__dirname, "target.json");

async function runTest() {
    console.log("🚀 Starting JSON_FileHandler test suite...\n");

    const handler = new JSON_FileHandler(targetPath, true, true);
    await handler.init();

    if (!handler.isReady) {
        console.error(`❌ Initialization failed. Target path checked: ${targetPath}`);
        return;
    }
    console.log("✅ Handler initialized successfully.\n");

    console.log("🔍 Testing GET (Deep Nesting)...");
    const dbName = handler.get("database.settings.dbName");
    console.log(`Database Name: ${dbName}`);
    console.log(`Initial Tags: ${handler.get("project.tags")}\n`);

    console.log("✏️ Testing SET...");
    await handler.set("database.settings.port", 5432);
    await handler.set("project.status", "production");
    await handler.set("meta.author.name", "DeveloperX");

    console.log(`Updated Port: ${handler.get("database.settings.port")}`);
    console.log(`New Author Path: ${handler.get("meta.author.name")}\n`);

    console.log("❓ Testing EXISTS...");
    console.log(`Does 'project.status' exist? ${handler.exists("project.status")}`);
    console.log(`Does 'invalid.path' exist? ${handler.exists("invalid.path")}\n`);

    console.log("🗑️ Testing DELETE...");
    const isDeleted = await handler.delete("project.tags");
    console.log(`Tags deleted successfully? ${isDeleted}`);
    console.log(`Check deleted key: ${handler.get("project.tags")}\n`);

    console.log("👀 Testing External File Watcher...");
    console.log("Manually updating target.json in 2 seconds...");

    setTimeout(async () => {
        try {
            const currentData = JSON.parse(await fs.readFile(targetPath, "utf-8"));
            currentData.project.version = "2.0.0-beta";
            await fs.writeFile(targetPath, JSON.stringify(currentData, null, 4));

            setTimeout(() => {
                console.log(`\n🔄 Watcher triggered! New Version in memory: ${handler.get("project.version")}`);
                console.log("\n🏁 Test suite completed successfully!");
                process.exit(0);
            }, 500);
        } catch (err) {
            console.error("Error during external write simulation:", err.message);
            process.exit(1);
        }
    }, 2000);
}

runTest().catch(console.error);

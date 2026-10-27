import { GROUP_ORDER } from "./convert/legacy-convert.js";
import { migrate } from "./migrate.js";

const RESOURCE = typeof GetParentResourceName === "function" ? GetParentResourceName() : "vMenu";

const ui = {};
let copied = false;
let docsUrl = "";

for (const id of ["panel", "summary", "groups", "skipped-box", "skipped-title", "skipped", "code", "status", "copy", "close", "alt", "docs-url", "docs"]) {
    ui[id] = document.getElementById(id);
}

function say(text, tone) {
    ui.status.textContent = text;
    ui.status.className = "status" + (tone ? " " + tone : "");
}

function render(items, chosen) {
    const counts = new Map();

    for (const item of chosen) {
        counts.set(item.group, (counts.get(item.group) || 0) + 1);
    }

    ui.groups.replaceChildren(...GROUP_ORDER.filter(group => counts.has(group)).map(group => {
        const row = document.createElement("li");
        const name = document.createElement("span");
        const count = document.createElement("b");

        name.textContent = group;
        count.textContent = String(counts.get(group));
        row.append(name, count);

        return row;
    }));

    const skipped = items.filter(item => item.skipped);

    ui["skipped-box"].hidden = skipped.length === 0;
    ui["skipped-title"].textContent = skipped.length + " item(s) could not be brought over";
    ui.skipped.textContent = skipped.map(item => item.group + ": " + item.name + "\n    " + item.skipped).join("\n\n");

    ui.summary.textContent = chosen.length + " item(s) found. Copy the code and paste it into vMenu once.";
}

async function open(message) {
    copied = false;
    ui.code.value = "";
    ui.copy.disabled = true;
    say("Working...", null);
    docsUrl = typeof message.docsUrl === "string" ? message.docsUrl : "";
    ui["docs-url"].value = docsUrl;
    ui.alt.hidden = docsUrl === "";
    ui.panel.hidden = false;

    try {
        const { items, chosen, code } = await migrate(message.resource, message.entries || [], message.lookups);

        render(items, chosen);

        if (!code) {
            say("Nothing usable was found in your old saves.", "bad");
            return;
        }

        ui.code.value = code;
        ui.copy.disabled = false;
        say("", null);
    } catch (problem) {
        console.error("[vMenu Migrator]", problem);
        say("Your old saves could not be converted. Press F8 for details.", "bad");
    }
}

function copyFrom(field) {
    field.focus();
    field.select();

    let done = false;

    try {
        done = document.execCommand("copy");
    } catch {
        done = false;
    }

    field.setSelectionRange(0, 0);

    return done;
}

function copy() {
    if (copyFrom(ui.code)) {
        copied = true;
        say("Copied. Now paste it in vMenu > Misc Settings > Import & Export > Paste A Code.", "good");
    } else {
        say("Could not copy automatically. Click the code, press Ctrl + A, then Ctrl + C.", "bad");
    }
}

function openDocs() {
    if (!docsUrl) return;

    if (typeof window.invokeNative === "function") {
        try {
            window.invokeNative("openUrl", docsUrl);
            say("The online tool was opened in your browser.", "good");
            return;
        } catch {}
    }

    if (copyFrom(ui["docs-url"])) {
        say("Link copied. Paste it in your browser to open the online tool.", "good");
    } else {
        say("Could not open the link. Click it, press Ctrl + A, then Ctrl + C.", "bad");
    }
}

function close() {
    ui.panel.hidden = true;

    fetch("https://" + RESOURCE + "/close", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ copied }),
    }).catch(() => {});
}

ui.copy.addEventListener("click", copy);
ui.close.addEventListener("click", close);
ui.docs.addEventListener("click", openDocs);

window.addEventListener("message", event => {
    if (event.data && event.data.action === "open") {
        open(event.data);
    }
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape" && !ui.panel.hidden) {
        close();
    }
});

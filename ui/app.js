import { GROUP_ORDER } from "./convert/legacy-convert.js";
import { migrate } from "./migrate.js";

const RESOURCE = typeof GetParentResourceName === "function" ? GetParentResourceName() : "vMenu";

const ui = {};
let copied = false;

for (const id of ["panel", "summary", "groups", "skipped-box", "skipped-title", "skipped", "code", "status", "copy", "close"]) {
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

function copy() {
    ui.code.focus();
    ui.code.select();

    let done = false;

    try {
        done = document.execCommand("copy");
    } catch {
        done = false;
    }

    ui.code.setSelectionRange(0, 0);

    if (done) {
        copied = true;
        say("Copied. Now paste it in vMenu > Misc Settings > Import & Export > Paste A Code.", "good");
    } else {
        say("Could not copy automatically. Click the code, press Ctrl + A, then Ctrl + C.", "bad");
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

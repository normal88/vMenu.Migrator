import { convert, makeLookups, parseCommentedJson } from "./convert/legacy-convert.js";
import { encodeCode } from "./convert/vmenu-code.js";

const FORMAT = "vmenu.enhanced.kvp";

const utf8 = new TextEncoder();

export function pack(type, value) {
    if (type === "s") {
        const bytes = utf8.encode(value);
        const length = bytes.length;
        let head;

        if (length < 32) {
            head = [0xa0 | length];
        } else if (length < 0x100) {
            head = [0xd9, length];
        } else if (length < 0x10000) {
            head = [0xda, length >> 8, length & 0xff];
        } else {
            head = [0xdb, (length >>> 24) & 0xff, (length >>> 16) & 0xff, (length >>> 8) & 0xff, length & 0xff];
        }

        const out = new Uint8Array(head.length + length);

        out.set(head);
        out.set(bytes, head.length);

        return out;
    }

    if (type === "f") {
        const out = new Uint8Array(9);

        out[0] = 0xcb;
        new DataView(out.buffer).setFloat64(1, value);

        return out;
    }

    const out = new Uint8Array(5);

    out[0] = 0xd2;
    new DataView(out.buffer).setInt32(1, value | 0);

    return out;
}

function loadLookups(raw) {
    const parse = text => {
        try {
            return parseCommentedJson(text || "");
        } catch {
            return {};
        }
    };

    return makeLookups({
        pedModels: parse(raw.pedModels),
        weapons: parse(raw.weapons),
        weaponComponents: parse(raw.weaponComponents),
    });
}

function kept(items) {
    const usable = items.filter(item => !item.skipped);
    const keys = new Set(usable.map(item => item.key));

    return usable.filter(item => !item.requires || item.requires.some(key => keys.has(key)));
}

export async function migrate(resource, entries, rawLookups) {
    const stored = new Map(entries.map(entry => ["res:" + resource + ":" + entry.key, pack(entry.type, entry.value)]));
    const items = convert(stored, resource, loadLookups(rawLookups || {}));
    const chosen = kept(items);

    if (chosen.length === 0) {
        return { items, chosen, code: "" };
    }

    const bundle = {
        format: FORMAT,
        version: 1,
        createdAt: new Date().toISOString(),
        entries: chosen.map(item => ({ key: item.key, raw: item.raw })),
    };

    return { items, chosen, code: await encodeCode(JSON.stringify(bundle)) };
}

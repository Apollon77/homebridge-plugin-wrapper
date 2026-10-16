#!/usr/bin/env node
/**
 * Copies Homebridge and HAP-NodeJS into this package (folders `homebridge/` and `hap-nodejs/`).
 *
 * Why copies: the wrapper does not publish a bridge, so the network and crypto stack of HAP-NodeJS (mDNS, pairing,
 * encryption) and the Matter runtime of Homebridge are not needed. Only the files that are really loaded are copied;
 * the remaining heavy modules are replaced by mocks in index.js (mock-require).
 *
 * What happens:
 * - HAP-NodeJS (CommonJS) is copied as is (only *.js), plus one patch (MAX_ACCESSORIES / MAX_SERVICES).
 * - Homebridge (ESM since 2.0) is copied starting from server.js, user.js and logger.js with all statically imported
 *   files (no Matter runtime: it is only loaded dynamically if Matter is enabled) and converted to CommonJS with
 *   esbuild, so that it can be required and mocked like before. `@homebridge/hap-nodejs` is redirected to the copy.
 * - homebridge/version.js is generated (Homebridge reads its own package.json, which is not copied).
 *
 * Usage: node scripts/vendor.mjs [homebridgeVersion]   (default: the version below)
 * Afterwards: update the dependencies in package.json if HAP-NodeJS or Homebridge got new ones (see output).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const HOMEBRIDGE_VERSION = process.argv[2] || '2.4.0';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOMEBRIDGE_DIR = path.join(ROOT, 'homebridge');
const HAP_DIR = path.join(ROOT, 'hap-nodejs');

/** Entry points of Homebridge that index.js loads */
const HOMEBRIDGE_ENTRIES = ['server.js', 'user.js', 'logger.js'];

/** Changes to the original files: [file relative to the copy, search, replacement] */
const HAP_PATCHES = [
    // the wrapper does not publish the bridge, so the HomeKit limits do not apply
    ['lib/Accessory.js', /const MAX_ACCESSORIES = \d+;/, 'const MAX_ACCESSORIES = 1000000;'],
    ['lib/Accessory.js', /const MAX_SERVICES = \d+;/, 'const MAX_SERVICES = 1000000;'],
];

/** Changes to the original Homebridge files (ESM source, before the conversion): [file, search, replacement] */
const HOMEBRIDGE_PATCHES = [
    // Homebridge 2 searches plugins only relative to its own location. Homebridge 1 used the paths of the main module,
    // so plugins installed next to the application (e.g. <app>/node_modules while the wrapper is hoisted) were found.
    // Both are used, the main module first (like Homebridge 1).
    [
        'pluginManager.js',
        /const paths = require\.resolve\.paths\((['"])\1\);/,
        "const paths = [...(require.main?.paths ?? []), ...(require.resolve.paths('') ?? [])];",
    ],
];

/** Lines of the ESM files that do not work in CommonJS (there __filename/__dirname exist already) */
const ESM_ONLY_LINES = [
    /^const __filename = fileURLToPath\(import\.meta\.url\);\r?\n/m,
    /^const __dirname = dirname\(__filename\);\r?\n/m,
];

function log(message) {
    console.log(`[vendor] ${message}`);
}

function listFiles(dir, base = dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full)];
    });
}

/** Statically imported local files of an ESM file (no dynamic import()) and the used packages */
function getImports(source) {
    const local = [];
    const packages = [];
    const re = /(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(source))) {
        const spec = m[1] || m[2];
        if (spec.startsWith('.')) {
            local.push(spec);
        } else if (!spec.startsWith('node:')) {
            packages.push(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
        }
    }
    return { local, packages };
}

function install(tmp) {
    log(`installing homebridge@${HOMEBRIDGE_VERSION} into ${tmp}`);
    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'vendor', version: '1.0.0', private: true }));
    execSync(`npm install --no-save --ignore-scripts --no-audit --no-fund homebridge@${HOMEBRIDGE_VERSION}`, {
        cwd: tmp,
        stdio: 'inherit',
    });
    const homebridge = path.join(tmp, 'node_modules', 'homebridge');
    const hap = path.join(tmp, 'node_modules', '@homebridge', 'hap-nodejs');
    return {
        homebridgeDist: path.join(homebridge, 'dist'),
        homebridgePackage: JSON.parse(fs.readFileSync(path.join(homebridge, 'package.json'), 'utf8')),
        hapDist: path.join(hap, 'dist'),
        hapPackage: JSON.parse(fs.readFileSync(path.join(hap, 'package.json'), 'utf8')),
    };
}

function copyHap(hapDist) {
    fs.rmSync(HAP_DIR, { recursive: true, force: true });
    const files = listFiles(hapDist).filter(f => f.endsWith('.js'));
    for (const file of files) {
        fs.mkdirSync(path.dirname(path.join(HAP_DIR, file)), { recursive: true });
        fs.copyFileSync(path.join(hapDist, file), path.join(HAP_DIR, file));
    }
    for (const [file, search, replacement] of HAP_PATCHES) {
        const target = path.join(HAP_DIR, file);
        const source = fs.readFileSync(target, 'utf8');
        if (!search.test(source)) {
            throw new Error(`Patch for ${file} does not match anymore: ${search}`);
        }
        fs.writeFileSync(target, source.replace(search, replacement));
    }
    log(`hap-nodejs: ${files.length} files copied, ${HAP_PATCHES.length} patches applied`);
}

async function convertToCommonJs(source, file) {
    for (const re of ESM_ONLY_LINES) {
        source = source.replace(re, '');
    }
    const result = await transform(source, {
        loader: 'js',
        format: 'cjs',
        platform: 'node',
        target: 'node22',
        sourcefile: file,
        // import.meta.url is used for createRequire() in pluginManager.js
        define: { 'import.meta.url': '__importMetaUrl' },
        banner: "const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;",
    });
    // In Homebridge these files are ESM: a default import of a CommonJS package is its module.exports, even if the
    // package sets __esModule (like HAP-NodeJS: `import hap from '@homebridge/hap-nodejs'`). esbuild's flag 1 is exactly
    // this Node behaviour; it is only used for packages, the converted local files keep the ESM interop between them.
    let code = result.code.replace(/__toESM\(require\("([^".][^"]*)"\)\)/g, '__toESM(require("$1"), 1)');
    // HAP-NodeJS is not a dependency, it is the copy next to this folder
    const hapPath = path.relative(path.dirname(path.join(HOMEBRIDGE_DIR, file)), HAP_DIR).replace(/\\/g, '/');
    code = code.replace(/require\("@homebridge\/hap-nodejs"\)/g, `require("${hapPath}")`);
    return code;
}

async function copyHomebridge(homebridgeDist, homebridgePackage) {
    fs.rmSync(HOMEBRIDGE_DIR, { recursive: true, force: true });
    const files = new Set();
    const packages = new Map();
    const queue = [...HOMEBRIDGE_ENTRIES];
    while (queue.length) {
        const file = queue.shift();
        if (files.has(file)) {
            continue;
        }
        files.add(file);
        const source = fs.readFileSync(path.join(homebridgeDist, file), 'utf8');
        const imports = getImports(source);
        imports.local.forEach(spec => queue.push(path.join(path.dirname(file), spec).replace(/\\/g, '/')));
        imports.packages.forEach(pkg => {
            if (!packages.has(pkg)) {
                packages.set(pkg, new Set());
            }
            packages.get(pkg).add(file);
        });
    }
    files.delete('version.js');

    for (const [file] of HOMEBRIDGE_PATCHES) {
        if (!files.has(file)) {
            throw new Error(`Patched file ${file} is not part of the copy anymore`);
        }
    }
    for (const file of files) {
        let source = fs.readFileSync(path.join(homebridgeDist, file), 'utf8');
        for (const [patchFile, search, replacement] of HOMEBRIDGE_PATCHES.filter(([f]) => f === file)) {
            if (!search.test(source)) {
                throw new Error(`Patch for ${patchFile} does not match anymore: ${search}`);
            }
            source = source.replace(search, replacement);
        }
        const target = path.join(HOMEBRIDGE_DIR, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, await convertToCommonJs(source, file));
    }

    // Homebridge reads the version from its package.json, which is not part of the copy
    const versionSource = [
        `export default function getVersion() {`,
        `    return ${JSON.stringify(homebridgePackage.version)};`,
        `}`,
        `export function getRequiredNodeVersion() {`,
        `    return ${JSON.stringify(homebridgePackage.engines.node)};`,
        `}`,
        '',
    ].join('\n');
    fs.writeFileSync(path.join(HOMEBRIDGE_DIR, 'version.js'), await convertToCommonJs(versionSource, 'version.js'));

    log(`homebridge: ${files.size + 1} files converted to CommonJS, ${HOMEBRIDGE_PATCHES.length} patches applied`);
    return packages;
}

async function main() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homebridge-vendor-'));
    try {
        const { homebridgeDist, homebridgePackage, hapDist, hapPackage } = install(tmp);
        copyHap(hapDist);
        const homebridgePackages = await copyHomebridge(homebridgeDist, homebridgePackage);

        const versions = {
            homebridge: homebridgePackage.version,
            hapNodejs: hapPackage.version,
            requiredNode: homebridgePackage.engines.node,
        };
        fs.writeFileSync(path.join(ROOT, 'vendor-versions.json'), `${JSON.stringify(versions, null, 4)}\n`);

        log(`Homebridge ${versions.homebridge}, HAP-NodeJS ${versions.hapNodejs}`);
        log('Packages imported by the Homebridge copy:');
        for (const [pkg, from] of homebridgePackages) {
            log(`  ${pkg} (${[...from].join(', ')})${pkg === '@homebridge/hap-nodejs' ? ' -> copy' : ''}`);
        }
        log(`Dependencies of HAP-NodeJS: ${Object.keys(hapPackage.dependencies).join(', ')}`);
        log('Check package.json (dependencies) and the mocks in index.js against these lists.');
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

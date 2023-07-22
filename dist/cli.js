import chalk from 'chalk';
import { InvalidArgumentError, program } from 'commander';
import log from 'loglevel';
import path from 'path';
import fsExtra from 'fs-extra';
import prompts from 'prompts';
import shelljs from 'shelljs';
import crypto from 'crypto';
import ora from 'ora';
import { fileURLToPath } from 'url';
import dns from 'dns';
import http from 'http';
import { promisify } from 'util';
import updateNotifier from 'update-notifier';
import axios from 'axios';
import { dir } from 'tmp-promise';
import { fileTypeFromBuffer } from 'file-type';
import psl from 'psl';
import isUrl from 'is-url';
import fs from 'fs';

var name = "pake-cli";
var version = "2.2.5";
var description = "🤱🏻 Turn any webpage into a desktop app with Rust. 🤱🏻 很简单的用 Rust 打包网页生成很小的桌面 App。";
var engines = {
	node: ">=16.0.0"
};
var bin = {
	pake: "./cli.js"
};
var repository = {
	type: "git",
	url: "https://github.com/tw93/pake.git"
};
var author = {
	name: "Tw93",
	email: "tw93@qq.com"
};
var keywords = [
	"pake",
	"pake-cli",
	"rust",
	"tauri",
	"no-electron",
	"productivity"
];
var files = [
	"dist",
	"src-tauri",
	"cli.js"
];
var scripts = {
	start: "npm run dev",
	dev: "npm run tauri dev",
	build: "npm run tauri build --release",
	"build:mac": "npm run tauri build -- --target universal-apple-darwin",
	"build:all-unix": "chmod +x ./script/build.sh && ./script/build.sh",
	"build:all-windows": "pwsh ./script/build.ps1",
	analyze: "cd src-tauri && cargo bloat --release --crates",
	tauri: "tauri",
	cli: "rollup -c rollup.config.js --watch",
	"cli:build": "cross-env NODE_ENV=production rollup -c rollup.config.js",
	prepublishOnly: "npm run cli:build"
};
var type = "module";
var exports = "./dist/pake.js";
var license = "MIT";
var dependencies = {
	"@tauri-apps/api": "^1.4.0",
	"@tauri-apps/cli": "^1.4.0",
	axios: "^1.1.3",
	chalk: "^5.1.2",
	commander: "^11.0.0",
	"file-type": "^18.0.0",
	"fs-extra": "^11.1.0",
	"is-url": "^1.2.4",
	loglevel: "^1.8.1",
	ora: "^6.1.2",
	prompts: "^2.4.2",
	psl: "^1.9.0",
	shelljs: "^0.8.5",
	"tmp-promise": "^3.0.3",
	"update-notifier": "^6.0.2"
};
var devDependencies = {
	"@rollup/plugin-alias": "^4.0.2",
	"@rollup/plugin-commonjs": "^23.0.2",
	"@rollup/plugin-json": "^5.0.2",
	"@rollup/plugin-terser": "^0.1.0",
	"@types/fs-extra": "^9.0.13",
	"@types/is-url": "^1.2.30",
	"@types/page-icon": "^0.3.4",
	"@types/prompts": "^2.4.1",
	"@types/psl": "^1.1.0",
	"@types/shelljs": "^0.8.11",
	"@types/tmp": "^0.2.3",
	"@types/update-notifier": "^6.0.1",
	"app-root-path": "^3.1.0",
	"cross-env": "^7.0.3",
	rollup: "^3.3.0",
	"rollup-plugin-typescript2": "^0.34.1",
	tslib: "^2.4.1",
	typescript: "^4.9.3"
};
var packageJson = {
	name: name,
	version: version,
	description: description,
	engines: engines,
	bin: bin,
	repository: repository,
	author: author,
	keywords: keywords,
	files: files,
	scripts: scripts,
	type: type,
	exports: exports,
	license: license,
	dependencies: dependencies,
	devDependencies: devDependencies
};

var windows = [
	{
		url: "https://weread.qq.com/",
		transparent: true,
		fullscreen: false,
		width: 1200,
		height: 780,
		resizable: true,
		url_type: "web"
	}
];
var user_agent = {
	macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
	linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
	windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
};
var menu = {
	macos: true,
	linux: false,
	windows: false
};
var system_tray = {
	macos: false,
	linux: true,
	windows: true
};
var pakeConf = {
	windows: windows,
	user_agent: user_agent,
	menu: menu,
	system_tray: system_tray
};

var tauri$3 = {
	security: {
		csp: null,
		dangerousRemoteDomainIpcAccess: [
			{
				domain: "weread.qq.com",
				windows: [
					"pake"
				],
				enableTauriAPI: true
			}
		]
	},
	updater: {
		active: false
	},
	systemTray: {
		iconPath: "png/weread_512.png",
		iconAsTemplate: true
	},
	allowlist: {
		all: true,
		fs: {
			all: true,
			scope: [
				"$DOWNLOAD/*"
			]
		}
	}
};
var build = {
	withGlobalTauri: true,
	devPath: "../dist",
	distDir: "../dist",
	beforeBuildCommand: "",
	beforeDevCommand: ""
};
var CommonConf = {
	"package": {
	productName: "WeRead",
	version: "1.0.0"
},
	tauri: tauri$3,
	build: build
};

var tauri$2 = {
	bundle: {
		icon: [
			"png/weread_256.ico",
			"png/weread_32.ico"
		],
		identifier: "com.pake.weread",
		active: true,
		category: "DeveloperTool",
		copyright: "",
		externalBin: [
		],
		longDescription: "",
		resources: [
			"png/weread_32.ico"
		],
		shortDescription: "",
		targets: [
			"msi"
		],
		windows: {
			certificateThumbprint: null,
			digestAlgorithm: "sha256",
			timestampUrl: "",
			wix: {
				language: [
					"en-US"
				],
				template: "assets/main.wxs"
			}
		}
	}
};
var WinConf = {
	tauri: tauri$2
};

var tauri$1 = {
	bundle: {
		icon: [
			"icons/weread.icns"
		],
		identifier: "com.pake.weread",
		active: true,
		category: "DeveloperTool",
		copyright: "",
		externalBin: [
		],
		longDescription: "",
		macOS: {
			entitlements: null,
			exceptionDomain: "",
			frameworks: [
			],
			providerShortName: null,
			signingIdentity: null
		},
		resources: [
		],
		shortDescription: "",
		targets: [
			"dmg"
		]
	}
};
var MacConf = {
	tauri: tauri$1
};

var tauri = {
	bundle: {
		icon: [
			"png/weread_512.png"
		],
		identifier: "com.pake.weread",
		active: true,
		category: "DeveloperTool",
		copyright: "",
		deb: {
			depends: [
				"curl",
				"wget"
			],
			files: {
				"/usr/share/applications/com-pake-weread.desktop": "assets/com-pake-weread.desktop"
			}
		},
		externalBin: [
		],
		longDescription: "",
		resources: [
		],
		shortDescription: "",
		targets: [
			"deb",
			"appimage"
		]
	}
};
var LinuxConf = {
	tauri: tauri
};

const platformConfigs = {
    win32: WinConf,
    darwin: MacConf,
    linux: LinuxConf,
};
const { platform: platform$2 } = process;
// @ts-ignore
const platformConfig = platformConfigs[platform$2];
let tauriConfig = {
    tauri: {
        ...CommonConf.tauri,
        bundle: platformConfig.tauri.bundle,
    },
    package: CommonConf.package,
    build: CommonConf.build,
    pake: pakeConf,
};

// Generates an identifier based on the given URL.
function getIdentifier(url) {
    const postFixHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 6);
    return `com.pake.${postFixHash}`;
}
async function promptText(message, initial) {
    const response = await prompts({
        type: 'text',
        name: 'content',
        message,
        initial,
    });
    return response.content;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getSpinner(text) {
    const loadingType = {
        interval: 80,
        frames: ['✦', '✶', '✺', '✵', '✸', '✹', '✺'],
    };
    return ora({
        text: `${chalk.cyan(text)}\n`,
        spinner: loadingType,
        color: 'cyan',
    }).start();
}

const { platform: platform$1 } = process;
const IS_MAC = platform$1 === 'darwin';
const IS_WIN = platform$1 === 'win32';
const IS_LINUX = platform$1 === 'linux';

// Convert the current module URL to a file path
const currentModulePath = fileURLToPath(import.meta.url);
// Resolve the parent directory of the current module
const npmDirectory = path.join(path.dirname(currentModulePath), '..');

function shellExec(command) {
    return new Promise((resolve, reject) => {
        shelljs.exec(command, { async: true, silent: false, cwd: npmDirectory }, code => {
            if (code === 0) {
                resolve(0);
            }
            else {
                reject(new Error(`${code}`));
            }
        });
    });
}

const logger = {
    info(...msg) {
        log.info(...msg.map(m => chalk.white(m)));
    },
    debug(...msg) {
        log.debug(...msg);
    },
    error(...msg) {
        log.error(...msg.map(m => chalk.red(m)));
    },
    warn(...msg) {
        log.info(...msg.map(m => chalk.yellow(m)));
    },
    success(...msg) {
        log.info(...msg.map(m => chalk.green(m)));
    },
};

const resolve = promisify(dns.resolve);
const ping = async (host) => {
    const lookup = promisify(dns.lookup);
    const ip = await lookup(host);
    const start = new Date();
    // Prevent timeouts from affecting user experience.
    const requestPromise = new Promise((resolve, reject) => {
        const req = http.get(`http://${ip.address}`, res => {
            const delay = new Date().getTime() - start.getTime();
            res.resume();
            resolve(delay);
        });
        req.on('error', err => {
            reject(err);
        });
    });
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out after 3 seconds'));
        }, 1000);
    });
    return Promise.race([requestPromise, timeoutPromise]);
};
async function isChinaDomain(domain) {
    try {
        const [ip] = await resolve(domain);
        return await isChinaIP(ip, domain);
    }
    catch (error) {
        logger.debug(`${domain} can't be parse!`);
        return true;
    }
}
async function isChinaIP(ip, domain) {
    try {
        const delay = await ping(ip);
        logger.debug(`${domain} latency is ${delay} ms`);
        return delay > 1000;
    }
    catch (error) {
        logger.debug(`ping ${domain} failed!`);
        return true;
    }
}

async function installRust() {
    const isActions = process.env.GITHUB_ACTIONS;
    const isInChina = await isChinaDomain('sh.rustup.rs');
    const rustInstallScriptForMac = isInChina && !isActions
        ? 'export RUSTUP_DIST_SERVER="https://rsproxy.cn" && export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup" && curl --proto "=https" --tlsv1.2 -sSf https://rsproxy.cn/rustup-init.sh | sh'
        : "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";
    const rustInstallScriptForWindows = 'winget install --id Rustlang.Rustup';
    const spinner = getSpinner('Downloading Rust...');
    try {
        await shellExec(IS_WIN ? rustInstallScriptForWindows : rustInstallScriptForMac);
        spinner.succeed(chalk.green('Rust installed successfully!'));
    }
    catch (error) {
        console.error('Error installing Rust:', error.message);
        spinner.fail(chalk.red('Rust installation failed!'));
        process.exit(1);
    }
}
function checkRustInstalled() {
    return shelljs.exec('rustc --version', { silent: true }).code === 0;
}

async function mergeConfig(url, options, tauriConf) {
    const { width, height, fullscreen, transparent, userAgent, showMenu, showSystemTray, systemTrayIcon, iterCopyFile, identifier, name, resizable = true, } = options;
    const { platform } = process;
    // Set Windows parameters.
    const tauriConfWindowOptions = {
        width,
        height,
        fullscreen,
        transparent,
        resizable,
    };
    Object.assign(tauriConf.pake.windows[0], { url, ...tauriConfWindowOptions });
    tauriConf.package.productName = name;
    tauriConf.tauri.bundle.identifier = identifier;
    //Judge the type of URL, whether it is a file or a website.
    const pathExists = await fsExtra.pathExists(url);
    if (pathExists) {
        logger.warn('✼ Your input might be a local file.');
        tauriConf.pake.windows[0].url_type = 'local';
        const fileName = path.basename(url);
        const dirName = path.dirname(url);
        const distDir = path.join(npmDirectory, 'dist');
        const distBakDir = path.join(npmDirectory, 'dist_bak');
        if (!iterCopyFile) {
            const urlPath = path.join(distDir, fileName);
            await fsExtra.copy(url, urlPath);
        }
        else {
            fsExtra.moveSync(distDir, distBakDir, { overwrite: true });
            fsExtra.copySync(dirName, distDir, { overwrite: true });
            const filesToCopyBack = ['cli.js', 'about_pake.html'];
            await Promise.all(filesToCopyBack.map(file => fsExtra.copy(path.join(distBakDir, file), path.join(distDir, file))));
        }
        tauriConf.pake.windows[0].url = fileName;
        tauriConf.pake.windows[0].url_type = 'local';
    }
    else {
        tauriConf.pake.windows[0].url_type = 'web';
        // Set the secure domain for calling window.__TAURI__ to the application domain that has been set.
        tauriConf.tauri.security.dangerousRemoteDomainIpcAccess[0].domain = new URL(url).hostname;
    }
    const platformMap = {
        win32: 'windows',
        linux: 'linux',
        darwin: 'macos',
    };
    const currentPlatform = platformMap[platform];
    if (userAgent.length > 0) {
        tauriConf.pake.user_agent[currentPlatform] = userAgent;
    }
    tauriConf.pake.menu[currentPlatform] = showMenu;
    tauriConf.pake.system_tray[currentPlatform] = showSystemTray;
    // Processing targets are currently only open to Linux.
    if (platform === 'linux') {
        delete tauriConf.tauri.bundle.deb.files;
        const validTargets = ['all', 'deb', 'appimage'];
        if (validTargets.includes(options.targets)) {
            tauriConf.tauri.bundle.targets =
                options.targets === 'all' ? ['deb', 'appimage'] : [options.targets];
        }
        else {
            logger.warn(`✼ The target must be one of ${validTargets.join(', ')}, the default 'deb' will be used.`);
        }
    }
    // Set icon.
    const platformIconMap = {
        win32: {
            fileExt: '.ico',
            path: `png/${name.toLowerCase()}_256.ico`,
            defaultIcon: 'png/icon_256.ico',
            message: 'Windows icon must be .ico and 256x256px.',
        },
        linux: {
            fileExt: '.png',
            path: `png/${name.toLowerCase()}_512.png`,
            defaultIcon: 'png/icon_512.png',
            message: 'Linux icon must be .png and 512x512px.',
        },
        darwin: {
            fileExt: '.icns',
            path: `icons/${name.toLowerCase()}.icns`,
            defaultIcon: 'icons/icon.icns',
            message: 'macOS icon must be .icns type.',
        },
    };
    const iconInfo = platformIconMap[platform];
    const exists = await fsExtra.pathExists(options.icon);
    if (exists) {
        let updateIconPath = true;
        let customIconExt = path.extname(options.icon).toLowerCase();
        if (customIconExt !== iconInfo.fileExt) {
            updateIconPath = false;
            logger.warn(`✼ ${iconInfo.message}, but you give ${customIconExt}`);
            tauriConf.tauri.bundle.icon = [iconInfo.defaultIcon];
        }
        else {
            const iconPath = path.join(npmDirectory, 'src-tauri/', iconInfo.path);
            tauriConf.tauri.bundle.resources = [iconInfo.path];
            await fsExtra.copy(options.icon, iconPath);
        }
        if (updateIconPath) {
            tauriConf.tauri.bundle.icon = [options.icon];
        }
        else {
            logger.warn(`✼ Icon will remain as default.`);
        }
    }
    else {
        logger.warn('✼ Custom icon path may be invalid, default icon will be used instead.');
        tauriConf.tauri.bundle.icon = [iconInfo.defaultIcon];
    }
    // Set tray icon path.
    let trayIconPath = platform === 'darwin' ? 'png/icon_512.png' : tauriConf.tauri.bundle.icon[0];
    if (systemTrayIcon.length > 0) {
        try {
            await fsExtra.pathExists(systemTrayIcon);
            // 需要判断图标格式，默认只支持ico和png两种
            let iconExt = path.extname(systemTrayIcon).toLowerCase();
            if (iconExt == '.png' || iconExt == '.ico') {
                const trayIcoPath = path.join(npmDirectory, `src-tauri/png/${name.toLowerCase()}${iconExt}`);
                trayIconPath = `png/${name.toLowerCase()}${iconExt}`;
                await fsExtra.copy(systemTrayIcon, trayIcoPath);
            }
            else {
                logger.warn(`✼ System tray icon must be .ico or .png, but you provided ${iconExt}.`);
                logger.warn(`✼ Default system tray icon will be used.`);
            }
        }
        catch {
            logger.warn(`✼ ${systemTrayIcon} not exists!`);
            logger.warn(`✼ Default system tray icon will remain unchanged.`);
        }
    }
    tauriConf.tauri.systemTray.iconPath = trayIconPath;
    // Save config file.
    const platformConfigPaths = {
        win32: 'src-tauri/tauri.windows.conf.json',
        darwin: 'src-tauri/tauri.macos.conf.json',
        linux: 'src-tauri/tauri.linux.conf.json',
    };
    const configPath = path.join(npmDirectory, platformConfigPaths[platform]);
    const bundleConf = { tauri: { bundle: tauriConf.tauri.bundle } };
    await fsExtra.writeJson(configPath, bundleConf, { spaces: 4 });
    const pakeConfigPath = path.join(npmDirectory, 'src-tauri/pake.json');
    await fsExtra.writeJson(pakeConfigPath, tauriConf.pake, { spaces: 4 });
    let tauriConf2 = JSON.parse(JSON.stringify(tauriConf));
    delete tauriConf2.pake;
    delete tauriConf2.tauri.bundle;
    const configJsonPath = path.join(npmDirectory, 'src-tauri/tauri.conf.json');
    await fsExtra.writeJson(configJsonPath, tauriConf2, { spaces: 4 });
}

class BaseBuilder {
    constructor(options) {
        this.options = options;
    }
    async prepare() {
        const tauriSrcPath = path.join(npmDirectory, 'src-tauri');
        const tauriTargetPath = path.join(tauriSrcPath, 'target');
        const tauriTargetPathExists = await fsExtra.pathExists(tauriTargetPath);
        if (!IS_MAC && !tauriTargetPathExists) {
            logger.warn('✼ The first use requires installing system dependencies.');
            logger.warn('✼ See more in https://tauri.app/v1/guides/getting-started/prerequisites.');
        }
        if (!checkRustInstalled()) {
            const res = await prompts({
                type: 'confirm',
                message: 'Rust not detected. Install now?',
                name: 'value',
            });
            if (res.value) {
                await installRust();
            }
            else {
                logger.error('✕ Rust required to package your webapp.');
                process.exit(0);
            }
        }
        const isChina = await isChinaDomain('www.npmjs.com');
        const spinner = getSpinner('Installing package...');
        const rustProjectDir = path.join(tauriSrcPath, '.cargo');
        const projectConf = path.join(rustProjectDir, 'config');
        await fsExtra.ensureDir(rustProjectDir);
        if (isChina) {
            logger.info('✺ Located in China, using npm/rsProxy CN mirror.');
            const projectCnConf = path.join(tauriSrcPath, 'rust_proxy.toml');
            await fsExtra.copy(projectCnConf, projectConf);
            await shellExec(`cd "${npmDirectory}" && npm install --registry=https://registry.npmmirror.com`);
        }
        else {
            await shellExec(`cd "${npmDirectory}" && npm install`);
        }
        spinner.succeed(chalk.green('Package installed!'));
        if (!tauriTargetPathExists) {
            logger.warn('✼ The first packaging may be slow, please be patient and wait, it will be faster afterwards.');
        }
    }
    async build(url) {
        await this.buildAndCopy(url, this.options.targets);
    }
    async buildAndCopy(url, target) {
        const { name } = this.options;
        await mergeConfig(url, this.options, tauriConfig);
        // Build app
        const spinner = getSpinner('Building app...');
        setTimeout(() => spinner.stop(), 3000);
        await shellExec(`cd "${npmDirectory}" && ${this.getBuildCommand()}`);
        // Copy app
        const fileName = this.getFileName();
        const fileType = this.getFileType(target);
        const appPath = this.getBuildAppPath(npmDirectory, fileName, fileType);
        const distPath = path.resolve(`${name}.${fileType}`);
        await fsExtra.copy(appPath, distPath);
        await fsExtra.remove(appPath);
        logger.success('✔ Build success!');
        logger.success('✔ App installer located in', distPath);
    }
    getFileType(target) {
        return target;
    }
    getBuildCommand() {
        return 'npm run build';
    }
    getBasePath() {
        return 'src-tauri/target/release/bundle/';
    }
    getBuildAppPath(npmDirectory, fileName, fileType) {
        return path.join(npmDirectory, this.getBasePath(), fileType.toLowerCase(), `${fileName}.${fileType}`);
    }
}

class MacBuilder extends BaseBuilder {
    constructor(options) {
        super(options);
        this.options.targets = 'dmg';
    }
    getFileName() {
        const { name } = this.options;
        let arch;
        if (this.options.multiArch) {
            arch = 'universal';
        }
        else {
            arch = process.arch === 'arm64' ? 'aarch64' : process.arch;
        }
        return `${name}_${tauriConfig.package.version}_${arch}`;
    }
    getBuildCommand() {
        return this.options.multiArch ? 'npm run build:mac' : super.getBuildCommand();
    }
    getBasePath() {
        return this.options.multiArch
            ? 'src-tauri/target/universal-apple-darwin/release/bundle'
            : super.getBasePath();
    }
}

class WinBuilder extends BaseBuilder {
    constructor(options) {
        super(options);
        this.options.targets = 'msi';
    }
    getFileName() {
        const { name } = this.options;
        const { arch } = process;
        const language = tauriConfig.tauri.bundle.windows.wix.language[0];
        return `${name}_${tauriConfig.package.version}_${arch}_${language}`;
    }
}

class LinuxBuilder extends BaseBuilder {
    constructor(options) {
        super(options);
    }
    getFileName() {
        const { name } = this.options;
        const arch = process.arch === 'x64' ? 'amd64' : process.arch;
        return `${name}_${tauriConfig.package.version}_${arch}`;
    }
    // Customize it, considering that there are all targets.
    async build(url) {
        const targetTypes = ['deb', 'appimage'];
        for (const target of targetTypes) {
            if (this.options.targets === target || this.options.targets === 'all') {
                await this.buildAndCopy(url, target);
            }
        }
    }
    getFileType(target) {
        if (target === 'appimage') {
            return 'AppImage';
        }
        return super.getFileType(target);
    }
}

const { platform } = process;
const buildersMap = {
    darwin: MacBuilder,
    win32: WinBuilder,
    linux: LinuxBuilder,
};
class BuilderProvider {
    static create(options) {
        const Builder = buildersMap[platform];
        if (!Builder) {
            throw new Error('The current system is not supported!');
        }
        return new Builder(options);
    }
}

const DEFAULT_PAKE_OPTIONS = {
    icon: '',
    height: 780,
    width: 1200,
    fullscreen: false,
    resizable: true,
    transparent: false,
    userAgent: '',
    showMenu: false,
    showSystemTray: false,
    multiArch: false,
    targets: 'deb',
    iterCopyFile: false,
    systemTrayIcon: '',
    debug: false,
};

async function checkUpdateTips() {
    updateNotifier({ pkg: packageJson, updateCheckInterval: 1000 * 60 }).notify({ isGlobal: true });
}

async function handleIcon(options) {
    if (options.icon) {
        if (options.icon.startsWith('http')) {
            return downloadIcon(options.icon);
        }
        else {
            return path.resolve(options.icon);
        }
    }
    else {
        logger.warn('✼ No icon given, default in use. For a custom icon, use --icon option.');
        const iconPath = IS_WIN
            ? 'src-tauri/png/icon_256.ico'
            : IS_LINUX
                ? 'src-tauri/png/icon_512.png'
                : 'src-tauri/icons/icon.icns';
        return path.join(npmDirectory, iconPath);
    }
}
async function downloadIcon(iconUrl) {
    const spinner = getSpinner('Downloading icon...');
    try {
        const iconResponse = await axios.get(iconUrl, { responseType: 'arraybuffer' });
        const iconData = await iconResponse.data;
        if (!iconData) {
            return null;
        }
        const fileDetails = await fileTypeFromBuffer(iconData);
        if (!fileDetails) {
            return null;
        }
        const { path: tempPath } = await dir();
        let iconPath = `${tempPath}/icon.${fileDetails.ext}`;
        // Fix this for linux
        if (IS_LINUX) {
            iconPath = 'png/linux_temp.png';
            await fsExtra.outputFile(`${npmDirectory}/src-tauri/${iconPath}`, iconData);
        }
        else {
            await fsExtra.outputFile(iconPath, iconData);
        }
        await fsExtra.outputFile(iconPath, iconData);
        spinner.succeed(chalk.green('Icon downloaded successfully!'));
        return iconPath;
    }
    catch (error) {
        spinner.fail(chalk.red('Icon download failed!'));
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

// Extracts the domain from a given URL.
function getDomain(inputUrl) {
    try {
        const url = new URL(inputUrl);
        // Use PSL to parse domain names.
        const parsed = psl.parse(url.hostname);
        // If domain is available, split it and return the SLD.
        if ('domain' in parsed && parsed.domain) {
            return parsed.domain.split('.')[0];
        }
        else {
            return null;
        }
    }
    catch (error) {
        return null;
    }
}
// Appends 'https://' protocol to the URL if not present.
function appendProtocol(inputUrl) {
    try {
        new URL(inputUrl);
        return inputUrl;
    }
    catch {
        return `https://${inputUrl}`;
    }
}
// Normalizes the URL by ensuring it has a protocol and is valid.
function normalizeUrl(urlToNormalize) {
    const urlWithProtocol = appendProtocol(urlToNormalize);
    if (isUrl(urlWithProtocol)) {
        return urlWithProtocol;
    }
    else {
        throw new Error(`Your url "${urlWithProtocol}" is invalid`);
    }
}

function resolveAppName(name, platform) {
    const domain = getDomain(name) || 'pake';
    return platform !== 'linux' ? capitalizeFirstLetter(domain) : domain;
}
function isValidName(name, platform) {
    const platformRegexMapping = {
        linux: /^[a-z0-9]+(-[a-z0-9]+)*$/,
        default: /^[a-zA-Z0-9]+$/,
    };
    const reg = platformRegexMapping[platform] || platformRegexMapping.default;
    return !!name && reg.test(name);
}
async function handleOptions(options, url) {
    const { platform } = process;
    const isActions = process.env.GITHUB_ACTIONS;
    let name = options.name;
    const pathExists = await fsExtra.pathExists(url);
    if (!options.name) {
        const defaultName = pathExists ? '' : resolveAppName(url, platform);
        const promptMessage = 'Enter your application name';
        const namePrompt = await promptText(promptMessage, defaultName);
        name = namePrompt || defaultName;
    }
    if (!isValidName(name, platform)) {
        const LINUX_NAME_ERROR = `✕ name should only include lowercase letters, numbers, and dashes, and must contain at least one lowercase letter. Examples: com-123-xxx, 123pan, pan123, weread, we-read.`;
        const DEFAULT_NAME_ERROR = `✕ Name should only include letters and numbers, and must contain at least one letter. Examples: 123pan, 123Pan, Pan123, weread, WeRead, WERead.`;
        const errorMsg = platform === 'linux' ? LINUX_NAME_ERROR : DEFAULT_NAME_ERROR;
        logger.error(errorMsg);
        if (isActions) {
            name = resolveAppName(url, platform);
            logger.warn(`✼ Inside github actions, use the default name: ${name}`);
        }
        else {
            process.exit(1);
        }
    }
    const appOptions = {
        ...options,
        name,
        identifier: getIdentifier(url),
    };
    appOptions.icon = await handleIcon(appOptions);
    return appOptions;
}

function validateNumberInput(value) {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
function validateUrlInput(url) {
    const isFile = fs.existsSync(url);
    if (!isFile) {
        try {
            return normalizeUrl(url);
        }
        catch (error) {
            throw new InvalidArgumentError(error.message);
        }
    }
    return url;
}

const { green, yellow } = chalk;
const logo = `${chalk.green(' ____       _')}
${green('|  _ \\ __ _| | _____')}
${green('| |_) / _` | |/ / _ \\')}
${green('|  __/ (_| |   <  __/')}  ${yellow('https://github.com/tw93/pake')}
${green('|_|   \\__,_|_|\\_\\___|  can turn any webpage into a desktop app with Rust.')}
`;
program
    .addHelpText('beforeAll', logo)
    .usage(`[url] [options]`)
    .showHelpAfterError();
program
    .argument('[url]', 'The web URL you want to package', validateUrlInput)
    .option('--name <string>', 'Application name')
    .option('--icon <string>', 'Application icon', DEFAULT_PAKE_OPTIONS.icon)
    .option('--width <number>', 'Window width', validateNumberInput, DEFAULT_PAKE_OPTIONS.width)
    .option('--height <number>', 'Window height', validateNumberInput, DEFAULT_PAKE_OPTIONS.height)
    .option('--transparent', 'Only for Mac, hide title bar', DEFAULT_PAKE_OPTIONS.transparent)
    .option('--fullscreen', 'Start in full screen', DEFAULT_PAKE_OPTIONS.fullscreen)
    .option('--user-agent <string>', 'Custom user agent', DEFAULT_PAKE_OPTIONS.userAgent)
    .option('--show-menu', 'Show menu in app', DEFAULT_PAKE_OPTIONS.showMenu)
    .option('--show-system-tray', 'Show system tray in app', DEFAULT_PAKE_OPTIONS.showSystemTray)
    .option('--system-tray-icon <string>', 'Custom system tray icon', DEFAULT_PAKE_OPTIONS.systemTrayIcon)
    .option('--iter-copy-file', 'Copy files when URL is a local file', DEFAULT_PAKE_OPTIONS.iterCopyFile)
    .option('--multi-arch', 'Only for Mac, supports both Intel and M1', DEFAULT_PAKE_OPTIONS.multiArch)
    .option('--targets <string>', 'Only for Linux, option "deb" or "appimage"', DEFAULT_PAKE_OPTIONS.targets)
    .option('--debug', 'Debug mode', DEFAULT_PAKE_OPTIONS.debug)
    .version(packageJson.version, '-v, --version', 'Output the current version')
    .action(async (url, options) => {
    await checkUpdateTips();
    if (!url) {
        program.outputHelp(str => {
            return str
                .split('\n')
                .filter(line => !/((-h,|--help)|((-v|-V),|--version))\s+.+$/.test(line))
                .join('\n');
        });
        process.exit(0);
    }
    log.setDefaultLevel('info');
    if (options.debug) {
        log.setLevel('debug');
    }
    const appOptions = await handleOptions(options, url);
    log.debug('PakeAppOptions', appOptions);
    const builder = BuilderProvider.create(appOptions);
    await builder.prepare();
    await builder.build(url);
});
program.parse();

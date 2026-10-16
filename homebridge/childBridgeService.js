const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var childBridgeService_exports = {};
__export(childBridgeService_exports, {
  ChildBridgeService: () => ChildBridgeService,
  ChildBridgeStatus: () => ChildBridgeStatus,
  ChildProcessMessageEventType: () => ChildProcessMessageEventType
});
module.exports = __toCommonJS(childBridgeService_exports);
var import_node_child_process = require("node:child_process");
var import_node_path = require("node:path");
var import_node_process = __toESM(require("node:process"), 1);
var import_node_url = require("node:url");
var import_fs_extra = __toESM(require("fs-extra"), 1);
var import_logger = require("./logger.js");
var import_user = require("./user.js");
const COLON_RE = /:/g;
var ChildProcessMessageEventType;
(function(ChildProcessMessageEventType2) {
  ChildProcessMessageEventType2["READY"] = "ready";
  ChildProcessMessageEventType2["LOAD"] = "load";
  ChildProcessMessageEventType2["LOADED"] = "loaded";
  ChildProcessMessageEventType2["START"] = "start";
  ChildProcessMessageEventType2["ONLINE"] = "online";
  ChildProcessMessageEventType2["PORT_REQUEST"] = "portRequest";
  ChildProcessMessageEventType2["PORT_ALLOCATED"] = "portAllocated";
  ChildProcessMessageEventType2["STATUS_UPDATE"] = "status";
  ChildProcessMessageEventType2["START_MATTER_MONITORING"] = "startMatterMonitoring";
  ChildProcessMessageEventType2["STOP_MATTER_MONITORING"] = "stopMatterMonitoring";
  ChildProcessMessageEventType2["GET_MATTER_ACCESSORIES"] = "getMatterAccessories";
  ChildProcessMessageEventType2["GET_MATTER_ACCESSORY_INFO"] = "getMatterAccessoryInfo";
  ChildProcessMessageEventType2["MATTER_ACCESSORY_CONTROL"] = "matterAccessoryControl";
  ChildProcessMessageEventType2["RELEASE_MATTER_PORT"] = "releaseMatterPort";
  ChildProcessMessageEventType2["MATTER_EVENT"] = "matterEvent";
})(ChildProcessMessageEventType || (ChildProcessMessageEventType = {}));
var ChildBridgeStatus;
(function(ChildBridgeStatus2) {
  ChildBridgeStatus2["PENDING"] = "pending";
  ChildBridgeStatus2["OK"] = "ok";
  ChildBridgeStatus2["DOWN"] = "down";
})(ChildBridgeStatus || (ChildBridgeStatus = {}));
class ChildBridgeService {
  type;
  identifier;
  plugin;
  bridgeConfig;
  homebridgeConfig;
  homebridgeOptions;
  api;
  ipcService;
  externalPortService;
  child;
  args = [];
  processEnv = {};
  shuttingDown = false;
  lastBridgeStatus = "pending";
  pairedStatus = null;
  manuallyStopped = false;
  setupUri = null;
  matterCommissioningInfo;
  pluginConfig = [];
  log;
  displayName;
  restartCount = 0;
  maxRestarts = 4;
  scheduledRestartTimeout;
  // Wall-clock time (ms) the current child last reported ONLINE, or undefined
  // if it has not come up yet. Used to tell a healthy bridge that hit a
  // transient fault apart from a tight crash loop — see handleProcessClose.
  childOnlineSince;
  // A child that stayed up at least this long before an unexpected exit is
  // treated as "unlucky" rather than "broken": its restart count is reset so
  // an occasional transient crash on a long-lived bridge never accumulates
  // toward a permanent shutdown. 5 minutes is comfortably longer than any
  // normal startup and shorter than real uptime, so a crash loop (which dies
  // within seconds) never qualifies.
  stableRunResetMs = 5 * 60 * 1e3;
  // Matter accessories pending response callback. Concurrent callers of
  // requestMatterAccessories share the same in-flight promise (see
  // matterAccessoriesPromise) so this resolver only needs to settle once.
  matterAccessoriesResolve;
  // In-flight requestMatterAccessories promise. Cached so that a second
  // caller arriving while the first is pending shares the same response
  // rather than racing for the single resolver slot — without this, the
  // first caller's `accessoriesData` would be lost to a `undefined`
  // short-circuit and its `handleGetMatterAccessories` would emit an
  // accessoriesData event missing this child's accessories.
  matterAccessoriesPromise;
  // Callback for external Matter bridge registration
  onExternalBridgeRegistered;
  // Callback fired when the child sends an accessoryInfoData response, so the
  // parent server can cancel its pending fallback timer for that uuid before
  // it fires a spurious "Timed out" event at the UI.
  onAccessoryInfoResponse;
  onAccessoryControlResponse;
  // Stored shutdown listener so it can be removed in teardown(),
  // matching the pattern used by MatterBridgeManager (#3915).
  _onApiShutdown = () => {
    this.shuttingDown = true;
    this.teardown();
  };
  constructor(type, identifier, plugin, bridgeConfig, homebridgeConfig, homebridgeOptions, api, ipcService, externalPortService) {
    this.type = type;
    this.identifier = identifier;
    this.plugin = plugin;
    this.bridgeConfig = bridgeConfig;
    this.homebridgeConfig = homebridgeConfig;
    this.homebridgeOptions = homebridgeOptions;
    this.api = api;
    this.ipcService = ipcService;
    this.externalPortService = externalPortService;
    this.log = import_logger.Logger.withPrefix(this.plugin.getPluginIdentifier());
    this.api.on("shutdown", this._onApiShutdown);
    this.api.setMaxListeners(this.api.getMaxListeners() + 1);
  }
  /**
   * Start the child bridge service
   */
  start() {
    this.setProcessFlags();
    this.setProcessEnv();
    this.startChildProcess();
    if (this.pluginConfig.length !== 1) {
      this.displayName = this.plugin.getPluginIdentifier();
    } else {
      this.displayName = this.pluginConfig[0]?.name || this.plugin.getPluginIdentifier();
    }
    this.log = import_logger.Logger.withPrefix(this.displayName);
  }
  /**
   * Add a config block to a child bridge.
   * Platform child bridges can only contain one config block.
   * @param config
   */
  addConfig(config) {
    this.pluginConfig.push(config);
  }
  /**
   * Start Matter monitoring on this child bridge
   */
  startMatterMonitoring() {
    this.sendMessage(
      "startMatterMonitoring"
      /* ChildProcessMessageEventType.START_MATTER_MONITORING */
    );
  }
  /**
   * Stop Matter monitoring on this child bridge
   */
  stopMatterMonitoring() {
    this.sendMessage(
      "stopMatterMonitoring"
      /* ChildProcessMessageEventType.STOP_MATTER_MONITORING */
    );
  }
  /**
   * Request Matter accessories from this child bridge.
   * Returns a promise that resolves when the child responds, or undefined on timeout.
   *
   * Concurrent callers share the same in-flight promise. Previously each
   * call registered its own resolver in `matterAccessoriesResolve`, and the
   * second caller would clobber the first — when the child's
   * `accessoriesData` arrived only the second caller would see it and the
   * first caller would either hang until its timer fired or (after the
   * stranding fix) short-circuit with `undefined`. Either way the first
   * caller's `handleGetMatterAccessories` would emit an `accessoriesData`
   * event missing this child's accessories. Coalescing lets both callers
   * resolve with the same data on a single response.
   */
  requestMatterAccessories(timeoutMs = 500) {
    if (this.matterAccessoriesPromise) {
      return this.matterAccessoriesPromise;
    }
    this.matterAccessoriesPromise = new Promise((resolve2) => {
      let timeout;
      const settle = (data) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        if (this.matterAccessoriesResolve === settle) {
          this.matterAccessoriesResolve = void 0;
        }
        this.matterAccessoriesPromise = void 0;
        resolve2(data);
      };
      timeout = setTimeout(settle, timeoutMs, void 0);
      this.matterAccessoriesResolve = settle;
      this.sendMessage(
        "getMatterAccessories"
        /* ChildProcessMessageEventType.GET_MATTER_ACCESSORIES */
      );
    });
    return this.matterAccessoriesPromise;
  }
  /**
   * Get specific Matter accessory info from this child bridge
   */
  getMatterAccessoryInfo(uuid) {
    this.sendMessage("getMatterAccessoryInfo", { uuid });
  }
  /**
   * Control a Matter accessory on this child bridge
   */
  controlMatterAccessory(data) {
    this.sendMessage("matterAccessoryControl", data);
  }
  get bridgeStatus() {
    return this.lastBridgeStatus;
  }
  set bridgeStatus(value) {
    this.lastBridgeStatus = value;
    this.sendStatusUpdate();
  }
  /**
   * Start the child bridge process
   */
  startChildProcess() {
    this.bridgeStatus = "pending";
    this.childOnlineSince = void 0;
    this.child = (0, import_node_child_process.fork)((0, import_node_path.resolve)(__dirname, "childBridgeFork.js"), this.args, this.processEnv);
    this.child.stdout?.on("data", (data) => {
      import_node_process.default.stdout.write(data);
    });
    this.child.stderr?.on("data", (data) => {
      import_node_process.default.stderr.write(data);
    });
    this.child.on("error", (e) => {
      this.bridgeStatus = "down";
      this.log.error("Child bridge process error", e);
    });
    this.child.once("close", (code, signal) => {
      this.handleProcessClose(code, signal);
    });
    this.child.on("message", (message) => {
      if (typeof message !== "object" || !message.id) {
        return;
      }
      switch (message.id) {
        case "ready": {
          this.log(`Child bridge starting${this.child?.pid ? ` (pid ${this.child.pid})` : ""}...`);
          this.loadPlugin();
          break;
        }
        case "loaded": {
          const version = message.data.version;
          if (this.pluginConfig.length > 1) {
            this.log.success(`Child bridge started successfully with ${this.pluginConfig.length} accessories (plugin v${version}).`);
          } else {
            this.log.success(`Child bridge started successfully (plugin v${version}).`);
          }
          this.startBridge();
          break;
        }
        case "online": {
          this.bridgeStatus = "ok";
          this.childOnlineSince = Date.now();
          break;
        }
        case "portRequest": {
          void this.handlePortRequest(message.data);
          break;
        }
        case "releaseMatterPort": {
          const data = message.data;
          if (data?.uniqueId) {
            this.externalPortService.releaseMatterPort(data.uniqueId);
          }
          break;
        }
        case "status": {
          const statusData = message.data;
          this.pairedStatus = statusData.paired;
          this.setupUri = statusData.setupUri;
          if (statusData.matter) {
            this.matterCommissioningInfo = {
              qrCode: statusData.matter.qrCode,
              manualPairingCode: statusData.matter.manualPairingCode,
              serialNumber: statusData.matter.serialNumber,
              commissioned: statusData.matter.commissioned || false,
              deviceCount: statusData.matter.deviceCount,
              fabricCount: statusData.matter.fabricCount,
              fabrics: statusData.matter.fabrics
            };
          }
          this.sendStatusUpdate();
          break;
        }
        case "matterEvent": {
          const matterEvent = message.data;
          if (matterEvent.type === "accessoriesData") {
            this.matterAccessoriesResolve?.(matterEvent.data);
          } else if (matterEvent.type === "externalBridgeRegistration") {
            const data = matterEvent.data;
            if (this.onExternalBridgeRegistered) {
              this.onExternalBridgeRegistered(data.externalBridgeUsername, this.bridgeConfig.username);
            }
          } else {
            if (matterEvent.type === "accessoryInfoData" && this.onAccessoryInfoResponse) {
              const uuid = matterEvent.data?.uuid;
              if (uuid) {
                this.onAccessoryInfoResponse(uuid);
              }
            }
            if (matterEvent.type === "accessoryControlResponse" && this.onAccessoryControlResponse) {
              if (matterEvent.correlationId) {
                this.onAccessoryControlResponse(matterEvent.correlationId);
              }
            }
            this.ipcService.sendMessage("matterEvent", matterEvent);
          }
          break;
        }
      }
    });
  }
  /**
   * Called when the child bridge process exits, if Homebridge is not shutting down, it will restart the process
   * @param code
   * @param signal
   */
  handleProcessClose(code, signal) {
    const isLikelyPluginCrash = code === 1 && signal === null;
    this.log.warn(`Child bridge ended (code ${code}, signal ${signal}).${isLikelyPluginCrash ? " The child bridge ended unexpectedly, which is normally due to the plugin not catching its errors properly. Please report this to the plugin developer by clicking on the 'Report An Issue' option in the plugin menu dropdown from the Homebridge UI. If there are related logs shown above, please include them in your report." : ""}`);
    if (this.shuttingDown) {
      return;
    }
    if (this.childOnlineSince !== void 0 && Date.now() - this.childOnlineSince >= this.stableRunResetMs) {
      this.restartCount = 0;
    }
    this.childOnlineSince = void 0;
    if (this.restartCount >= this.maxRestarts) {
      this.bridgeStatus = "down";
      this.manuallyStopped = true;
      this.log.error(`Child bridge will no longer restart after failing ${this.maxRestarts + 1} times, you will need to manually start this child bridge from the Homebridge UI.`);
      return;
    }
    this.restartCount += 1;
    if (isLikelyPluginCrash) {
      this.bridgeStatus = "pending";
      const delay = this.restartCount * 10;
      this.log(`Child bridge will automatically restart in ${delay} seconds (restart attempt ${this.restartCount} of ${this.maxRestarts}).`);
      this.scheduledRestartTimeout = setTimeout(() => {
        this.scheduledRestartTimeout = void 0;
        if (!this.shuttingDown && !this.manuallyStopped) {
          this.startChildProcess();
        }
      }, delay * 1e3);
    } else {
      this.bridgeStatus = "down";
      this.startChildProcess();
    }
  }
  /**
   * Helper function to send a message to the child process
   * @param type
   * @param data
   */
  sendMessage(type, data) {
    if (this.child && this.child.connected) {
      this.child.send({
        id: type,
        data
      });
    }
  }
  /**
   * Some plugins may make use of the homebridge process flags
   * These will be passed through to the forked process
   */
  setProcessFlags() {
    if (this.bridgeConfig.debugModeEnabled) {
      this.args.push("-D");
    }
    if (this.homebridgeOptions.forceColourLogging) {
      this.args.push("-C");
    }
    if (this.homebridgeOptions.insecureAccess) {
      this.args.push("-I");
    }
    if (this.homebridgeOptions.noLogTimestamps) {
      this.args.push("-T");
    }
    if (this.homebridgeOptions.keepOrphanedCachedAccessories) {
      this.args.push("-K");
    }
    if (this.homebridgeOptions.customStoragePath) {
      this.args.push("-U", this.homebridgeOptions.customStoragePath);
    }
    if (this.homebridgeOptions.customPluginPath) {
      this.args.push("-P", this.homebridgeOptions.customPluginPath);
    }
  }
  /**
   * Set environment variables for the child process
   */
  setProcessEnv() {
    this.processEnv = {
      env: {
        ...import_node_process.default.env,
        DEBUG: `${import_node_process.default.env.DEBUG || ""} ${this.bridgeConfig.env?.DEBUG || ""}`.trim(),
        NODE_OPTIONS: `${import_node_process.default.env.NODE_OPTIONS || ""} ${this.bridgeConfig.env?.NODE_OPTIONS || ""}`.trim()
      },
      silent: true
    };
  }
  /**
   * Tell the child process to load the given plugin
   */
  loadPlugin() {
    const bridgeConfig = {
      name: this.bridgeConfig.name || this.displayName || this.plugin.getPluginIdentifier(),
      port: this.bridgeConfig.port,
      username: this.bridgeConfig.username,
      advertiser: this.homebridgeConfig.bridge.advertiser,
      pin: this.bridgeConfig.pin || this.homebridgeConfig.bridge.pin,
      bind: this.homebridgeConfig.bridge.bind,
      setupID: this.bridgeConfig.setupID,
      manufacturer: this.bridgeConfig.manufacturer || this.homebridgeConfig.bridge.manufacturer,
      model: this.bridgeConfig.model || this.homebridgeConfig.bridge.model,
      firmwareRevision: this.bridgeConfig.firmwareRevision || this.homebridgeConfig.bridge.firmwareRevision,
      serialNumber: this.bridgeConfig.serialNumber || this.bridgeConfig.username,
      hap: this.bridgeConfig.hap,
      matter: this.bridgeConfig.matter
    };
    const bridgeOptions = {
      cachedAccessoriesDir: import_user.User.cachedAccessoryPath(),
      cachedAccessoriesItemName: `cachedAccessories.${this.bridgeConfig.username.replace(COLON_RE, "").toUpperCase()}`,
      externalAccessoriesItemName: `externalAccessories.${this.bridgeConfig.username.replace(COLON_RE, "").toUpperCase()}`
    };
    Object.assign(bridgeOptions, this.homebridgeOptions);
    if (this.bridgeConfig.debugModeEnabled !== void 0) {
      bridgeOptions.debugModeEnabled = this.bridgeConfig.debugModeEnabled;
    }
    this.sendMessage("load", {
      type: this.type,
      identifier: this.identifier,
      pluginPath: this.plugin.getPluginPath(),
      pluginConfig: this.pluginConfig,
      bridgeConfig,
      bridgeOptions,
      homebridgeConfig: {
        bridge: this.homebridgeConfig.bridge,
        ports: this.homebridgeConfig.ports,
        disabledPlugins: [],
        // not used by child bridges
        accessories: [],
        // not used by child bridges
        platforms: []
        // not used by child bridges
      }
    });
  }
  /**
   * Tell the child bridge to start broadcasting
   */
  startBridge() {
    this.sendMessage(
      "start"
      /* ChildProcessMessageEventType.START */
    );
  }
  /**
   * Handle external port requests from child
   */
  async handlePortRequest(request) {
    let port;
    if (request.portType === "matter") {
      port = await this.externalPortService.requestMatterPort(request.username);
    } else {
      port = await this.externalPortService.requestPort(request.username);
    }
    this.sendMessage("portAllocated", {
      username: request.username,
      port
    });
  }
  /**
   * Send sigterm to the child bridge, escalating to sigkill if the child
   * does not exit within 10 seconds.
   */
  teardown() {
    if (this.shuttingDown || this.manuallyStopped) {
      this.api.removeListener("shutdown", this._onApiShutdown);
      this.api.setMaxListeners(Math.max(0, this.api.getMaxListeners() - 1));
    }
    if (this.child && this.child.connected) {
      this.bridgeStatus = "down";
      const child = this.child;
      child.kill("SIGTERM");
      const sigkillTimer = setTimeout(() => {
        if (child.connected) {
          this.log.warn("Child bridge did not exit within 10s of SIGTERM; escalating to SIGKILL.");
          child.kill("SIGKILL");
        }
      }, 1e4);
      sigkillTimer.unref();
    }
  }
  /**
   * Trigger sending child bridge metadata to the process parent via IPC
   */
  sendStatusUpdate() {
    this.ipcService.sendMessage("childBridgeStatusUpdate", this.getMetadata());
  }
  /**
   * Restarts the child bridge process
   */
  restartChildBridge() {
    if (this.manuallyStopped) {
      this.restartCount = 0;
      this.startChildBridge();
    } else {
      this.log.warn("Child bridge restarting...");
      void this.refreshConfig();
      this.teardown();
    }
  }
  /**
   * Stops the child bridge, not starting it again
   */
  stopChildBridge() {
    if (!this.shuttingDown) {
      this.log.warn("Child bridge stopping, will not restart.");
      this.shuttingDown = true;
      this.manuallyStopped = true;
      this.restartCount = 0;
      if (this.scheduledRestartTimeout) {
        clearTimeout(this.scheduledRestartTimeout);
        this.scheduledRestartTimeout = void 0;
      }
      this.bridgeStatus = "down";
      this.child?.removeAllListeners();
      this.teardown();
    } else {
      this.log.warn("Child bridge already shutting down or stopped.");
    }
  }
  /**
   * Starts the child bridge, only if it was manually stopped and is no longer running
   */
  startChildBridge() {
    if (this.manuallyStopped && this.bridgeStatus === "down" && (!this.child || !this.child.connected)) {
      void this.refreshConfig();
      this.startChildProcess();
      this.shuttingDown = false;
      this.manuallyStopped = false;
    } else {
      this.log.warn("Child bridge cannot be started, it is still running or was not manually stopped.");
    }
  }
  /**
   * Read the config.json file from disk and refresh the plugin config block for just this plugin
   */
  async refreshConfig() {
    try {
      const homebridgeConfig = await import_fs_extra.default.readJson(import_user.User.configPath());
      if (this.type === "platform") {
        const config = (homebridgeConfig.platforms ?? []).filter((x) => x.platform === this.identifier && x._bridge?.username === this.bridgeConfig.username);
        if (config.length) {
          this.pluginConfig = config;
          this.bridgeConfig = this.pluginConfig[0]._bridge || this.bridgeConfig;
        } else {
          this.log.warn("Platform config could not be found, using existing config.");
        }
      } else if (this.type === "accessory") {
        const config = (homebridgeConfig.accessories ?? []).filter((x) => x.accessory === this.identifier && x._bridge?.username === this.bridgeConfig.username);
        if (config.length) {
          this.pluginConfig = config;
          this.bridgeConfig = this.pluginConfig[0]._bridge || this.bridgeConfig;
        } else {
          this.log.warn("Accessory config could not be found, using existing config.");
        }
      }
    } catch (error) {
      this.log.error("Failed to refresh plugin config:", error.message);
    }
  }
  /**
   * Returns metadata about this child bridge
   */
  getMetadata() {
    return {
      status: this.bridgeStatus,
      paired: this.pairedStatus,
      setupUri: this.setupUri,
      username: this.bridgeConfig.username,
      port: this.bridgeConfig.port,
      pin: this.bridgeConfig.pin || this.homebridgeConfig.bridge.pin,
      name: this.bridgeConfig.name || this.displayName || this.plugin.getPluginIdentifier(),
      plugin: this.plugin.getPluginIdentifier(),
      identifier: this.identifier,
      pid: this.child?.pid,
      manuallyStopped: this.manuallyStopped,
      // hap is normalized to the object form by validateHapConfig before a
      // child bridge runs; coerce any legacy boolean defensively so
      // ChildMetadata stays object-shaped for consumers (e.g. the config UI).
      hap: typeof this.bridgeConfig.hap === "boolean" ? { enabled: this.bridgeConfig.hap } : this.bridgeConfig.hap,
      matterConfig: this.bridgeConfig.matter,
      matterIdentifier: this.bridgeConfig.matter ? this.bridgeConfig.username : void 0,
      matterSetupUri: this.matterCommissioningInfo?.qrCode,
      matterPin: this.matterCommissioningInfo?.manualPairingCode,
      matterSerialNumber: this.matterCommissioningInfo?.serialNumber,
      matterCommissioned: this.matterCommissioningInfo?.commissioned,
      matterDeviceCount: this.matterCommissioningInfo?.deviceCount,
      matterFabricCount: this.matterCommissioningInfo?.fabricCount,
      matterFabrics: this.matterCommissioningInfo?.fabrics
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChildBridgeService,
  ChildBridgeStatus,
  ChildProcessMessageEventType
});

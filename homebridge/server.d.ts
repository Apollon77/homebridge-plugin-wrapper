export interface HomebridgeOptions {
    keepOrphanedCachedAccessories?: boolean;
    hideQRCode?: boolean;
    insecureAccess?: boolean;
    customPluginPath?: string;
    noLogTimestamps?: boolean;
    debugModeEnabled?: boolean;
    forceColourLogging?: boolean;
    customStoragePath?: string;
}
export declare class Server {
    private options;
    private readonly api;
    private readonly pluginManager;
    private readonly bridgeService;
    private readonly ipcService;
    private readonly externalPortService;
    private readonly config;
    private readonly childBridges;
    constructor(options?: HomebridgeOptions);
    start(): Promise<void>;
    teardown(): void;
    private publishBridge;
    private static loadConfig;
    private loadAccessories;
    private loadPlatforms;
    /**
     * Validate an external bridge config
     */
    private validateChildBridgeConfig;
    /**
     * Takes care of the IPC Events sent to Homebridge
     */
    private initializeIpcEventHandlers;
    private printSetupInfo;
}
//# sourceMappingURL=server.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var child_process_1 = require("child_process");
var events_1 = require("events");
var net_1 = require("net");
var __1 = require("..");
var cameraUUID = __1.uuid.generate("hap-nodejs:accessories:ip-camera");
var camera = exports.accessory = new __1.Accessory("IPCamera", cameraUUID);
// @ts-expect-error: Core/BridgeCore API
camera.username = "9F:B2:46:0C:40:DB";
// @ts-expect-error: Core/BridgeCore API
camera.pincode = "948-23-459";
camera.category = 17 /* IP_CAMERA */;
var FFMPEGH264ProfileNames = [
    "baseline",
    "main",
    "high",
];
var FFMPEGH264LevelNames = [
    "3.1",
    "3.2",
    "4.0",
];
var ports = new Set();
function getPort() {
    for (var i = 5011;; i++) {
        if (!ports.has(i)) {
            ports.add(i);
            return i;
        }
    }
}
var ExampleCamera = /** @class */ (function () {
    function ExampleCamera() {
        this.ffmpegDebugOutput = false;
        // keep track of sessions
        this.pendingSessions = {};
        this.ongoingSessions = {};
        this.handlingStreamingRequest = false;
    }
    ExampleCamera.prototype.handleSnapshotRequest = function (request, callback) {
        var _this = this;
        var ffmpegCommand = "-f lavfi -i testsrc=s=".concat(request.width, "x").concat(request.height, " -vframes 1 -f mjpeg -");
        var ffmpeg = (0, child_process_1.spawn)("ffmpeg", ffmpegCommand.split(" "), { env: process.env });
        var snapshotBuffers = [];
        ffmpeg.stdout.on("data", function (data) { return snapshotBuffers.push(data); });
        ffmpeg.stderr.on("data", function (data) {
            if (_this.ffmpegDebugOutput) {
                console.log("SNAPSHOT: " + String(data));
            }
        });
        ffmpeg.on("exit", function (code, signal) {
            if (signal) {
                console.log("Snapshot process was killed with signal: " + signal);
                callback(new Error("killed with signal " + signal));
            }
            else if (code === 0) {
                console.log("Successfully captured snapshot at ".concat(request.width, "x").concat(request.height));
                callback(undefined, Buffer.concat(snapshotBuffers));
            }
            else {
                console.log("Snapshot process exited with code " + code);
                callback(new Error("Snapshot process exited with code " + code));
            }
        });
    };
    // called when iOS request rtp setup
    ExampleCamera.prototype.prepareStream = function (request, callback) {
        var sessionId = request.sessionID;
        var targetAddress = request.targetAddress;
        var video = request.video;
        var videoCryptoSuite = video.srtpCryptoSuite; // could be used to support multiple crypto suite (or support no suite for debugging)
        var videoSrtpKey = video.srtp_key;
        var videoSrtpSalt = video.srtp_salt;
        var videoSSRC = __1.CameraController.generateSynchronisationSource();
        var localPort = getPort();
        var sessionInfo = {
            address: targetAddress,
            videoPort: video.port,
            localVideoPort: localPort,
            videoCryptoSuite: videoCryptoSuite,
            videoSRTP: Buffer.concat([videoSrtpKey, videoSrtpSalt]),
            videoSSRC: videoSSRC,
        };
        var response = {
            video: {
                port: localPort,
                ssrc: videoSSRC,
                srtp_key: videoSrtpKey,
                srtp_salt: videoSrtpSalt,
            },
            // audio is omitted as we do not support audio in this example
        };
        this.pendingSessions[sessionId] = sessionInfo;
        callback(undefined, response);
    };
    // called when iOS device asks stream to start/stop/reconfigure
    ExampleCamera.prototype.handleStreamRequest = function (request, callback) {
        var _this = this;
        var sessionId = request.sessionID;
        switch (request.type) {
            case "start" /* START */: {
                var sessionInfo = this.pendingSessions[sessionId];
                var video = request.video;
                var profile = FFMPEGH264ProfileNames[video.profile];
                var level = FFMPEGH264LevelNames[video.level];
                var width = video.width;
                var height = video.height;
                var fps = video.fps;
                var payloadType = video.pt;
                var maxBitrate = video.max_bit_rate;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                var rtcpInterval = video.rtcp_interval; // usually 0.5
                var mtu = video.mtu; // maximum transmission unit
                var address = sessionInfo.address;
                var videoPort = sessionInfo.videoPort;
                var localVideoPort = sessionInfo.localVideoPort;
                var ssrc = sessionInfo.videoSSRC;
                var cryptoSuite = sessionInfo.videoCryptoSuite;
                var videoSRTP = sessionInfo.videoSRTP.toString("base64");
                console.log("Starting video stream (".concat(width, "x").concat(height, ", ").concat(fps, " fps, ").concat(maxBitrate, " kbps, ").concat(mtu, " mtu)..."));
                var videoffmpegCommand = "-re -f lavfi -i testsrc=s=".concat(width, "x").concat(height, ":r=").concat(fps, " -map 0:0 ") +
                    "-c:v h264 -pix_fmt yuv420p -r ".concat(fps, " -an -sn -dn -b:v ").concat(maxBitrate, "k ") +
                    "-profile:v ".concat(profile, " -level:v ").concat(level, " ") +
                    "-payload_type ".concat(payloadType, " -ssrc ").concat(ssrc, " -f rtp ");
                if (cryptoSuite !== 2 /* NONE */) {
                    var suite = void 0;
                    switch (cryptoSuite) {
                        case 0 /* AES_CM_128_HMAC_SHA1_80 */: // actually ffmpeg just supports AES_CM_128_HMAC_SHA1_80
                            suite = "AES_CM_128_HMAC_SHA1_80";
                            break;
                        case 1 /* AES_CM_256_HMAC_SHA1_80 */:
                            suite = "AES_CM_256_HMAC_SHA1_80";
                            break;
                    }
                    videoffmpegCommand += "-srtp_out_suite ".concat(suite, " -srtp_out_params ").concat(videoSRTP, " s");
                }
                videoffmpegCommand += "rtp://".concat(address, ":").concat(videoPort, "?rtcpport=").concat(videoPort, "&localrtcpport=").concat(localVideoPort, "&pkt_size=").concat(mtu);
                if (this.ffmpegDebugOutput) {
                    console.log("FFMPEG command: ffmpeg " + videoffmpegCommand);
                }
                var ffmpegVideo = (0, child_process_1.spawn)("ffmpeg", videoffmpegCommand.split(" "), { env: process.env });
                var started_1 = false;
                ffmpegVideo.stderr.on("data", function (data) {
                    console.log(data.toString("utf8"));
                    if (!started_1) {
                        started_1 = true;
                        console.log("FFMPEG: received first frame");
                        callback(); // do not forget to execute callback once set up
                    }
                    if (_this.ffmpegDebugOutput) {
                        console.log("VIDEO: " + String(data));
                    }
                });
                ffmpegVideo.on("error", function (error) {
                    console.log("[Video] Failed to start video stream: " + error.message);
                    callback(new Error("ffmpeg process creation failed!"));
                });
                ffmpegVideo.on("exit", function (code, signal) {
                    var message = "[Video] ffmpeg exited with code: " + code + " and signal: " + signal;
                    if (code == null || code === 255) {
                        console.log(message + " (Video stream stopped!)");
                    }
                    else {
                        console.log(message + " (error)");
                        if (!started_1) {
                            callback(new Error(message));
                        }
                        else {
                            _this.controller.forceStopStreamingSession(sessionId);
                        }
                    }
                });
                this.ongoingSessions[sessionId] = {
                    localVideoPort: localVideoPort,
                    process: ffmpegVideo,
                };
                delete this.pendingSessions[sessionId];
                break;
            }
            case "reconfigure" /* RECONFIGURE */:
                // not supported by this example
                console.log("Received (unsupported) request to reconfigure to: " + JSON.stringify(request.video));
                callback();
                break;
            case "stop" /* STOP */: {
                var ongoingSession = this.ongoingSessions[sessionId];
                if (!ongoingSession) {
                    callback();
                    break;
                }
                ports.delete(ongoingSession.localVideoPort);
                try {
                    ongoingSession.process.kill("SIGKILL");
                }
                catch (e) {
                    console.log("Error occurred terminating the video process!");
                    console.log(e);
                }
                delete this.ongoingSessions[sessionId];
                console.log("Stopped streaming session!");
                callback();
                break;
            }
        }
    };
    ExampleCamera.prototype.updateRecordingActive = function (active) {
        // we haven't implemented a prebuffer
        console.log("Recording active set to " + active);
    };
    ExampleCamera.prototype.updateRecordingConfiguration = function (configuration) {
        this.configuration = configuration;
        console.log(configuration);
    };
    /**
     * This is a very minimal, very experimental example on how to implement fmp4 streaming with a
     * CameraController supporting HomeKit Secure Video.
     *
     * An ideal implementation would diverge from this in the following ways:
     * * It would implement a prebuffer and respect the recording `active` characteristic for that.
     * * It would start to immediately record after a trigger event occurred and not just
     *   when the HomeKit Controller requests it (see the documentation of `CameraRecordingDelegate`).
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ExampleCamera.prototype.handleRecordingStreamRequest = function (streamId) {
        var _a, _b, _c;
        return (0, tslib_1.__asyncGenerator)(this, arguments, function handleRecordingStreamRequest_1() {
            var STOP_AFTER_MOTION_STOP, profile, level, videoArgs, samplerate, audioArgs, pending, _d, _e, box, motionDetected, fragment, isLast, e_1_1, error_1;
            var e_1, _f;
            return (0, tslib_1.__generator)(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        (0, assert_1.default)(!!this.configuration);
                        STOP_AFTER_MOTION_STOP = false;
                        this.handlingStreamingRequest = true;
                        (0, assert_1.default)(this.configuration.videoCodec.type === 0 /* H264 */);
                        profile = this.configuration.videoCodec.parameters.profile === 2 /* HIGH */ ? "high"
                            : this.configuration.videoCodec.parameters.profile === 1 /* MAIN */ ? "main" : "baseline";
                        level = this.configuration.videoCodec.parameters.level === 2 /* LEVEL4_0 */ ? "4.0"
                            : this.configuration.videoCodec.parameters.level === 1 /* LEVEL3_2 */ ? "3.2" : "3.1";
                        videoArgs = [
                            "-an",
                            "-sn",
                            "-dn",
                            "-codec:v",
                            "libx264",
                            "-pix_fmt",
                            "yuv420p",
                            "-profile:v", profile,
                            "-level:v", level,
                            "-b:v",
                            "".concat(this.configuration.videoCodec.parameters.bitRate, "k"),
                            "-force_key_frames",
                            "expr:eq(t,n_forced*".concat(this.configuration.videoCodec.parameters.iFrameInterval / 1000, ")"),
                            "-r", this.configuration.videoCodec.resolution[2].toString(),
                        ];
                        switch (this.configuration.audioCodec.samplerate) {
                            case 0 /* KHZ_8 */:
                                samplerate = "8";
                                break;
                            case 1 /* KHZ_16 */:
                                samplerate = "16";
                                break;
                            case 2 /* KHZ_24 */:
                                samplerate = "24";
                                break;
                            case 3 /* KHZ_32 */:
                                samplerate = "32";
                                break;
                            case 4 /* KHZ_44_1 */:
                                samplerate = "44.1";
                                break;
                            case 5 /* KHZ_48 */:
                                samplerate = "48";
                                break;
                            default:
                                throw new Error("Unsupported audio samplerate: " + this.configuration.audioCodec.samplerate);
                        }
                        audioArgs = ((_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.recordingManagement) === null || _b === void 0 ? void 0 : _b.recordingManagementService.getCharacteristic(__1.Characteristic.RecordingAudioActive))
                            ? (0, tslib_1.__spreadArray)((0, tslib_1.__spreadArray)([
                                "-acodec", "libfdk_aac"
                            ], (0, tslib_1.__read)((this.configuration.audioCodec.type === 0 /* AAC_LC */ ?
                                ["-profile:a", "aac_low"] :
                                ["-profile:a", "aac_eld"])), false), [
                                "-ar",
                                "".concat(samplerate, "k"),
                                "-b:a",
                                "".concat(this.configuration.audioCodec.bitrate, "k"),
                                "-ac",
                                "".concat(this.configuration.audioCodec.audioChannels),
                            ], false) : [];
                        this.server = new MP4StreamingServer("ffmpeg", "-f lavfi -i       testsrc=s=".concat(this.configuration.videoCodec.resolution[0], "x").concat(this.configuration.videoCodec.resolution[1], ":r=").concat(this.configuration.videoCodec.resolution[2])
                            .split(/ /g), audioArgs, videoArgs);
                        return [4 /*yield*/, (0, tslib_1.__await)(this.server.start())];
                    case 1:
                        _g.sent();
                        if (!(!this.server || this.server.destroyed)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, tslib_1.__await)(void 0)];
                    case 2: return [2 /*return*/, _g.sent()]; // early exit
                    case 3:
                        pending = [];
                        _g.label = 4;
                    case 4:
                        _g.trys.push([4, 19, , 20]);
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 12, 13, 18]);
                        _d = (0, tslib_1.__asyncValues)(this.server.generator());
                        _g.label = 6;
                    case 6: return [4 /*yield*/, (0, tslib_1.__await)(_d.next())];
                    case 7:
                        if (!(_e = _g.sent(), !_e.done)) return [3 /*break*/, 11];
                        box = _e.value;
                        pending.push(box.header, box.data);
                        motionDetected = (_c = camera.getService(__1.Service.MotionSensor)) === null || _c === void 0 ? void 0 : _c.getCharacteristic(__1.Characteristic.MotionDetected).value;
                        console.log("mp4 box type " + box.type + " and length " + box.length);
                        if (!(box.type === "moov" || box.type === "mdat")) return [3 /*break*/, 10];
                        fragment = Buffer.concat(pending);
                        pending.splice(0, pending.length);
                        isLast = STOP_AFTER_MOTION_STOP && !motionDetected;
                        return [4 /*yield*/, (0, tslib_1.__await)({
                                data: fragment,
                                isLast: isLast,
                            })];
                    case 8: return [4 /*yield*/, _g.sent()];
                    case 9:
                        _g.sent();
                        if (isLast) {
                            console.log("Ending session due to motion stopped!");
                            return [3 /*break*/, 11];
                        }
                        _g.label = 10;
                    case 10: return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 18];
                    case 12:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 18];
                    case 13:
                        _g.trys.push([13, , 16, 17]);
                        if (!(_e && !_e.done && (_f = _d.return))) return [3 /*break*/, 15];
                        return [4 /*yield*/, (0, tslib_1.__await)(_f.call(_d))];
                    case 14:
                        _g.sent();
                        _g.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 17: return [7 /*endfinally*/];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_1 = _g.sent();
                        if (!error_1.message.startsWith("FFMPEG")) { // cheap way of identifying our own emitted errors
                            console.error("Encountered unexpected error on generator " + error_1.stack);
                        }
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ExampleCamera.prototype.closeRecordingStream = function (streamId, reason) {
        if (this.server) {
            this.server.destroy();
            this.server = undefined;
        }
        this.handlingStreamingRequest = false;
    };
    ExampleCamera.prototype.acknowledgeStream = function (streamId) {
        this.closeRecordingStream(streamId);
    };
    return ExampleCamera;
}());
var MP4StreamingServer = /** @class */ (function () {
    function MP4StreamingServer(ffmpegPath, ffmpegInput, audioOutputArgs, videoOutputArgs) {
        var _a, _b, _c;
        var _this = this;
        /**
         * This can be configured to output ffmpeg debug output!
         */
        this.debugMode = false;
        this.destroyed = false;
        this.connectPromise = new Promise(function (resolve) { return _this.connectResolve = resolve; });
        this.server = (0, net_1.createServer)(this.handleConnection.bind(this));
        this.ffmpegPath = ffmpegPath;
        this.args = [];
        (_a = this.args).push.apply(_a, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(ffmpegInput), false));
        (_b = this.args).push.apply(_b, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(audioOutputArgs), false));
        this.args.push("-f", "mp4");
        (_c = this.args).push.apply(_c, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(videoOutputArgs), false));
        this.args.push("-fflags", "+genpts", "-reset_timestamps", "1");
        this.args.push("-movflags", "frag_keyframe+empty_moov+default_base_moof");
    }
    MP4StreamingServer.prototype.start = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var promise, port;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promise = (0, events_1.once)(this.server, "listening");
                        this.server.listen(); // listen on random port
                        return [4 /*yield*/, promise];
                    case 1:
                        _a.sent();
                        if (this.destroyed) {
                            return [2 /*return*/];
                        }
                        port = this.server.address().port;
                        this.args.push("tcp://127.0.0.1:" + port);
                        console.log(this.ffmpegPath + " " + this.args.join(" "));
                        this.childProcess = (0, child_process_1.spawn)(this.ffmpegPath, this.args, { env: process.env, stdio: this.debugMode ? "pipe" : "ignore" });
                        if (!this.childProcess) {
                            console.error("ChildProcess is undefined directly after the init!");
                        }
                        if (this.debugMode) {
                            this.childProcess.stdout.on("data", function (data) { return console.log(data.toString()); });
                            this.childProcess.stderr.on("data", function (data) { return console.log(data.toString()); });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MP4StreamingServer.prototype.destroy = function () {
        var _a, _b;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.childProcess) === null || _b === void 0 ? void 0 : _b.kill();
        this.socket = undefined;
        this.childProcess = undefined;
        this.destroyed = true;
    };
    MP4StreamingServer.prototype.handleConnection = function (socket) {
        var _a;
        this.server.close(); // don't accept any further clients
        this.socket = socket;
        (_a = this.connectResolve) === null || _a === void 0 ? void 0 : _a.call(this);
    };
    /**
     * Generator for `MP4Atom`s.
     * Throws error to signal EOF when socket is closed.
     */
    MP4StreamingServer.prototype.generator = function () {
        return (0, tslib_1.__asyncGenerator)(this, arguments, function generator_1() {
            var header, length, type, data;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, tslib_1.__await)(this.connectPromise)];
                    case 1:
                        _a.sent();
                        if (!this.socket || !this.childProcess) {
                            console.log("Socket undefined " + !!this.socket + " childProcess undefined " + !!this.childProcess);
                            throw new Error("Unexpected state!");
                        }
                        _a.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, tslib_1.__await)(this.read(8))];
                    case 3:
                        header = _a.sent();
                        length = header.readInt32BE(0) - 8;
                        type = header.slice(4).toString();
                        return [4 /*yield*/, (0, tslib_1.__await)(this.read(length))];
                    case 4:
                        data = _a.sent();
                        return [4 /*yield*/, (0, tslib_1.__await)({
                                header: header,
                                length: length,
                                type: type,
                                data: data,
                            })];
                    case 5: return [4 /*yield*/, _a.sent()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MP4StreamingServer.prototype.read = function (length) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var value;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_a) {
                if (!this.socket) {
                    throw Error("FFMPEG tried reading from closed socket!");
                }
                if (!length) {
                    return [2 /*return*/, Buffer.alloc(0)];
                }
                value = this.socket.read(length);
                if (value) {
                    return [2 /*return*/, value];
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var readHandler = function () {
                            var value = _this.socket.read(length);
                            if (value) {
                                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                                cleanup();
                                resolve(value);
                            }
                        };
                        var endHandler = function () {
                            // eslint-disable-next-line @typescript-eslint/no-use-before-define
                            cleanup();
                            reject(new Error("FFMPEG socket closed during read for ".concat(length, " bytes!")));
                        };
                        var cleanup = function () {
                            var _a, _b;
                            (_a = _this.socket) === null || _a === void 0 ? void 0 : _a.removeListener("readable", readHandler);
                            (_b = _this.socket) === null || _b === void 0 ? void 0 : _b.removeListener("close", endHandler);
                        };
                        if (!_this.socket) {
                            throw new Error("FFMPEG socket is closed now!");
                        }
                        _this.socket.on("readable", readHandler);
                        _this.socket.on("close", endHandler);
                    })];
            });
        });
    };
    return MP4StreamingServer;
}());
var streamDelegate = new ExampleCamera();
var cameraController = new __1.CameraController({
    cameraStreamCount: 2,
    delegate: streamDelegate,
    streamingOptions: {
        // srtp: true, // legacy option which will just enable AES_CM_128_HMAC_SHA1_80 (can still be used though)
        // NONE is not supported by iOS just there for testing with Wireshark for example
        supportedCryptoSuites: [2 /* NONE */, 0 /* AES_CM_128_HMAC_SHA1_80 */],
        video: {
            codec: {
                profiles: [0 /* BASELINE */, 1 /* MAIN */, 2 /* HIGH */],
                levels: [0 /* LEVEL3_1 */, 1 /* LEVEL3_2 */, 2 /* LEVEL4_0 */],
            },
            resolutions: [
                [1920, 1080, 30],
                [1280, 960, 30],
                [1280, 720, 30],
                [1024, 768, 30],
                [640, 480, 30],
                [640, 360, 30],
                [480, 360, 30],
                [480, 270, 30],
                [320, 240, 30],
                [320, 240, 15],
                [320, 180, 30],
            ],
        },
        /* audio option is omitted, as it is not supported in this example; HAP-NodeJS will fake an appropriate audio codec
            audio: {
                comfort_noise: false, // optional, default false
                codecs: [
                    {
                        type: AudioStreamingCodecType.OPUS,
                        audioChannels: 1, // optional, default 1
                        samplerate: [AudioStreamingSamplerate.KHZ_16, AudioStreamingSamplerate.KHZ_24], // 16 and 24 must be present for AAC-ELD or OPUS
                    },
                ],
            },
            // */
    },
    recording: {
        options: {
            prebufferLength: 4000,
            mediaContainerConfiguration: {
                type: 0 /* FRAGMENTED_MP4 */,
                fragmentLength: 4000,
            },
            video: {
                type: 0 /* H264 */,
                parameters: {
                    profiles: [2 /* HIGH */],
                    levels: [2 /* LEVEL4_0 */],
                },
                resolutions: [
                    [320, 180, 30],
                    [320, 240, 15],
                    [320, 240, 30],
                    [480, 270, 30],
                    [480, 360, 30],
                    [640, 360, 30],
                    [640, 480, 30],
                    [1280, 720, 30],
                    [1280, 960, 30],
                    [1920, 1080, 30],
                    [1600, 1200, 30],
                ],
            },
            audio: {
                codecs: {
                    type: 1 /* AAC_ELD */,
                    audioChannels: 1,
                    samplerate: 5 /* KHZ_48 */,
                    bitrateMode: 0 /* VARIABLE */,
                },
            },
        },
        delegate: streamDelegate,
    },
    sensors: {
        motion: true,
        occupancy: true,
    },
});
streamDelegate.controller = cameraController;
camera.configureController(cameraController);
// a service to trigger the motion sensor!
camera.addService(__1.Service.Switch, "MOTION TRIGGER")
    .getCharacteristic(__1.Characteristic.On)
    .onSet(function (value) {
    var _a;
    (_a = camera.getService(__1.Service.MotionSensor)) === null || _a === void 0 ? void 0 : _a.updateCharacteristic(__1.Characteristic.MotionDetected, value);
});
//# sourceMappingURL=Camera_accessory.js.map
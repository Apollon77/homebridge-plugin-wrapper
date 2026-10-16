"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GStreamerAudioProducer = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const child_process_1 = require("child_process");
const debug_1 = tslib_1.__importDefault(require("debug"));
const debug = (0, debug_1.default)("HAP-NodeJS:Remote:GStreamer");
var AudioType;
(function (AudioType) {
    AudioType[AudioType["GENERIC"] = 2049] = "GENERIC";
    AudioType[AudioType["VOICE"] = 2048] = "VOICE";
})(AudioType || (AudioType = {}));
var Bandwidth;
(function (Bandwidth) {
    Bandwidth[Bandwidth["NARROW_BAND"] = 1101] = "NARROW_BAND";
    Bandwidth[Bandwidth["MEDIUM_BAND"] = 1102] = "MEDIUM_BAND";
    Bandwidth[Bandwidth["WIDE_BAND"] = 1103] = "WIDE_BAND";
    Bandwidth[Bandwidth["SUPER_WIDE_BAND"] = 1104] = "SUPER_WIDE_BAND";
    Bandwidth[Bandwidth["FULL_BAND"] = 1105] = "FULL_BAND";
    Bandwidth[Bandwidth["AUTO"] = -1000] = "AUTO";
})(Bandwidth || (Bandwidth = {}));
var BitrateType;
(function (BitrateType) {
    BitrateType[BitrateType["CONSTANT"] = 0] = "CONSTANT";
    BitrateType[BitrateType["VARIABLE"] = 1] = "VARIABLE";
})(BitrateType || (BitrateType = {}));
/**
 * SiriAudioStreamProducer utilizing gstreamer and alsa audio devices to create opus audio frames.
 *
 * This producer is mainly tested on a RaspberryPi, but should also work on other linux based devices using alsa.
 *
 * This producer requires some packages to be installed. It is advised to install the following (for example via apt-get):
 * gstreamer1.0-plugins-base, gstreamer1.0-x, gstreamer1.0-tools, libgstreamer1.0-dev, gstreamer1.0-doc,
 * gstreamer1.0-plugins-good, gstreamer1.0-plugins- ugly, gstreamer1.0-plugins-bad, gstreamer1.0-alsa
 *
 */
class GStreamerAudioProducer {
    options = {
        alsaSrc: "plughw:1",
    };
    frameHandler;
    errorHandler;
    process;
    running = false;
    constructor(frameHandler, errorHandler, options) {
        this.frameHandler = frameHandler;
        this.errorHandler = errorHandler;
        if (options) {
            for (const [key, value] of Object.entries(options)) {
                // @ts-expect-error: type mismatch
                GStreamerAudioProducer.options[key] = value;
            }
        }
    }
    startAudioProduction(selectedAudioConfiguration) {
        if (this.running) {
            throw new Error("Gstreamer already running");
        }
        const codecParameters = selectedAudioConfiguration.parameters;
        (0, assert_1.default)(selectedAudioConfiguration.codecType === 3 /* AudioCodecTypes.OPUS */);
        let bitrateType = 1 /* BitrateType.VARIABLE */;
        switch (codecParameters.bitrate) {
            case 1 /* AudioBitrate.CONSTANT */:
                bitrateType = 0 /* BitrateType.CONSTANT */;
                break;
            case 0 /* AudioBitrate.VARIABLE */:
                bitrateType = 1 /* BitrateType.VARIABLE */;
                break;
        }
        let bandwidth = 1104 /* Bandwidth.SUPER_WIDE_BAND */;
        switch (codecParameters.samplerate) {
            case 0 /* AudioSamplerate.KHZ_8 */:
                bandwidth = 1101 /* Bandwidth.NARROW_BAND */;
                break;
            case 1 /* AudioSamplerate.KHZ_16 */:
                bandwidth = 1103 /* Bandwidth.WIDE_BAND */;
                break;
            case 2 /* AudioSamplerate.KHZ_24 */:
                bandwidth = 1104 /* Bandwidth.SUPER_WIDE_BAND */;
                break;
        }
        const packetTime = codecParameters.rtpTime;
        debug("Launching gstreamer...");
        this.running = true;
        const args = "-q " +
            "alsasrc device=" + this.options.alsaSrc + " ! " +
            "capsfilter caps=audio/x-raw,format=S16LE,rate=24000 ! " +
            // "level post-messages=true interval=" + packetTime + "000000 ! " + // used to capture rms
            "opusenc " +
            "bitrate-type=" + bitrateType + " " +
            "bitrate=24000 " +
            "audio-type=" + 2048 /* AudioType.VOICE */ + " " +
            "bandwidth=" + bandwidth + " " +
            "frame-size=" + packetTime + " ! " +
            "fdsink fd=1";
        this.process = (0, child_process_1.spawn)("gst-launch-1.0", args.split(" "), { env: process.env });
        this.process.on("error", error => {
            if (this.running) {
                debug("Failed to spawn gstreamer process: " + error.message);
                this.errorHandler(3 /* HDSProtocolSpecificErrorReason.CANCELLED */);
            }
            else {
                debug("Failed to kill gstreamer process: " + error.message);
            }
        });
        this.process.stdout?.on("data", (data) => {
            if (!this.running) { // received data after it was closed
                return;
            }
            /*
                      This listener seems to get called with only one opus frame most of the time.
                      Though it happens regularly that another or many more frames get appended.
                      This causes some problems as opus frames don't contain their data length in the "header".
                      Opus relies on the container format to specify the length of the frame.
                      Although sometimes multiple opus frames are squashed together the decoder seems to be able
                      to handle that as it just creates a not very noticeable distortion.
                      If we would want to make this perfect we would need to write a nodejs c++ submodule or something
                      to interface directly with gstreamer api.
                   */
            this.frameHandler({
                data: data,
                rms: 0.25, // only way currently to extract rms from gstreamer is by interfacing with the api directly (nodejs c++ submodule could be a solution)
            });
        });
        this.process.stderr?.on("data", data => {
            debug("GStreamer process reports the following error: " + String(data));
        });
        this.process.on("exit", (code, signal) => {
            if (signal !== "SIGTERM") { // if we receive SIGTERM, process exited gracefully (we stopped it)
                debug("GStreamer process unexpectedly exited with code %d (signal: %s)", code, signal);
                this.errorHandler(5 /* HDSProtocolSpecificErrorReason.UNEXPECTED_FAILURE */);
            }
        });
    }
    stopAudioProduction() {
        if (this.running) {
            this.process.kill("SIGTERM");
            this.running = false;
        }
        this.process = undefined;
    }
}
exports.GStreamerAudioProducer = GStreamerAudioProducer;
//# sourceMappingURL=gstreamer-audioProducer.js.map
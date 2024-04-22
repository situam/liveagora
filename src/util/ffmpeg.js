import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from "@ffmpeg/util"

const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

class _FfmpegService {
    constructor() {
        this.ffmpeg = new FFmpeg();
        this.ffmpeg.on("log", ({ message }) => console.log("[ffmpeg]", message));
        this.ffmpeg.on('progress', ({ progress }) => console.log("[ffmpeg] progress", progress));

        this.loaded = false;
    }

    async load() {
        if (this.loaded) {
            return;
        }
        console.log('[ffmpeg] load');

        try {
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });
            console.log('[ffmpeg] loaded');
            this.loaded = true;
        } catch (error) {
            console.error("[ffmpeg] error loading", error);
        }
    }

    /**
     * @param {File} file - input sound file
     * @returns {Promise<Uint8Array>}
     */
    async transcodeToMp3(file) {
        console.log('[ffmpeg] transcodeToMp3', file);
        if (!this.loaded) {
            await this.load();
        }

        try {
            await this.ffmpeg.writeFile("input.wav", await fetchFile(file));
            await this.ffmpeg.exec(["-i", "input.wav", "output.mp3"]);
            const fileData = await this.ffmpeg.readFile('output.mp3');
            return new Uint8Array(fileData);
        } catch (error) {
            console.error("[ffmpeg] error transcoding", error);
            throw error;
        }
    }
}

export const ffmpegService = new _FfmpegService()
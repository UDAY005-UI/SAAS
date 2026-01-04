"use client";

import { useRef, useState, useEffect } from "react";

type VideoState = "READY" | "PROCESSING" | "FAILED";

interface VideoPlayerProps {
    title: string;
    videoState: VideoState;
    contentUrl?: string;
    thumbnailUrl?: string;
    duration: string;
}

export default function VideoPlayer({
    title,
    videoState,
    contentUrl,
    thumbnailUrl,
    duration,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [hasStarted, setHasStarted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setTotalDuration(videoRef.current.duration);
    };

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const togglePlay = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            await videoRef.current.play();
            setHasStarted(true);
        } else {
            videoRef.current.pause();
        }
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div
                ref={containerRef}
                className="group relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
                onClick={() => togglePlay()}
            >
                {videoState === "READY" && contentUrl && (
                    <video
                        ref={videoRef}
                        src={contentUrl}
                        className="w-full h-full object-contain cursor-pointer"
                        playsInline
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                )}

                {videoState === "READY" && !hasStarted && (
                    <div className="absolute inset-0 z-10 bg-black">
                        {thumbnailUrl && (
                            <img
                                src={thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover opacity-60"
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all scale-100 hover:scale-110">
                                <div className="ml-1 w-0 h-0 border-y-[15px] border-y-transparent border-l-[25px] border-l-white" />
                            </div>
                        </div>
                    </div>
                )}

                {videoState === "READY" && (
                    <div
                        className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                            isPlaying
                                ? "opacity-0 group-hover:opacity-100"
                                : "opacity-100"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative flex items-center mb-3 group/slider">
                            <input
                                type="range"
                                min="0"
                                max={totalDuration || 0}
                                value={currentTime}
                                onChange={handleScrub}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:h-1.5 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => togglePlay()}
                                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors"
                                >
                                    {isPlaying ? "PAUSE" : "PLAY"}
                                </button>
                                <span className="text-xs font-mono text-zinc-300">
                                    {formatTime(currentTime)} /{" "}
                                    {formatTime(totalDuration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase text-zinc-400 font-bold">
                                        Speed
                                    </span>
                                    <select
                                        value={playbackRate}
                                        onChange={(e) => {
                                            const rate = Number(e.target.value);
                                            setPlaybackRate(rate);
                                            if (videoRef.current)
                                                videoRef.current.playbackRate =
                                                    rate;
                                        }}
                                        className="bg-white/10 border border-white/20 rounded-md text-xs p-1 px-2 outline-none backdrop-blur-md"
                                    >
                                        {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                            <option
                                                key={rate}
                                                value={rate}
                                                className="text-black"
                                            >
                                                {rate}x
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <span className="text-xs font-bold font-mono">
                                        [ FULL ]
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">
                    Lesson Duration: {duration}
                </p>
            </div>
        </div>
    );
}

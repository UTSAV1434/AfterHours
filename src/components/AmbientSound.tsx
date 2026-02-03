import { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, CloudRain, Moon, Wind, Music, Upload, X } from 'lucide-react';

// Generate ambient sounds using Web Audio API
class AmbientSoundGenerator {
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private noiseNode: AudioBufferSourceNode | null = null;
    private isPlaying = false;

    start(type: 'rain' | 'night' | 'wind', volume: number) {
        if (this.isPlaying) this.stop();

        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = volume;
        this.gainNode.connect(this.audioContext.destination);

        // Create noise buffer
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'rain') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3;
                if (Math.random() > 0.998) data[i] *= 3;
            }
        } else if (type === 'night') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.1;
                if (Math.random() > 0.9995) {
                    for (let j = 0; j < 100 && i + j < bufferSize; j++) {
                        data[i + j] = Math.sin(j * 0.5) * 0.4 * (1 - j / 100);
                    }
                }
            }
        } else {
            for (let i = 0; i < bufferSize; i++) {
                const mod = Math.sin(i * 0.0001) * 0.5 + 0.5;
                data[i] = (Math.random() * 2 - 1) * 0.2 * mod;
            }
        }

        this.noiseNode = this.audioContext.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = type === 'wind' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 2000 : type === 'night' ? 3000 : 500;
        filter.Q.value = type === 'night' ? 2 : 1;

        this.noiseNode.connect(filter);
        filter.connect(this.gainNode);
        this.noiseNode.start();
        this.isPlaying = true;
    }

    stop() {
        if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode.disconnect();
            this.noiseNode = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isPlaying = false;
    }

    setVolume(volume: number) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }
}

type SoundType = 'rain' | 'night' | 'wind' | 'custom';

export function AmbientSound() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState<SoundType>('rain');
    const [volume, setVolume] = useState(0.3);
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [customFileName, setCustomFileName] = useState<string>('');

    const generatorRef = useRef<AmbientSoundGenerator | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopAllAudio = useCallback(() => {
        if (generatorRef.current) {
            generatorRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    const handlePlay = useCallback(() => {
        if (isPlaying) {
            stopAllAudio();
            setIsPlaying(false);
            return;
        }

        if (currentSound === 'custom') {
            if (customFile && audioRef.current) {
                audioRef.current.src = URL.createObjectURL(customFile);
                audioRef.current.volume = volume;
                audioRef.current.loop = true;
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch((e) => console.error('Custom audio play failed:', e));
            }
        } else {
            if (!generatorRef.current) {
                generatorRef.current = new AmbientSoundGenerator();
            }
            generatorRef.current.start(currentSound, volume);
            setIsPlaying(true);
        }
    }, [isPlaying, currentSound, volume, customFile, stopAllAudio]);

    const handleSoundChange = useCallback((sound: SoundType) => {
        const wasPlaying = isPlaying;
        if (wasPlaying) {
            stopAllAudio();
        }
        setCurrentSound(sound);

        if (wasPlaying) {
            setTimeout(() => {
                if (sound === 'custom') {
                    if (customFile && audioRef.current) {
                        audioRef.current.src = URL.createObjectURL(customFile);
                        audioRef.current.volume = volume;
                        audioRef.current.loop = true;
                        audioRef.current.play().catch(console.error);
                    }
                } else {
                    if (!generatorRef.current) {
                        generatorRef.current = new AmbientSoundGenerator();
                    }
                    generatorRef.current.start(sound, volume);
                }
            }, 100);
        }
    }, [isPlaying, volume, customFile, stopAllAudio]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (generatorRef.current) {
            generatorRef.current.setVolume(newVolume);
        }
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomFile(file);
            setCustomFileName(file.name.length > 15 ? file.name.slice(0, 12) + '...' : file.name);
            setCurrentSound('custom');
        }
    }, []);

    const handleRemoveCustom = useCallback(() => {
        if (currentSound === 'custom' && isPlaying) {
            stopAllAudio();
            setIsPlaying(false);
        }
        setCustomFile(null);
        setCustomFileName('');
        if (currentSound === 'custom') {
            setCurrentSound('rain');
        }
    }, [currentSound, isPlaying, stopAllAudio]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const soundButtons = [
        { id: 'rain' as const, name: 'Rain', icon: <CloudRain className="w-4 h-4" /> },
        { id: 'night' as const, name: 'Night', icon: <Moon className="w-4 h-4" /> },
        { id: 'wind' as const, name: 'Wind', icon: <Wind className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
            {/* Hidden elements */}
            <audio ref={audioRef} />
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Ambient Sounds</h3>
                <button
                    onClick={handlePlay}
                    disabled={currentSound === 'custom' && !customFile}
                    className={`p-2 rounded-lg transition-all ${isPlaying
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50'
                        }`}
                    title={isPlaying ? 'Stop' : 'Play'}
                >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
            </div>

            {/* Sound Options */}
            <div className="flex gap-2 mb-3">
                {soundButtons.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => handleSoundChange(sound.id)}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${currentSound === sound.id
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {sound.icon}
                        <span className="text-xs">{sound.name}</span>
                    </button>
                ))}
            </div>

            {/* Custom Music Section */}
            <div className="mb-3 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUploadClick}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${currentSound === 'custom' && customFile
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {customFile ? (
                            <>
                                <Music className="w-4 h-4" />
                                <span className="text-xs truncate">{customFileName}</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span className="text-xs">Upload Music</span>
                            </>
                        )}
                    </button>
                    {customFile && (
                        <button
                            onClick={handleRemoveCustom}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            title="Remove custom music"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2">
                <VolumeX className="w-3 h-3 text-muted-foreground" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
                <Volume2 className="w-3 h-3 text-muted-foreground" />
            </div>

            {isPlaying && (
                <p className="text-xs text-primary mt-2 text-center animate-pulse">
                    ♪ Now playing: {currentSound === 'custom' ? customFileName : soundButtons.find((s) => s.id === currentSound)?.name}
                </p>
            )}
        </div>
    );
}

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const VoiceContext = createContext();

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
    const socket = useSocket();
    const { user } = useAuth();
    const [myPeer, setMyPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState(null);
    const [streams, setStreams] = useState({}); // userId -> MediaStream
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
    const [volume, setVolume] = useState(1); // 0 to 1
    const [isSpeaking, setIsSpeaking] = useState({}); // userId -> boolean
    const localStreamRef = useRef(null);
    const peersRef = useRef({}); // userId -> peer call

    useEffect(() => {
        if (!user) return;

        let p;
        const initializePeer = async () => {
            console.log('[Voice] Initializing PeerJS Cloud...');

            // Explicitly use PeerJS Cloud with Google STUN servers
            p = new Peer(undefined, {
                key: 'peerjs', // Explicitly use the default PeerJS key for stability
                host: '0.peerjs.com',
                port: 443,
                secure: true,
                debug: 3,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                    ],
                    sdpSemantics: 'unified-plan'
                }
            });

            p.on('open', (id) => {
                console.log('[Voice] Peer opened with ID:', id);
                setMyPeerId(id);
                setMyPeer(p);
            });

            p.on('call', async (call) => {
                console.log('[Voice] Incoming call from peer:', call.peer, 'metadata:', call.metadata);
                const stream = await getLocalStream();
                if (!stream) {
                    console.error('[Voice] No local stream to answer call');
                    return;
                }

                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    const audioTracks = remoteStream.getAudioTracks();
                    console.log('[Voice] Received remote stream from peer:', call.peer,
                        'Tracks:', audioTracks.length,
                        'Enabled:', audioTracks[0]?.enabled,
                        'State:', audioTracks[0]?.readyState);

                    if (audioTracks.length > 0) {
                        setStreams(prev => ({ ...prev, [call.peer]: remoteStream }));
                        trackVoiceActivity(call.peer, remoteStream);
                    } else {
                        console.warn('[Voice] Received stream with no audio tracks from:', call.peer);
                    }
                });

                call.on('error', (err) => console.error('[Voice] Call error:', err));
            });

            p.on('error', (err) => {
                console.error('[Voice] Peer error:', err);
            });
        };

        getLocalStream();
        initializePeer();

        return () => {
            console.log('[Voice] Cleaning up Peer and streams');
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            Object.values(peersRef.current).forEach(call => call.close());
            if (p) p.destroy();
        };
    }, [user]);

    const getLocalStream = async () => {
        if (localStreamRef.current) return localStreamRef.current;
        try {
            console.log('[Voice] Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            console.log('[Voice] Microphone access granted',
                'Track:', stream.getAudioTracks()[0]?.label);

            localStreamRef.current = stream;
            // Note: For local activity detection, we can use 'local' as key or myPeerId if available
            trackVoiceActivity('local', stream);
            return stream;
        } catch (err) {
            console.error('[Voice] Failed to get microphone access:', err);
            return null;
        }
    };

    const audioContextRef = useRef(null);

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[Voice] AudioContext created. Current state:', audioContextRef.current.state);
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().then(() => {
                console.log('[Voice] AudioContext resumed successfully. State:', audioContextRef.current.state);
            }).catch(err => {
                console.error('[Voice] Failed to resume AudioContext:', err);
            });
        }
        return audioContextRef.current;
    };

    const trackVoiceActivity = (peerId, stream) => {
        try {
            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) return;

            const audioContext = getAudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            // Prevent Garbage Collection
            if (!window._voiceNodes) window._voiceNodes = {};
            if (window._voiceNodes[peerId]) {
                window._voiceNodes[peerId].source.disconnect();
            }
            window._voiceNodes[peerId] = { source, analyser };

            const dataArray = new Float32Array(analyser.fftSize);
            let logCounter = 0;

            const checkVolume = () => {
                if (!window._voiceNodes[peerId]) return;
                analyser.getFloatTimeDomainData(dataArray);

                // Calculate RMS (Root Mean Square) - much more accurate than byte data
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i] * dataArray[i];
                }
                const rms = Math.sqrt(sum / dataArray.length);
                const volts = rms * 100;
                const speaking = volts > 1.5; // RMS threshold is lower

                logCounter++;
                if (logCounter % 180 === 0) {
                    console.log(`[Voice] Activity Debug (${peerId}): Volts=${volts.toFixed(2)}, RMS=${rms.toFixed(4)}, State=${audioContext.state}`);
                }

                setIsSpeaking(prev => {
                    if (prev[peerId] === speaking) return prev;
                    return { ...prev, [peerId]: speaking };
                });

                requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (err) {
            console.error('[Voice] Error tracking voice activity:', err);
        }
    };

    const testMic = () => {
        if (!localStreamRef.current) {
            console.warn('[Voice] Cannot test mic: No local stream');
            return;
        }
        console.log('[Voice] Starting 2s Mic Echo Test...');
        try {
            const ctx = getAudioContext();
            const source = ctx.createMediaStreamSource(localStreamRef.current);
            const gain = ctx.createGain();
            gain.gain.value = 0.3;
            source.connect(gain);
            gain.connect(ctx.destination);

            setTimeout(() => {
                source.disconnect();
                gain.disconnect();
                console.log('[Voice] Mic Echo Test Finished.');
            }, 2000);
        } catch (err) {
            console.error('[Voice] Mic test failed:', err);
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                // Resume audio context on interaction
                getAudioContext();
            }
        }
    };

    const toggleSpeaker = () => {
        const newState = !isSpeakerEnabled;
        setIsSpeakerEnabled(newState);
        // Force resume AudioContext when toggling speaker
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
    };

    const repairAudio = async () => {
        console.log('[Voice] Manual audio repair triggered');
        const ctx = getAudioContext();
        await ctx.resume();
        console.log('[Voice] Context resumed. Attempting to play all streams...');

        // Re-trigger play for all local audio elements
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            audio.play().catch(e => console.error('[Voice] Repair play failed:', e));
        });
    };

    const callUser = async (targetUserId, targetPeerId) => {
        if (!myPeer || !targetPeerId || peersRef.current[targetPeerId]) return;

        const stream = await getLocalStream();
        if (!stream) return;

        console.log(`[Voice] Calling peer ${targetPeerId} (User: ${targetUserId})`);
        const call = myPeer.call(targetPeerId, stream, { metadata: { userId: user.username } });

        call.on('stream', (remoteStream) => {
            console.log('[Voice] Received stream back from peer:', targetPeerId,
                'Track Active:', remoteStream.getAudioTracks()[0]?.enabled);

            setStreams(prev => ({ ...prev, [targetPeerId]: remoteStream }));
            trackVoiceActivity(targetPeerId, remoteStream);
        });

        call.on('close', () => {
            console.log('[Voice] Call closed with peer:', targetPeerId);
            setStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[targetPeerId];
                return newStreams;
            });
            delete peersRef.current[targetPeerId];
        });

        peersRef.current[targetPeerId] = call;
    };

    const disconnectCall = (peerId) => {
        if (peersRef.current[peerId]) {
            peersRef.current[peerId].close();
            delete peersRef.current[peerId];
        }
    };

    return (
        <VoiceContext.Provider value={{
            myPeerId,
            streams,
            isMuted,
            toggleMute,
            isSpeakerEnabled,
            toggleSpeaker,
            volume,
            setVolume,
            callUser,
            disconnectCall,
            isSpeaking,
            repairAudio,
            testMic
        }}>
            {children}
            {/* Hidden audio elements for remote streams */}
            {Object.entries(streams).map(([userId, stream]) => (
                <AudioElement
                    key={userId}
                    stream={stream}
                    enabled={isSpeakerEnabled}
                    volume={volume}
                />
            ))}
        </VoiceContext.Provider>
    );
};

// Refactored AudioElement with memo to prevent AbortError
const AudioElement = React.memo(({ stream, enabled, volume }) => {
    const audioRef = useRef();

    // Stability: Only set srcObject ONCE when stream changes
    useEffect(() => {
        if (audioRef.current && stream) {
            console.log('[Voice] Attaching stream to audio element');
            audioRef.current.srcObject = stream;

            // Critical Fix: Trigger play when stream is attached if enabled
            if (enabled) {
                audioRef.current.play().catch(err => {
                    if (err.name !== 'AbortError') {
                        console.warn('[Voice] Initial stream playback failed:', err);
                    }
                });
            }
        }
    }, [stream, enabled]);

    // Handle Play/Pause and Volume separately to avoid resetting srcObject
    useEffect(() => {
        if (!audioRef.current) return;

        if (enabled) {
            audioRef.current.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.warn('[Voice] Speaker toggle playback failed:', err);
                }
            });
        } else {
            audioRef.current.pause();
        }
    }, [enabled]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = enabled ? volume : 0;
            audioRef.current.muted = !enabled;
        }
    }, [enabled, volume]);

    // Use absolute positioning with zero size instead of display: none to satisfy some browsers
    return (
        <audio
            ref={audioRef}
            autoPlay
            playsInline
            style={{ position: 'fixed', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }}
        />
    );
});

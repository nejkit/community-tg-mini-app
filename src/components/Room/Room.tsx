import  {useEffect, useMemo, useState} from "react";
import { Track } from "livekit-client";
import {
    useLocalParticipant,
    useRoomContext,
    useConnectionState, useParticipants,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "./styles.css";
import WebApp from "@twa-dev/sdk";
import {Alert} from "../Allert/Allert.tsx";

export function CallUI() {
    const room = useRoomContext();
    const conn = useConnectionState();
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();
    const remoteParticipants = participants.filter(
        (p) => !p.isLocal
    );

    const [showDevices, setShowDevices] = useState(false);

    const pub = localParticipant?.getTrackPublication(Track.Source.Microphone);
    const isMuted = pub?.isMuted ?? true;

    const isConnected = conn === ConnectionState.Connected;

    async function toggleMute() {
        await localParticipant?.setMicrophoneEnabled(isMuted);
    }

    async function setMic(deviceId: string) {
        await room?.switchActiveDevice("audioinput", deviceId);
        setShowDevices(false);
    }

    function closeMiniApp() {
        const tg = (WebApp as any)?.default ?? WebApp;
        if (!tg) return;

        tg.close();
    }

    const statusText = useMemo(() => {
        if (conn === ConnectionState.Connecting) return "Connecting…";
        if (conn === ConnectionState.Reconnecting) return "Reconnecting…";
        if (conn === ConnectionState.Disconnected) return "Disconnected";
        return "Connected";
    }, [conn]);

    return (
        <div className="tg-room">
            {/* Header */}
            <header className="tg-room__header">
                <div className="tg-room__title">Voice room</div>
                <div className="tg-room__status">{statusText}</div>
            </header>
            <Alert/>
            {/* Participants */}
            <section className="tg-room__participants">
                {/* YOU */}
                <div className="tg-user is-self">
                    <div className="tg-avatar">🧑</div>
                    <div className="tg-name">
                        {localParticipant?.name || "You"}
                    </div>
                    <div className="tg-state">
                        {isMuted ? "Muted" : "Speaking"}
                    </div>
                </div>

                {/* OTHERS */}
                {remoteParticipants.map((p) => {
                    const pub = p.getTrackPublication(Track.Source.Microphone);
                    const muted = pub?.isMuted ?? true;
                    const speaking = p.audioLevel > 0.02 && !muted;

                    return (
                        <div key={p.identity} className="tg-user">
                            <div className="tg-avatar">👤</div>
                            <div className="tg-name">
                                {p.identity || "Participant"}
                            </div>
                            <div className="tg-state">
                                {muted ? "Muted": speaking ? "Speaking" : "Listening"}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Controls */}
            <section className="tg-room__controls">
                <button
                    className={`tg-mic-btn ${isMuted ? "off" : "on"}`}
                    onClick={toggleMute}
                    disabled={!isConnected}
                >
                    {isMuted ? "🔇 Unmute" : "🎙 Mute"}
                </button>

                <button
                    className="tg-secondary-btn"
                    onClick={() => setShowDevices(true)}
                    disabled={!isConnected}
                >
                    Microphone
                </button>

                <button
                    className="tg-leave-btn"
                    onClick={() => {
                        room?.disconnect()
                        closeMiniApp()
                    }}
                >
                    Leave room
                </button>
            </section>

            {showDevices && (
                <DeviceSheet onClose={() => setShowDevices(false)} onPick={setMic}/>
            )}
        </div>
    );
}

/* ===== Device Sheet ===== */
function DeviceSheet({
                         onClose,
                         onPick,
                     }: {
    onClose: () => void;
    onPick: (id: string) => void;
}) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const all = await navigator.mediaDevices.enumerateDevices();
            if (!mounted) return;

            setDevices(all.filter((d) => d.kind === "audioinput"));
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="tg-sheet" onClick={onClose}>
            <div className="tg-sheet__panel" onClick={(e) => e.stopPropagation()}>
                <div className="tg-sheet__handle"/>
                <div className="tg-sheet__title">Microphone</div>

                {devices.map((d, i) => (
                    <button
                        key={d.deviceId}
                        className="tg-sheet__item"
                        onClick={() => onPick(d.deviceId)}
                    >
                        {d.label || `Microphone ${i + 1}`}
                    </button>
                ))}

                <button className="tg-sheet__close" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

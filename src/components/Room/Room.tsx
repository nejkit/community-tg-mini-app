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
import {useTranslation} from "react-i18next";

export function CallUI() {
    const room = useRoomContext();
    const conn = useConnectionState();
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();
    const remoteParticipants = participants.filter(
        (p) => !p.isLocal
    );
    const {t} = useTranslation();

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
        if (conn === ConnectionState.Connecting) return t('connecting_status');
        if (conn === ConnectionState.Reconnecting) return t('reconnect_status');
        if (conn === ConnectionState.Disconnected) return t('disconnected_status');
        return t('connected_status');
    }, [conn, t]);

    return (
        <div className="tg-room">
            {/* Header */}
            <header className="tg-room__header">
                <div className="tg-room__title">{t('voice_room')}</div>
                <div className="tg-room__status">{statusText}</div>
            </header>
            <Alert/>
            {/* Participants */}
            <section className="tg-room__participants">
                {/* YOU */}
                <div className="tg-user is-self">
                    <div className="tg-avatar">🧑</div>
                    <div className="tg-name">
                        {localParticipant?.name || t('you_call_caption')}
                    </div>
                    <div className="tg-state">
                        {isMuted ? t('muted_status') : t('speaking_status')}
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
                                {p.identity || t('participant_default_name')}
                            </div>
                            <div className="tg-state">
                                {muted ? t('muted_status'): speaking ? t('speaking_status') : t('listening_status')}
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
                    {isMuted ? t('unmute_button') : t('mute_button')}
                </button>

                <button
                    className="tg-secondary-btn"
                    onClick={() => setShowDevices(true)}
                    disabled={!isConnected}
                >
                    {t('microphone_button')}
                </button>

                <button
                    className="tg-leave-btn"
                    onClick={() => {
                        room?.disconnect()
                        closeMiniApp()
                    }}
                >
                    {t('leave_room_button')}
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
    const {t}= useTranslation();

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
                <div className="tg-sheet__title">{t('microphone_label')}</div>

                {devices.map((d, i) => (
                    <button
                        key={d.deviceId}
                        className="tg-sheet__item"
                        onClick={() => onPick(d.deviceId)}
                    >
                        {d.label || `${t('microphone_label')}: ${i + 1}`}
                    </button>
                ))}

                <button className="tg-sheet__close" onClick={onClose}>
                    {t('close_button')}
                </button>
            </div>
        </div>
    );
}

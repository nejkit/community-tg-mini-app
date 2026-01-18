import { useMemo, useState } from "react";
import { Track } from "livekit-client";
import {
    useLocalParticipant,
    useRoomContext,
    useConnectionState,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

export function CallUI() {
    const room = useRoomContext();
    const conn = useConnectionState();
    const { localParticipant } = useLocalParticipant();

    const [showDevices, setShowDevices] = useState(false);

    const isConnected = conn === ConnectionState.Connected;
    const isMuted = useMemo(() => {
        const pub = localParticipant?.getTrackPublication(Track.Source.Microphone);
        return pub?.isMuted ?? false;
    }, [localParticipant]);

    async function toggleMute() {
        // В LiveKit это корректный способ управлять микрофоном
        await localParticipant?.setMicrophoneEnabled(isMuted);
    }

    async function setMic(deviceId: string) {
        await room?.switchActiveDevice("audioinput", deviceId);
        setShowDevices(false);
    }

    const statusText = useMemo(() => {
        if (conn === ConnectionState.Connecting) return "Connecting…";
        if (conn === ConnectionState.Reconnecting) return "Reconnecting…";
        if (conn === ConnectionState.Disconnected) return "Disconnected";
        return "Connected";
    }, [conn]);

    return (
        <div className="call">
            <div className="callTop">
                <div className="callRole">{localParticipant.name}</div>
                <div className="callStatus">{statusText}</div>
            </div>

            <div className="callCenter">
                <button
                    className={`callMic ${isMuted ? "muted" : "live"}`}
                    onClick={toggleMute}
                    disabled={!isConnected}
                >
                    {isMuted ? "Mic OFF" : "Mic ON"}
                </button>

                <button className="callDeviceBtn" onClick={() => setShowDevices(true)} disabled={!isConnected}>
                    Выбрать микрофон
                </button>
            </div>

            <div className="callBottom">
                <button className="callLeave" onClick={() => room?.disconnect()}>
                    Leave
                </button>
            </div>

            {showDevices && (
                <DeviceSheet
                    onClose={() => setShowDevices(false)}
                    onPick={setMic}
                />
            )}
        </div>
    );
}

function DeviceSheet({
                         onClose,
                         onPick,
                     }: {
    onClose: () => void;
    onPick: (id: string) => void;
}) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useMemo(() => {
        (async () => {
            const all = await navigator.mediaDevices.enumerateDevices();
            setDevices(all.filter((d) => d.kind === "audioinput"));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="sheetOverlay" onClick={onClose}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="sheetTitle">Microphone</div>

                <div className="sheetList">
                    {devices.map((d, idx) => (
                        <button
                            key={d.deviceId}
                            className="sheetItem"
                            onClick={() => onPick(d.deviceId)}
                            title={d.label}
                        >
                            {d.label || `Microphone ${idx + 1}`}
                        </button>
                    ))}
                </div>

                <button className="sheetClose" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

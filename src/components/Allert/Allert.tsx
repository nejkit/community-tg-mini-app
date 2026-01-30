import { useEffect, useState } from "react";
import {
    RoomEvent,
    ParticipantEvent,
    Track,
    DisconnectReason,
} from "livekit-client";
import {
    useLocalParticipant,
    useRoomContext,
} from "@livekit/components-react";
import "./styles.css";

/* =========================
   Types
========================= */

type AlertType = "info" | "warning" | "error";

type Alert = {
    id: number;
    message: string;
    type: AlertType;
    submitLabel?: string;
    onSubmit?: () => void;
};

let alertId = 0;

/* =========================
   Helpers
========================= */

function isFatalDisconnect(reason?: DisconnectReason) {
    return (
        reason === DisconnectReason.SERVER_SHUTDOWN ||
        reason === DisconnectReason.ROOM_DELETED ||
        reason === DisconnectReason.PARTICIPANT_REMOVED ||
        reason === DisconnectReason.STATE_MISMATCH
    );
}

function closeTelegramApp(delay = 0) {
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;

    setTimeout(() => {
        try {
            tg.close();
        } catch {
            // noop
        }
    }, delay);
}

/* =========================
   Component
========================= */

export function Alert() {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();

    const [alerts, setAlerts] = useState<Alert[]>([]);

    function pushAlert(alert: Omit<Alert, "id">, ttl = 4000) {
        const id = ++alertId;
        setAlerts((a) => [...a, { ...alert, id }]);

        // если нет submit handler — автозакрываем
        if (!alert.onSubmit) {
            setTimeout(() => {
                setAlerts((a) => a.filter((x) => x.id !== id));
            }, ttl);
        }
    }

    useEffect(() => {
        if (!room || !localParticipant) return;

        /* ===== Room events ===== */

        const onDisconnected = (reason?: DisconnectReason) => {
            const fatal = isFatalDisconnect(reason);

            if (fatal) {
                pushAlert({
                    message: "Room closed. The call has ended.",
                    type: "error",
                    submitLabel: "Exit",
                    onSubmit: () => {
                        room.disconnect();
                        closeTelegramApp();
                    },
                });
            } else {
                pushAlert({
                    message: `Disconnected: ${reason ?? "unknown reason"}`,
                    type: "warning",
                });
            }
        };

        const onReconnecting = () => {
            pushAlert({
                message: "Reconnecting…",
                type: "warning",
            });
        };

        const onReconnected = () => {
            pushAlert({
                message: "Reconnected",
                type: "info",
            });
        };

        const onParticipantConnected = (p: any) => {
            pushAlert({
                message: `${p.name || p.identity} joined`,
                type: "info",
            });
        };

        const onParticipantDisconnected = (p: any) => {
            pushAlert({
                message: `${p.name || p.identity} left`,
                type: "warning",
            });
        };

        const onMediaDevicesChanged = () => {
            pushAlert({
                message: "Audio devices changed",
                type: "info",
            });
        };

        const onMediaDevicesError = (err: Error) => {
            pushAlert(
                {
                    message: `Media device error: ${err.message}`,
                    type: "error",
                },
                6000
            );
        };

        /* ===== Local participant ===== */

        const onTrackMuted = (pub: any) => {
            if (pub.source === Track.Source.Microphone) {
                pushAlert({
                    message: "Microphone muted",
                    type: "warning",
                });
            }
        };

        /* ===== Subscribe ===== */

        room.on(RoomEvent.Disconnected, onDisconnected);
        room.on(RoomEvent.Reconnecting, onReconnecting);
        room.on(RoomEvent.Reconnected, onReconnected);
        room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
        room.on(RoomEvent.MediaDevicesChanged, onMediaDevicesChanged);
        room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);

        localParticipant.on(ParticipantEvent.TrackMuted, onTrackMuted);

        return () => {
            room.off(RoomEvent.Disconnected, onDisconnected);
            room.off(RoomEvent.Reconnecting, onReconnecting);
            room.off(RoomEvent.Reconnected, onReconnected);
            room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
            room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
            room.off(RoomEvent.MediaDevicesChanged, onMediaDevicesChanged);
            room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);

            localParticipant.off(ParticipantEvent.TrackMuted, onTrackMuted);
        };
    }, [room, localParticipant]);

    /* =========================
       Render
    ========================= */

    return (
        <div className="callAlerts">
            {alerts.map((a) => (
                <div key={a.id} className={`callAlert ${a.type}`}>
                    <div className="callAlertText">{a.message}</div>

                    {a.submitLabel && a.onSubmit && (
                        <button
                            className="callAlertAction"
                            onClick={() => {
                                a.onSubmit?.();
                                setAlerts((x) => x.filter((i) => i.id !== a.id));
                            }}
                        >
                            {a.submitLabel}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

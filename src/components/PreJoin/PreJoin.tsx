import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import {useTranslation} from "react-i18next";

type Props = {
    onJoin: (v: {
        audioEnabled: boolean;
        audioDeviceId?: string;
    }) => void;
};

type AudioDevice = {
    deviceId: string;
    label: string;
};

export function CustomPreJoin({ onJoin }: Props) {
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [devices, setDevices] = useState<AudioDevice[]>([]);
    const [audioDeviceId, setAudioDeviceId] = useState("");
    const [permGranted, setPermGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {t} = useTranslation();

    async function loadDevices() {
        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list
            .filter((d) => d.kind === "audioinput")
            .map((d, i) => ({
                deviceId: d.deviceId,
                label: d.label || `${t('microphone')} ${i + 1}`,
            }));

        setDevices(mics);
        if (!audioDeviceId && mics[0]) {
            setAudioDeviceId(mics[0].deviceId);
        }
    }

    async function enableMic() {
        try {
            setError(null);
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermGranted(true);
            await loadDevices();
        } catch {
            setError("Microphone access denied");
            setPermGranted(false);
            setAudioEnabled(false);
        }
    }

    function toggleMic() {
        setAudioEnabled((prev) => {
            const next = !prev;
            if (next) enableMic();
            return next;
        });
    }

    useEffect(() => {
        loadDevices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canJoin = useMemo(() => {
        if (!audioEnabled) return true;
        return permGranted && Boolean(audioDeviceId);
    }, [audioEnabled, permGranted, audioDeviceId]);

    return (
        <div className="tg-prejoin">
            <header className="tg-prejoin__header">
                <h1>{t('voice_room')}</h1>
                <p>{t('connect_and_talk_instantly')}</p>
            </header>

            <main className="tg-prejoin__content">
                <button
                    type="button"
                    className={`tg-mic-toggle ${audioEnabled ? "is-on" : "is-off"}`}
                    onClick={toggleMic}
                >
                    {audioEnabled ? <span>{t('microphone_on')}</span> : <span>{t('microphone_off')}</span>}
                </button>

                <label className="tg-field">
                    <span>{t('microphone_label')}</span>
                    <select
                        value={audioDeviceId}
                        disabled={!audioEnabled || !permGranted}
                        onChange={(e) => setAudioDeviceId(e.target.value)}
                    >
                        {!audioEnabled && (
                            <option value="">{t('microphone_is_off')}</option>
                        )}
                        {devices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </label>

                {error && <div className="tg-error">{error}</div>}

                <button
                    className="tg-join-btn"
                    disabled={!canJoin}
                    onClick={() =>
                        onJoin({
                            audioEnabled,
                            audioDeviceId: audioDeviceId || undefined,
                        })
                    }
                >
                    {t('join_button')}
                </button>
            </main>

            <footer className="tg-prejoin__footer">
                {t('tip_use_quality_sound')}
            </footer>
        </div>
    );
}

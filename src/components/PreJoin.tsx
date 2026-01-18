import { useEffect, useMemo, useState } from "react";
import "./styles.css"

type Props = {
    defaultName?: string;
    onJoin: (v: {
        username: string;
        audioEnabled: boolean;
        audioDeviceId?: string;
    }) => void;
};

type AudioDevice = { deviceId: string; label: string };

export function CustomPreJoin({ defaultName = "Guest", onJoin }: Props) {
    const [username, setUsername] = useState(defaultName);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [devices, setDevices] = useState<AudioDevice[]>([]);
    const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
    const [permGranted, setPermGranted] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function loadDevices() {
        const all = await navigator.mediaDevices.enumerateDevices();
        const audios = all
            .filter((d) => d.kind === "audioinput")
            .map((d, idx) => ({
                deviceId: d.deviceId,
                label: d.label || `Microphone ${idx + 1}`,
            }));

        setDevices(audios);
        if (!audioDeviceId && audios[0]) setAudioDeviceId(audios[0].deviceId);
    }

    async function enableMic() {
        try {
            setErr(null);
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermGranted(true);
            await loadDevices();
        } catch (e: any) {
            setErr("Microphone access denied");
            setPermGranted(false);
            setAudioEnabled(false);
        }
    }

    function toggleMic() {
        setAudioEnabled((prev) => {
            if (!prev) enableMic();
            return !prev;
        });
    }

    useEffect(() => {
        // подгрузить девайсы, если уже есть доступ
        loadDevices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canJoin = useMemo(() => {
        if (!audioEnabled) return true;
        return permGranted && Boolean(audioDeviceId);
    }, [audioEnabled, permGranted, audioDeviceId]);

    return (
        <div className="cpj">
            <div className="cpjTitle">Voice room</div>
            <div className="cpjSubtitle">Connect and talk instantly</div>

            <div className="cpjSection">Join voice room</div>

            <label className="cpjLabel">
                Name
                <input
                    className="cpjInput"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                />
            </label>

            <div className="cpjRow">
                <button
                    type="button"
                    className={`cpjBtn ${audioEnabled ? "on" : "off"}`}
                    onClick={toggleMic}
                >
                    {audioEnabled ? "🎙 Mic ON" : "🔇 Mic OFF"}
                </button>
            </div>

            <label className="cpjLabel">
                Microphone device
                <select
                    className="cpjSelect"
                    value={audioDeviceId ?? ""}
                    onChange={(e) => setAudioDeviceId(e.target.value)}
                    disabled={!audioEnabled || !permGranted}
                >
                    <option value="" disabled>
                        {audioEnabled ? "Choose microphone" : "Microphone is off"}
                    </option>
                    {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label}
                        </option>
                    ))}
                </select>
            </label>

            {err && <div className="cpjError">{err}</div>}

            <button
                type="button"
                className="cpjJoin"
                disabled={!canJoin}
                onClick={() =>
                    onJoin({ username, audioEnabled, audioDeviceId })
                }
            >
                Join
            </button>

            <div className="cpjHint">Tip: headphones reduce echo</div>
        </div>
    );
}

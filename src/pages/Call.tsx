import { useEffect, useMemo, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import WebApp from "@twa-dev/sdk";
import type { GetJoinRoomParamsResponseDto } from "../services/interfaces.ts";
import { getJoinParams } from "../services/api.ts";
import "./call.css";
import { CustomPreJoin } from "../components/PreJoin.tsx";
import {CallUI} from "../components/Room.tsx";

const tg = (WebApp as any)?.default ?? WebApp;

export default function CallPage() {
    const [preJoin, setPreJoin] = useState<{
        username: string;
        audioEnabled: boolean;
        audioDeviceId?: string;
    } | null>(null);

    const [roomData, setRoomData] = useState<GetJoinRoomParamsResponseDto | undefined>();

    useEffect(() => {
        try {
            tg?.ready?.();
            tg?.expand?.();
        } catch {}

        getJoinParams(tg.initData).then(setRoomData);
    }, []);

    const isReady = useMemo(
        () => Boolean(roomData?.serverUrl && roomData?.token),
        [roomData]
    );

    return (
        <div className="tg-page">
            <div className="tg-container">
                <div className="card">
                    <div className="cardInner">
                        <div className="cardContent">
                            {!isReady && (
                                <div className="loading">
                                    <div className="spinner" />
                                    <div>Preparing room…</div>
                                </div>
                            )}

                            {isReady && preJoin && (
                                <div className="roomWrap">
                                    <LiveKitRoom
                                        serverUrl={roomData!.serverUrl}
                                        token={roomData!.token}
                                        audio={{ deviceId: preJoin.audioDeviceId }}
                                        video={false}
                                        onError={(err) => console.error("Failed to connect: ", err)}
                                    >
                                        <CallUI/>
                                    </LiveKitRoom>
                                </div>
                            )}

                            {isReady && !preJoin && (
                                <div className="prejoinWrap">
                                    <CustomPreJoin defaultName="Guest" onJoin={(v) => setPreJoin(v)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* оставь только один Tip — лучше тут, а внутри CustomPreJoin можно убрать */}
                <div className="hint">Tip: use headphones to avoid echo</div>
            </div>
        </div>
    );
}

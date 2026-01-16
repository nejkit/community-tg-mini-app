import {useEffect, useState} from "react";
import {AudioConference, LiveKitRoom, PreJoin} from "@livekit/components-react";
import WebApp from "@twa-dev/sdk";
import type {GetJoinRoomParamsResponseDto} from "../services/interfaces.ts";
import {getJoinParams} from "../services/api.ts";

const tg = (WebApp as any)?.default ?? WebApp;

type PreJoinValues = {
    username: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
};

export default function CallPage() {
    const [preJoin, setPreJoin] = useState<PreJoinValues | null>(null);
    const [roomData, setRoomData] = useState<GetJoinRoomParamsResponseDto | undefined>()

    useEffect(() => {
        getJoinParams(tg.initData).then(
            res => setRoomData(res)
        )
    }, []);


    if (!roomData) {
        return null;
    }

    if (preJoin) {
        return (
            <>
                <h1>Connected</h1>
                <LiveKitRoom
                    serverUrl={roomData.serverUrl}
                    token={roomData.token}
                    audio={preJoin.audioEnabled}
                    video={preJoin.videoEnabled}
                    onError={(err) => console.error("Failed to connect: ", err)}
                >
                    <AudioConference/>
                </LiveKitRoom></>
        )
    }

    return (
        <PreJoin
            defaults={{
                audioEnabled: true,
                videoEnabled: false
            }}
            joinLabel={"Join to room"}
            userLabel={"Guest"}
            micLabel={"Microphone"}
            camLabel={"Camera"}
            debug={true}
            onSubmit={setPreJoin}
        />
    )
}
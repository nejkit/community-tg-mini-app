import {useEffect, useState} from "react";
import initTelegram from "./Tg.tsx";
import {LiveKitRoom, PreJoin} from "@livekit/components-react";
import WebApp from "@twa-dev/sdk";
import type {GetJoinRoomParamsResponseDto} from "../services/interfaces.ts";
import {getJoinParams} from "../services/api.ts";

type PreJoinValues = {
    username: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
};

export default function CallPage() {
    const [preJoin, setPreJoin] = useState<PreJoinValues | null>(null);
    const [roomData, setRoomData] = useState<GetJoinRoomParamsResponseDto | undefined>()

    useEffect(() => {
        initTelegram()
        getJoinParams(WebApp.initData).then(
            res => setRoomData(res)
        )
    }, []);


    if (!roomData) {
        return null;
    }

    if (preJoin) {
        return <LiveKitRoom
            serverUrl={""}
            token={roomData.token}
            audio={preJoin.audioEnabled}
            video={preJoin.videoEnabled}
        >

        </LiveKitRoom>
    }

    return (
        <PreJoin
            defaults={{
                username: "Guest",
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
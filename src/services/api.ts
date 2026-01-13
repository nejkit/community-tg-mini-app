import {apiHttpClient} from "./fetcher.ts";
import type {GetJoinRoomParamsResponseDto} from "./interfaces.ts";

export const getJoinParams = (userData: string) => {
    return apiHttpClient()<GetJoinRoomParamsResponseDto>({
        method: 'GET',
        url: '/api/1/room-info',
        headers: {
            Authorization: `Bearer ${userData}`
        }
    })
}
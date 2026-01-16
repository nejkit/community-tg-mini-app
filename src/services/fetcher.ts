import axios, {type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from "axios";

const getClient = () => {
    return axios.create({
        baseURL: "https://imperscriptible-fe-tectricial.ngrok-free.dev"
    })
}

interface RequestOptions extends AxiosRequestConfig {
    url: string;
}

export const apiHttpClient = () => callApi(getClient())

const callApi =
    (httpClient: AxiosInstance) =>
        async <T>({url, ...request}: RequestOptions): Promise<T | undefined> => {
            return httpClient<T>({
                url,
                ...request
            }).then(
                (res: AxiosResponse<T>) => res.data,
                (err: AxiosError) => {
                    throw new Error(`fail call api with url: ${err.config?.baseURL}/${err.config?.url} message: ${err.message}`);
                },
            )
        }

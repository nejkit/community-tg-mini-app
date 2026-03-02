import i18n from "i18next";
import {initReactI18next} from "react-i18next";

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        debug: true,

        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    voice_room: "Voice chat",
                    join_button: "Join",
                },
            },
            ru: {
                translation: {
                    voice_room: "Голосовой чат",
                    join_button: "Войти",
                    connect_and_talk_instantly: "Присоединяйтесь и общайтесь",
                    microphone_off: "Микрофон выкл",
                    microphone_is_off: "Микрофон выключен",
                    microphone_on: "Микрофон вкл",
                    microphone_label: "Микрофон",
                    connected_status: "Подключено",
                    disconnected_status: "Отключено",
                    reconnect_status: "Передодключение",
                    connecting_status: "Соединение",
                    you_call_caption: "Вы",
                    muted_status: "Микрофон выкл",
                    speaking_status: "Говорит",
                    listening_status: "Слушает",
                    participant_default_name: "Участник",
                    unmute_button: "Включить микрофон",
                    microphone_button: "Сменить микрофон",
                    leave_room_button: "Выйти из звонка",
                    close_button: "Закрыть",
                    mute_button: "Выключить микрофон",
                    fatal_connection_error: "Во время соединения произошла ошибка",
                    unknown_reason: "Неизвестно",
                    connection_error: "Во время соединения произошла ошибка, перезагрузите чат еще раз",
                    exit_button: "Выйти",
                    reconnecting: "Переподключение",
                    reconnected: "Передподключено",
                    participant_connected: "присоединился",
                    participant_disconnected: "покинул звонок",
                    audio_devices_changed: "Микрофон был изменен",
                    media_devices_error: "Ошибка подключения микрофона",
                    microphone_muted: "Микрофон выключен",
                    microphone_unmuted: "Микрофон включен"
                },
            },
            ua: {
                translation: {
                    voice_room: "Голосовий чат",
                    join_button: "Вийти",
                },
            },
        },
    });

export default i18n;
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
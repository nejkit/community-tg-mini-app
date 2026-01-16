import WebApp from "@twa-dev/sdk";

export default function initTelegram() {
    const tg = WebApp;

    tg.ready();
    tg.expand();

    document.documentElement.style.setProperty(
        "--tg-theme-bg-color",
        tg.themeParams.bg_color ?? "#fff"
    );
}
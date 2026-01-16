import WebApp from "@twa-dev/sdk";

export default function initTelegram() {
    console.log(WebApp)

    WebApp.ready();
    WebApp.expand();

    document.documentElement.style.setProperty(
        "--tg-theme-bg-color",
        WebApp.themeParams.bg_color ?? "#fff"
    );
}
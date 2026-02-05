import WebApp from "@twa-dev/sdk";

function bindTelegramViewport() {
    const tg = (WebApp as any)?.default ?? WebApp;
    if (!tg) return;

    const set = () => {
        document.documentElement.style.setProperty(
            "--tg-vh",
            `${tg.viewportHeight}px`
        );
        document.documentElement.style.setProperty(
            "--tg-vw",
            `${tg.viewportWidth}px`
        );
    };

    set();
    tg.onEvent("viewportChanged", set);
}

bindTelegramViewport();
import './App.css'
import CallPage from "./pages/Call.tsx";
import WebApp from "@twa-dev/sdk";

const tg = (WebApp as any).default ?? WebApp;

function App() {
  const theme = tg.themeParams;

  const map = {
    "--tg-bg": theme.bg_color,
    "--tg-secondary-bg": theme.secondary_bg_color,
    "--tg-text": theme.text_color,
    "--tg-hint": theme.hint_color,
    "--tg-link": theme.link_color,
    "--tg-button": theme.button_color,
    "--tg-button-text": theme.button_text_color,
    "--tg-header-bg": theme.header_bg_color,
    "--tg-accent-text": theme.accent_text_color,
    "--tg-section-bg": theme.section_bg_color,
    "--tg-section-header-text": theme.section_header_text_color,
    "--tg-section-separator": theme.section_separator_color,
    "--tg-subtitle-text": theme.subtitle_text_color,
    "--tg-destructive-text": theme.destructive_text_color,
    "--tg-bottom-bar-bg": theme.bottom_bar_bg_color,
  };

  Object.entries(map).forEach(([key, value]) => {
    if (value) {
      document.documentElement.style.setProperty(key, value);
    }
  });

  document.documentElement.style.setProperty(
      "--tg-vh",
      `${tg.viewportStableHeight}px`
  );
  document.documentElement.style.setProperty(
      "--tg-vw",
      `${tg.viewportWidth}px`
  );

  return (
   <CallPage/>
  )
}


export default App
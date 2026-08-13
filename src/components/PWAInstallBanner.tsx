import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone =
      (typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      // @ts-expect-error - navigator.standalone is iOS Safari specific
      (typeof window !== "undefined" && window.navigator && window.navigator.standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(!showIOSGuide);
    }
  };

  // If already installed or neither prompt nor iOS guide available
  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="pwa-banner">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon">📱</div>
        <div className="pwa-banner-text">
          <div className="pwa-banner-title">Cài đặt ứng dụng vào điện thoại</div>
          <div className="pwa-banner-desc">Chơi mượt mà không cần mở trình duyệt, hỗ trợ ngoại tuyến!</div>
        </div>
      </div>
      <button
        type="button"
        className="btn-pwa-install"
        onClick={handleInstallClick}
        aria-label="Cài đặt ứng dụng"
      >
        {deferredPrompt ? "Cài Đặt Ngay" : "Hướng Dẫn Cài"}
      </button>

      {showIOSGuide && (
        <div className="pwa-ios-guide fade-in">
          <p>
            👉 Trên iPhone / iPad: Nhấn biểu tượng <strong>Chia sẻ (Share) 📤</strong> ở thanh dưới trình duyệt Safari, sau đó chọn <strong>"Thêm vào MH chính" (Add to Home Screen) ➕</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

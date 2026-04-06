# OhMyScroll (Safari Web Extension MVP)

`OhMyScroll` brings Firefox-like auto-scroll behavior to Safari pages within Safari's extension limits.

## What this MVP does

- Middle-click on page content to enable auto-scroll mode.
- Mouse movement scrolls vertically and horizontally with a smooth speed curve.
- Uses the white hand cursor by default; users can switch to yellow in extension settings.
- Auto-scroll exits on:
  - Any non-middle mouse click (first click only exits; second click performs page action)
  - `Escape`
  - Tab/window losing focus
- Safari toolbar button toggles extension state (`ON`/`OFF`) and persists it.

## Why this implementation is safer

- Uses a requestAnimationFrame loop instead of direct `mousemove` scrolling.
- Has a dead zone to prevent accidental tiny movements from scrolling.
- Clamps speed to avoid sudden jumps.
- Tries nearest scrollable container first, then falls back to document scrolling.
- Ignores editable elements and link middle-clicks by default to reduce conflicts.

## Files

- `manifest.json`: Extension manifest and script injection.
- `content.js`: Core auto-scroll state machine.
- `content.css`: Active cursor visuals.
- `background.js`: Toolbar toggle and state synchronization.

## Installation / Kurulum

Since this extension is not currently distributed via the Mac App Store, you will need to build it locally using Xcode and enable unsigned extensions in Safari.
*Bu eklenti şu anda Mac App Store üzerinden dağıtılmadığından, Xcode kullanarak derlemeniz ve Safari'de imzasız eklentilere izin vermeniz gerekmektedir.*

### English (Step-by-Step)

1. **Enable Safari Develop Menu:** Open Safari -> Settings (or Preferences) -> Advanced. Check "Show features for web developers" (or "Show Develop menu in menu bar").
2. **Allow Unsigned Extensions:** In the top menu bar, click the "Develop" menu and select "Allow Unsigned Extensions". *(Note: You must do this every time you restart Safari).* 
3. **Clone the Repository:** Open Terminal and run:
   ```bash
   git clone https://github.com/Ferohers/mini-scroll.git
   cd mini-scroll
   ```
4. **Open in Xcode:** Open the `OhMyScroll/OhMyScroll.xcodeproj` file using Xcode.
5. **Build and Run:** Click the "Run" (Play) button in the top left corner of Xcode. The OhMyScroll macOS app window will appear. You can close it afterwards.
6. **Enable the Extension:** Return to Safari -> Settings -> Extensions. Check the box next to `OhMyScroll`.
7. **Grant Permissions:** Select the extension and click "Always Allow on Every Website" so the auto-scroll can work properly on any page.

### Türkçe (Adım Adım)

1. **Safari Geliştirici Menüsünü Açın:** Safari -> Ayarlar (Settings) -> İleri Düzey (Advanced) menüsüne gidin. "Web geliştiricileri için özellikleri göster" (Show features for web developers) seçeneğini işaretleyin.
2. **İmzasız Eklentilere İzin Verin:** Üst menüden "Geliştirici" (Develop) sekmesine tıklayın ve "İmzasız Eklentilere İzin Ver" (Allow Unsigned Extensions) seçeneğini işaretleyin. *(Not: Safari'yi baştan başlattığınızda bu ayarı tekrar açmanız gerekecektir).*
3. **Depoyu Klonlayın:** Terminal'i açın ve şu komutları çalıştırın:
   ```bash
   git clone https://github.com/Ferohers/mini-scroll.git
   cd mini-scroll
   ```
4. **Xcode'da Açın:** `OhMyScroll/OhMyScroll.xcodeproj` dosyasını çift tıklayarak Xcode ile açın.
5. **Derleyin ve Çalıştırın:** Xcode'un sol üst köşesindeki "Run" (Oynat) düğmesine tıklayın. OhMyScroll macOS uygulamasının penceresi açılacaktır (işlem bitince uygulamayı kapatabilirsiniz).
6. **Eklentiyi Etkinleştirin:** Tekrar Safari -> Ayarlar -> Eklentiler (Extensions) sekmesine gidin. `OhMyScroll` eklentisinin yanındaki kutucuğu işaretleyin.
7. **İzinleri Verin:** Eklentiyi seçin ve otomatik kaydırmanın her sayfada sorunsuz çalışabilmesi için "Her Web Sitesinde Her Zaman İzin Ver" (Always Allow on Every Website) seçeneğine tıklayın.

## Notes on Safari limits

- Safari can still reserve middle-click behavior in some contexts.
- This extension cannot create an OS-level overlay; all visuals are page-injected.
- Browser-special pages, some PDFs, and restricted iframes may not be scriptable.

## Tuning

You can tune behavior in `content.js`:

- `deadZonePx`
- `baseSpeed`
- `curveExponent`
- `maxSpeedPerFrame`
- `ignoreMiddleClickOnLinks`

User-facing cursor style is configurable in extension settings (white or yellow hand).

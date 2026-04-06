# OhMyScroll (Safari Web Extension MVP)

`OhMyScroll` brings Firefox-like auto-scroll behavior to Safari pages within Safari's extension limits.

## Installation / Kurulum

Currently, you need to allow "unsigned extensions" in Safari to use this app. Don't worry, it's easy!
*Şu an için bu eklentiyi kullanmak amacıyla Safari'de "imzasız eklentilere" izin vermeniz gerekiyor. Endişelenmeyin, çok kolay!*

### English (Step-by-Step)

1. **Download the app:** Go to the [Releases](https://github.com/Ferohers/mini-scroll/releases) page and download `OhMyScroll.app.zip`. 
2. **Move it to Applications:** Unzip the downloaded file and move `OhMyScroll.app` into your Mac's **Applications** folder.
3. **Open the app:** Right-click the app, choose **Open**, and click **Open** again to bypass the security warning. You only need to do this once. You can close the app window that pops up.
4. **Enable Safari Develop Menu:** Open Safari. Go to **Settings** -> **Advanced**. Check the box for "Show features for web developers" at the very bottom.
5. **Allow Unsigned Extensions:** Look at the top menu bar, click **Develop**, and click **Allow Unsigned Extensions**. *(Note: You have to do this every time you completely restart Safari).* 
6. **Turn on the extension:** Go to Safari **Settings** -> **Extensions**. Check the box next to `OhMyScroll`.
7. **Give permission:** Click on `OhMyScroll` in the list, and select **"Always Allow on Every Website"** so it can actually scroll your pages.

### Türkçe (Adım Adım)

1. **Uygulamayı indirin:** [Releases](https://github.com/Ferohers/mini-scroll/releases) sayfasına gidin ve `OhMyScroll.app.zip` dosyasını indirin.
2. **Uygulamalar klasörüne taşıyın:** Dosyayı zipten çıkarın ve içinden çıkan `OhMyScroll.app` dosyasını **Uygulamalar** (Applications) klasörüne taşıyın.
3. **Uygulamayı açın:** Uygulamaya sağ tıklayın, **Aç**'a basın ve gelen güvenlik uyarısında tekrar **Aç** diyerek onaylayın. Bunu sadece ilk seferde yapmanız yeterli. Açılan uygulama penceresini sonrasında kapatabilirsiniz.
4. **Safari Geliştirici Menüsünü açın:** Safari'yi açın. **Ayarlar** (Settings) -> **İleri Düzey** (Advanced) sekmesine gidin. En alttaki "Web geliştiricileri için özellikleri göster" kutucuğunu işaretleyin.
5. **İmzasız eklentilere izin verin:** En üstte yer alan menü çubuğundan **Geliştirici** (Develop) sekmesine tıklayın ve **İmzasız Eklentilere İzin Ver** (Allow Unsigned Extensions) seçeneğini işaretleyin. *(Not: Safari'yi her tamamen kapattığınızda bu ayarı tekrar açmanız gerekir).*
6. **Eklentiyi açın:** Safari **Ayarlar** -> **Eklentiler** (Extensions) menüsüne gidin. `OhMyScroll` yanındaki kutucuğu işaretleyin.
7. **İzin verin:** Listeden `OhMyScroll` eklentisini seçin ve sayfalarda çalışabilmesi için **"Her Web Sitesinde Her Zaman İzin Ver"** (Always Allow on Every Website) seçeneğine tıklayın.

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

## Building from source (for developers)

If you prefer to build the extension yourself:
1. Clone this repository.
2. Open `OhMyScroll/OhMyScroll.xcodeproj` in Xcode.
3. Select the `OhMyScroll` scheme and hit Run.

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

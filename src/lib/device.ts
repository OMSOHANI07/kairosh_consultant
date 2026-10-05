// Lightweight user-agent parsing: good enough for analytics buckets.

export function deviceInfo() {
  const ua = navigator.userAgent
  const width = window.screen?.width ?? window.innerWidth

  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|iPod|Android.*Mobile|Opera Mini|IEMobile/i.test(ua)
      ? 'mobile'
      : width && width < 768
        ? 'mobile'
        : 'desktop'

  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /SamsungBrowser/.test(ua)
        ? 'Samsung Internet'
        : /Firefox|FxiOS/.test(ua)
          ? 'Firefox'
          : /Chrome|CriOS/.test(ua)
            ? 'Chrome'
            : /Safari/.test(ua)
              ? 'Safari'
              : 'Other'

  const os = /Windows/.test(ua)
    ? 'Windows'
    : /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Android/.test(ua)
          ? 'Android'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Other'

  return {
    device,
    browser,
    os,
    screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
    language: navigator.language,
  }
}

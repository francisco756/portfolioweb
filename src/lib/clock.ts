const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string) {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    formatters.set(timeZone, f)
  }
  return f
}

/** Keeps every `[data-clock="<IANA zone>"]` element showing live local time. */
export function startClocks(root: ParentNode = document) {
  const tick = () => {
    const now = new Date()
    root.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
      el.textContent = formatter(el.dataset.clock!).format(now)
    })
  }
  tick()
  setInterval(tick, 1000)
}

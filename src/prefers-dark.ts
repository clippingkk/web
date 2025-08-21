export function checkDarkMode() {
  if (typeof window === 'undefined') {
    return
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

function watchDarkMode() {
  if (typeof window === 'undefined') {
    return
  }
  if (!window.matchMedia) return

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', addDarkModeSelector)
}

function addDarkModeSelector(e: MediaQueryListEvent) {
  if (e.matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

watchDarkMode()

// only can init by once
if (checkDarkMode()) {
  document.documentElement.classList.add('dark')
}

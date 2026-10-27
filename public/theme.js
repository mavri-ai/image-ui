try {
  const theme = localStorage.getItem('image-ui-theme-v2')
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark'
} catch {}

export const THEME_STORAGE_KEY = 'kakeibo-theme'

/** Runs before hydration (inlined in <head>) so the saved theme never flashes. */
export const themeInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${THEME_STORAGE_KEY}')||'{}');var m=s.mode||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.dataset.accent=s.accent||'mint';}catch(e){}})();`

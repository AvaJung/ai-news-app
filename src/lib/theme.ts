// 사용자가 고른 테마를 localStorage에 저장하는 키. 값은 "dark" 또는 "light"다.
export const THEME_STORAGE_KEY = "theme";

// 첫 페인트 전에 <html>에 .dark 클래스를 붙여 화면이 깜빡이지 않게 하는 인라인 스크립트.
// 저장된 선택이 없으면 시스템 설정(prefers-color-scheme)을 따른다.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

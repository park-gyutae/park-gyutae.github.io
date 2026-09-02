---
title: "CSS Custom Properties로 디자인 시스템 구축하기"
description: "웹 개발 시 CSS 변수(Custom Properties)를 활용하여 유지보수하기 쉬운 다크모드 및 디자인 시스템을 구축하는 기법을 소개합니다."
pubDate: "2026-07-02"
tags: ["css", "design-system", "web"]
---

현대 웹 애플리케이션에서 일관된 사용자 경험(UX)과 브랜드 디자인은 매우 중요합니다. 이를 위해 디자이너와 개발자는 **디자인 시스템(Design System)**을 만들고 협업하게 됩니다.

과거에는 Sass나 Less 같은 CSS 프리프로세서의 변수 기능이 많이 사용되었지만, 최근에는 표준 CSS의 **Custom Properties (일명 CSS 변수)**만으로도 유연하고 동적인 디자인 시스템 및 다크모드를 손쉽게 구현할 수 있게 되었습니다.

## CSS Custom Properties의 핵심 장점

Sass 변수와 표준 CSS 변수의 가장 큰 차이는 **런타임 동작 여부**입니다.

1. **런타임 접근**: 자바스크립트를 이용해 실시간으로 CSS 변수를 읽고 수정할 수 있습니다.
2. **동적 상속**: CSS cascading 및 상속 규칙을 그대로 따르기 때문에, 특정 요소 하위에서 변수 값을 재정의하면 해당 하위 요소들에만 영향이 미칩니다.
3. **간편한 다크모드 구현**: 클래스나 data attribute에 따라 루트 변수 셋만 변경하면 전체 테마가 전환됩니다.

---

## 다크모드 구현 예제

아래는 CSS 변수와 `[data-theme]` 속성을 사용하여 브라우저 전체 테마를 동적으로 변경하는 예시 코드입니다.

```css
/* 기본 테마 (Light Mode) */
:root {
  --bg-color: #fafafa;
  --text-color: #1a1a1a;
  --primary-color: #4f46e5;
  --transition-speed: 0.3s;
}

/* 다크 테마 */
[data-theme="dark"] {
  --bg-color: #0f172a;
  --text-color: #f1f5f9;
  --primary-color: #818cf8;
}

/* 스타일 적용 */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color var(--transition-speed), color var(--transition-speed);
}

.title {
  color: var(--primary-color);
}
```

이렇게 하면 HTML의 최상단 요소인 `<html>`에 `data-theme="dark"` 속성을 추가/제거하는 것만으로 전체 웹사이트의 테마가 부드럽게 변경됩니다.

```javascript
// JS를 통한 테마 토글 예시
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
};
```

---

## 디자인 시스템 설계 시 팁

- **의미 중심의 변수명 (Semantic Naming)**: 단순히 `--red`나 `--blue`처럼 색상명을 사용하기보다, `--color-danger`, `--color-primary` 등 요소의 역할이나 맥락을 담은 이름을 사용하세요.
- **기본값 설정**: 변수 참조 시 `--primary-color, #4f46e5` 처럼 대비책(Fallback) 값을 설정해 두면 예상치 못한 렌더링 오류를 줄일 수 있습니다.
- **그라디언트와 섀도우**: 복잡한 투명도나 그림자 연산도 CSS 변수와 `rgba()` 등을 조합해 다양하게 응용 가능합니다.

CSS Custom Properties는 최신 모든 브라우저에서 안정적으로 지원하므로 적극적으로 실무에 활용하여 정교한 UI를 가꿔보세요!

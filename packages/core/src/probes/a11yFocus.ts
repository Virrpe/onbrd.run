function isFocusable(el: Element) {
  const selector = 'a,button,input,select,textarea,[tabindex]';
  if (!(el as HTMLElement).matches?.(selector)) return false;
  const he = el as HTMLElement;
  return !he.hasAttribute('disabled') && he.tabIndex !== -1 && getComputedStyle(he).visibility !== 'hidden';
}
export function probeA11yFocus(root: Document = document): boolean {
  const focusables = Array.from(root.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]')).filter(isFocusable);
  if (focusables.length === 0) return false;
  // visible focus: any rule that removes outline entirely is a fail
  const offenders = focusables.filter(el => {
    const st = getComputedStyle(el);
    return st.outlineStyle === 'none' && st.outlineWidth === '0px';
  });
  return offenders.length === 0;
}
export function probeMobileResponsive(root: Document = document): boolean {
  const vp = root.querySelector('meta[name="viewport"]');
  const hasViewport = !!vp && (vp as HTMLMetaElement).content.includes('width=device-width');
  const styles = Array.from(root.querySelectorAll('style,link[rel="stylesheet"]'));
  const cssText = styles.map(n => (n as any).sheet?.ownerNode?.textContent || '').join('\n');
  const hasMedia = /@media\s*\(max-width:\s*(480|400)px\)/i.test(cssText);
  return hasViewport && hasMedia;
}
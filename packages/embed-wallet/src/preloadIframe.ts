export function preloadIframe(url: string): void {
  try {
    if (typeof document === 'undefined') return;

    const iframe = document.createElement('link');

    iframe.href = url;
    // iframe.crossOrigin = 'anonymous';
    iframe.type = 'text/html';
    iframe.rel = 'prefetch';

    if (iframe.relList && iframe.relList.supports) {
      if (iframe.relList.supports('prefetch')) {
        document.head.appendChild(iframe);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

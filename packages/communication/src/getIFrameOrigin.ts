export const getIFrameOrigin = () => {
  const originHref =
    window.location.ancestorOrigins?.length > 0 ? window.location.ancestorOrigins[0] : document.referrer;

  if (!originHref) {
    throw new Error('Cannot detect IFRAME origin! Probably not in IFRAME context');
  }

  return new URL(originHref).origin;
};

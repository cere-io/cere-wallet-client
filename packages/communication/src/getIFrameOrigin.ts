export const getIFrameOrigin = () => {
  const originHref =
    window.location.ancestorOrigins?.length > 0 ? window.location.ancestorOrigins[0] : document.referrer;

  if (!originHref) {
    return originHref;
  }

  return new URL(originHref).origin;
};

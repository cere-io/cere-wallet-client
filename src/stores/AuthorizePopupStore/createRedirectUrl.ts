export const createRedirectUrl = (url: string, sessionId: string) => {
  const finalUrl = new URL(url);
  const hashParams = new URLSearchParams(finalUrl.hash.slice(1));

  hashParams.append('sessionId', sessionId);
  finalUrl.hash = hashParams.toString();

  return finalUrl.toString();
};

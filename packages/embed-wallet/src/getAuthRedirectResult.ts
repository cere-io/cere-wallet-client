export const getAuthRedirectResult = () => {
  const currentUrl = new URL(window.location.href);
  const queryParams = new URLSearchParams(window.location.hash.slice(1));
  const sessionId = queryParams.get('sessionId') || undefined;

  if (sessionId) {
    queryParams.delete('sessionId');
    currentUrl.hash = queryParams.toString();

    /**
     * Clean auth specific parameters from the current URL
     */
    window.history.replaceState(null, document.title, currentUrl.toString());
  }

  return { sessionId };
};

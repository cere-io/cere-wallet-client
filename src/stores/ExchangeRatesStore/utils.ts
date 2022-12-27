export const idleTimeTracker = ((activityThresholdTime) => {
  let isIdle = false;
  let idleTimeout: NodeJS.Timeout | null = null;
  window.addEventListener('load', resetTimer);
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keydown', resetTimer);
  function resetTimer() {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    isIdle = false;
    idleTimeout = setTimeout(() => {
      isIdle = true;
    }, activityThresholdTime * 1000);
  }

  function checkIfIdle() {
    return isIdle;
  }
  return {
    checkIfIdle,
  };
})(600);

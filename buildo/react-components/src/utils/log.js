export function warn(content) {
  if (process.env.NODE_ENV !== 'production') {
    const message = (typeof content === 'function') ? content() : content;
    if (message) {
      console.warn(...[].concat(message)); // eslint-disable-line no-console
    }
  }
}

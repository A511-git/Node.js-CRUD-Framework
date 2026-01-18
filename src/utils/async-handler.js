const AsyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      throw err;
    }
  };
};

export { AsyncHandler };

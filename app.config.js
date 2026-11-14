module.exports = ({ config }) => {
  const baseUrl = process.env.IL_SAVASLARI_WEB_BASE;
  if (!baseUrl) return config;

  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
  };
};

const requiredSettings = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_CALLBACK_URL'];

const getMissingOAuthSettings = (env = process.env) =>
  requiredSettings.filter((name) => !env[name]?.trim());

module.exports = { getMissingOAuthSettings };

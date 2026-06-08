const { execSync } = require('child_process');

// Hash do commit pra tela "Sobre" (item de publicação da rubric). Em CI/EAS
// vem por env; localmente lê do git. Cai em 'dev' se nada estiver disponível.
function commitHash() {
  const fromEnv =
    process.env.EAS_BUILD_GIT_COMMIT_HASH || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

// Estende o app.json: injeta a Google Maps API key (Android) a partir do .env
// (chave fora do repo) e o hash do commit em extra. O `config` recebido já
// contém todo o conteúdo do app.json.
export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  extra: {
    ...config.extra,
    commitHash: commitHash(),
  },
});

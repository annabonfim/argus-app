// Estende o app.json injetando a Google Maps API key (Android) a partir do
// .env — assim a chave fica FORA do repositório público. O `config` recebido
// já contém todo o conteúdo do app.json.
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
});

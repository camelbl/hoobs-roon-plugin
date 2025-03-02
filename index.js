const RoonApi = require("node-roon-api");
const RoonApiTransport = require("node-roon-api-transport");

class HoobsRoonPlugin {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.transport = null;

    this.roon = new RoonApi({
      extension_id: "com.camelbl.hoobs-roon-plugin",
      display_name: "HOOBS roon Plugin",
      display_version: "0.0.1",
      publisher: "camelbl",
      email: "dein.email@example.com",
      website: "https://example.com",
      core_paired: function (core) {
        console.log("Verbunden mit roon Core:", core.display_name);
        this.transport = core.services.RoonApiTransport;
      },
      core_unpaired: function (core) {
        console.log("Verbindung zum roon Core verloren:", core.display_name);
        this.transport = null;
      },
    });

    this.roon.init_services({
      required_services: [RoonApiTransport],
      provided_services: [],
    });

    this.roon.start_discovery();
  }
}

module.exports = (api) => {
  api.registerPlatform("roon", HoobsRoonPlugin);
};
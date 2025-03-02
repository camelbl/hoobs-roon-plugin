    const RoonApi = require("node-roon-api");
const RoonApiTransport = require("node-roon-api-transport");

const roon = new RoonApi({
  extension_id: 'com.example.hoobs-roon-plugin',
  display_name: 'HOOBS roon Plugin',
  display_version: '1.0.0',
  publisher: 'Dein Name',
  email: 'dein.email@example.com',
  website: 'https://example.com',
  core_paired: (core) => {
    console.log('Verbunden mit roon Core:', core.display_name);
    this.transport = core.services.RoonApiTransport;
  },
  core_unpaired: (core) => {
    console.log('Verbindung zum roon Core verloren:', core.display_name);
    this.transport = null;
  }
});

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: []
});

roon.start_discovery();
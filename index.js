const RoonApi = require("node-roon-api");
const RoonApiStatus = require("node-roon-api-status");
const RoonApiTransport = require("node-roon-api-transport");
const RoonApiBrowse = require("node-roon-api-browse");
const RoonApiSettings = require("node-roon-api-settings");

module.exports = (api) => {
  api.registerAccessory("Roon", RoonAccessory);
};

class RoonAccessory {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    // Initialize Roon API
    this.roon = new RoonApi({
      extension_id: "com.hoobs.roon",
      display_name: this.config.displayName || "Roon",
      display_version: "1.0.0",
      publisher: "HOOBS",
      email: "support@hoobs.org",
      website: "https://hoobs.org"
    });

    // Initialize Roon services
    this.status = new RoonApiStatus(this.roon);
    this.transport = new RoonApiTransport(this.roon);
    this.browse = new RoonApiBrowse(this.roon);
    this.settings = new RoonApiSettings(this.roon);

    // Initialize HomeKit services
    this.service = new this.Service.Switch(this.config.name);
    this.service.getCharacteristic(this.Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));

    // Start Roon discovery
    this.roon.init_services({
      required_services: [this.status, this.transport, this.browse, this.settings]
    });

    this.roon.start_discovery();
  }

  getServices() {
    return [this.service];
  }

  getPowerState(callback) {
    this.transport.get_state((err, state) => {
      if (err) {
        this.log.error("Error getting power state:", err);
        callback(err);
        return;
      }
      callback(null, state === "playing");
    });
  }

  setPowerState(value, callback) {
    if (value) {
      this.transport.play((err) => {
        if (err) {
          this.log.error("Error playing:", err);
          callback(err);
          return;
        }
        callback(null);
      });
    } else {
      this.transport.pause((err) => {
        if (err) {
          this.log.error("Error pausing:", err);
          callback(err);
          return;
        }
        callback(null);
      });
    }
  }
} 
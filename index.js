const RoonApi = require("node-roon-api");
const RoonApiTransport = require("node-roon-api-transport");

module.exports = (api) => {
  api.registerAccessory("RoonControl", RoonControl);
};

class RoonControl {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    // Initialize Roon API
    this.roon = new RoonApi({
      extension_id: "com.mrtfox.rooncontrol",
      display_name: "Roon Control",
      display_version: "1.0.0",
      publisher: "mrtfox"
    });

    // Initialize Roon services
    this.transport = new RoonApiTransport(this.roon);

    // Initialize HomeKit service
    this.service = new this.Service.Switch(this.config.name);
    this.service.getCharacteristic(this.Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));

    // Start Roon discovery
    this.roon.init_services({
      required_services: [this.transport]
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
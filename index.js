const RoonApi = require("node-roon-api");
const RoonApiStatus = require("node-roon-api-status");
const RoonApiTransport = require("node-roon-api-transport");
const RoonApiBrowse = require("node-roon-api-browse");
const RoonApiSettings = require("node-roon-api-settings");

module.exports = (api) => {
  api.registerPlatform("RoonControl", RoonControlPlatform);
};

class RoonControlPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];
    this.core = null;

    this.api.on("didFinishLaunching", () => {
      this.discoverRoon();
    });
  }

  discoverRoon() {
    const roon = new RoonApi({
      extension_id: "com.mrtfox.rooncontrol",
      display_name: "Roon Control",
      display_version: "1.0.0",
      publisher: "mrtfox",
      email: "support@mrtfox.com",
      website: "https://github.com/mrtfox/hoobs-roon-plugin",
    });

    roon.init_services({
      required_services: [RoonApiStatus, RoonApiTransport],
      optional_services: [RoonApiBrowse, RoonApiSettings],
    });

    roon.on("core_found", (core) => {
      this.log("Found Roon Core");
      this.core = core;
      this.setupRoonServices();
    });

    roon.on("core_lost", () => {
      this.log("Lost connection to Roon Core");
      this.core = null;
    });
  }

  setupRoonServices() {
    if (!this.core) return;

    this.core.services.RoonApiTransport.subscribe_zones((cmd, data) => {
      if (cmd === "Changed" || cmd === "Added") {
        this.updateAccessories(data);
      }
    });
  }

  updateAccessories(zones) {
    if (!zones) return;

    zones.forEach((zone) => {
      zone.outputs.forEach((output) => {
        const uuid = this.api.hap.uuid.generate(output.output_id);
        let accessory = this.accessories.find((acc) => acc.UUID === uuid);

        if (!accessory) {
          accessory = new this.api.platformAccessory(
            output.display_name,
            uuid
          );
          this.accessories.push(accessory);
          this.api.registerPlatformAccessories("RoonControl", "RoonControl", [accessory]);
        }

        this.configureAccessory(accessory, output, zone);
      });
    });
  }

  configureAccessory(accessory, output, zone) {
    accessory.context.output = output;
    accessory.context.zone = zone;

    const service = accessory.getService(this.api.hap.Service.SmartSpeaker) ||
      accessory.addService(this.api.hap.Service.SmartSpeaker);

    service
      .getCharacteristic(this.api.hap.Characteristic.CurrentMediaState)
      .onGet(() => this.getCurrentMediaState(zone));

    service
      .getCharacteristic(this.api.hap.Characteristic.TargetMediaState)
      .onGet(() => this.getTargetMediaState(zone))
      .onSet((value) => this.setTargetMediaState(zone, value));

    service.setCharacteristic(
      this.api.hap.Characteristic.ConfiguredName,
      output.display_name
    );

    accessory
      .getService(this.api.hap.Service.AccessoryInformation)
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Roon")
      .setCharacteristic(this.api.hap.Characteristic.Model, "Output")
      .setCharacteristic(
        this.api.hap.Characteristic.SerialNumber,
        output.output_id
      );
  }

  getCurrentMediaState(zone) {
    if (!zone) return this.api.hap.Characteristic.CurrentMediaState.STOP;

    switch (zone.state) {
      case "playing":
        return this.api.hap.Characteristic.CurrentMediaState.PLAY;
      case "paused":
      case "loading":
        return this.api.hap.Characteristic.CurrentMediaState.PAUSE;
      case "stopped":
        return this.api.hap.Characteristic.CurrentMediaState.STOP;
      default:
        return this.api.hap.Characteristic.CurrentMediaState.STOP;
    }
  }

  getTargetMediaState(zone) {
    return this.getCurrentMediaState(zone);
  }

  setTargetMediaState(zone, value) {
    if (!this.core || !zone) return;

    let method;
    switch (value) {
      case this.api.hap.Characteristic.TargetMediaState.PLAY:
        method = "play";
        break;
      case this.api.hap.Characteristic.TargetMediaState.PAUSE:
        method = "pause";
        break;
      case this.api.hap.Characteristic.TargetMediaState.STOP:
        method = "stop";
        break;
      default:
        return;
    }

    this.core.services.RoonApiTransport.control(zone.zone_id, method, (error) => {
      if (error) {
        this.log(`Error controlling zone: ${error}`);
      }
    });
  }
} 
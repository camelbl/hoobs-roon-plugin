# Homebridge Roon Control

A simple Homebridge/HOOBS plugin for controlling Roon playback.

## Installation

1. Install the plugin:
```bash
npm install -g homebridge-roon-control
```

2. Add the platform to your Homebridge/HOOBS configuration:
```json
{
  "platform": "RoonControl",
  "name": "Roon Control"
}
```

3. Restart Homebridge/HOOBS

## Configuration

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| name | Name of the Roon control switch | Yes | "Roon Control" |

## Features

- Simple switch to control Roon playback
- Play/Pause functionality
- Automatic Roon Core discovery

## Troubleshooting

If the plugin doesn't work:

1. Check if Roon Core is running and accessible
2. Verify the plugin is properly installed
3. Check Homebridge/HOOBS logs for errors
4. Restart Homebridge/HOOBS service

## Support

For support, please [open an issue](https://github.com/mrtfox/hoobs-roon-plugin/issues) on GitHub.

## License

ISC

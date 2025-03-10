# Discord Winston Transport

[![npm version](https://img.shields.io/npm/v/discord-winston-transport.svg)](https://www.npmjs.com/package/discord-winston-transport)
[![Build Status](https://github.com/Seigneurhol/discord-winston-transport/actions/workflows/ci.yml/badge.svg)](https://github.com/Seigneurhol/discord-winston-transport/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/Seigneurhol/discord-winston-transport/badge.svg)](https://snyk.io/test/github/Seigneurhol/discord-winston-transport)

A robust and enhanced Winston transport for Discord, supporting advanced formatting, printf-style interpolation, error propagation, and updated dependencies.

This library extends the original [`winston-discord-transport`](https://github.com/sidhantpanda/winston-discord-transport) with additional features and improvements.

## Features

- ✅ **Printf-style formatting and splat support**: Use familiar Winston formatting patterns (`%s`, `%d`, `%j`) directly in your Discord logs.
- ✅ **Complete error propagation**: Throw and propagate errors properly, ensuring reliable error handling.
- ✅ **Color-coded messages**: Clearly distinguish log levels with intuitive color coding (errors in red, warnings in yellow, etc.).
- ✅ **Custom metadata support**: Easily add custom metadata fields to your Discord messages.
- ✅ **Updated dependencies**: Regularly maintained with up-to-date and secure dependencies.

## Installation

```bash
npm install discord-winston-transport

# Or using yarn
yarn add discord-winston-transport

# Or using pnpm
pnpm add discord-winston-transport
```

## Usage

### Basic Setup

```typescript
import winston from 'winston';
import DiscordTransport from 'discord-winston-transport';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`),
    winston.format.timestamp()
  ),
  transports: [
    new DiscordTransport({
      webhook: 'https://your.discord.webhook',
      defaultMeta: { service: 'my-node-service' },
      level: 'warn',
    }),
  ],
});

logger.error('Error initializing service: %s', 'database connection failed');
```

### Logging Errors with Stack Traces

Automatically sends complete error stack traces to Discord:

```typescript
logger.error('Unhandled exception occurred', { error: new Error('Critical failure') });
```

### Selectively Skip Discord Logging

To prevent specific logs from flooding your Discord channel, set `discord: false`:

```typescript
logger.warn('This warning will not be sent to Discord', { discord: false });
```

## Screenshots

### Error Message
![Error message screenshot](https://i.ibb.co/nsQR12X/Screenshot-2019-09-18-at-7-04-59-PM.png)

### Warning Message
![Warning message screenshot](https://i.ibb.co/TrFspkw/Screenshot-2019-09-18-at-7-05-30-PM.png)

### Info Message
![Info message screenshot](https://i.ibb.co/7ygj3Y9/Screenshot-2019-09-18-at-7-05-24-PM.png)

### Verbose Message
![Verbose message screenshot](https://i.ibb.co/55p3tMX/Screenshot-2019-09-18-at-7-05-19-PM.png)

### Debug Message
![Debug message screenshot](https://i.ibb.co/8cbfxPP/Screenshot-2019-09-18-at-7-05-13-PM.png)

### Silly Message
![Silly message screenshot](https://i.ibb.co/ZfrGPbF/Screenshot-2019-09-18-at-7-05-08-PM.png)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT © [Seigneurhol](https://github.com/Seigneurhol)
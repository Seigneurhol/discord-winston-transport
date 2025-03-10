/* eslint-disable no-console */
import Transport, { TransportStreamOptions } from 'winston-transport';
import { TransformableInfo } from 'logform';
import axios from 'axios';
import os from 'os';

/**
 * Discord webhook response interface
 */
interface DiscordWebhookResponse {
  id: string;
  token: string;
  [key: string]: unknown;
}

/**
 * Discord embed field interface
 */
interface DiscordEmbedField {
  name: string;
  value: string;
}

/**
 * Discord message format interface
 */
interface DiscordMessage {
  content?: string;
  embeds: {
    description?: string;
    color: number;
    fields: DiscordEmbedField[];
    timestamp: string;
  }[];
}

/**
 * Options for Discord transport for winston
 */
export interface DiscordTransportOptions extends TransportStreamOptions {
  /** Webhook obtained from Discord */
  webhook: string;
  /** Meta data to be included inside Discord Message */
  defaultMeta?: Record<string, string>;
}

/**
 * Discord log info interface
 */
interface DiscordLogInfo extends TransformableInfo {
  error?: Error;
  meta?: Record<string, string>;
  discord?: boolean;
}

/**
 * Discord Transport for winston
 */
export default class DiscordTransport extends Transport {
  /** Webhook obtained from Discord */
  private webhook: string;

  /** Discord webhook id */
  private id?: string;

  /** Discord webhook token */
  private token?: string;

  /** Initialization promise resolved after retrieving discord id and token */
  private initialized: Promise<void>;

  /** Meta data to be included inside Discord Message */
  private defaultMeta: Record<string, string>;

  /** Available colors for discord messages */
  private static COLORS: Record<string, number> = {
    error: 14362664, // #db2828
    warn: 16497928, // #fbbd08
    info: 2196944, // #2185d0
    verbose: 6559689, // #6435c9
    debug: 2196944, // #2185d0
    silly: 2210373, // #21ba45
  };

  constructor(opts: DiscordTransportOptions) {
    super(opts);
    this.webhook = opts.webhook;
    this.defaultMeta = opts.defaultMeta || {};
    this.initialized = this.initialize();
  }

  /** Helper function to retrieve url */
  private getUrl = (): string =>
    `https://discordapp.com/api/webhooks/${this.id}/${this.token}`;

  /**
   * Initialize the transport to fetch Discord id and token
   */
  private initialize = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      axios
        .get<DiscordWebhookResponse>(this.webhook)
        .then((response) => {
          this.id = response.data.id;
          this.token = response.data.token;
          resolve();
        })
        .catch((err: Error) => {
          console.error(
            `Could not connect to Discord Webhook at ${this.webhook}`,
            err
          );
          reject(err);
        });
    });

  /**
   * Function exposed to winston to be called when logging messages
   * @param info Log message from winston
   * @param callback Callback to winston to complete the log
   */
  log(info: DiscordLogInfo, callback: () => void): void {
    if (info.discord !== false) {
      setImmediate(() => {
        this.initialized
          .then(() => {
            this.sendToDiscord(info);
          })
          .catch((err: Error) => {
            console.error('Error sending message to discord', err);
          });
      });
    }

    callback();
  }

  /**
   * Sends log message to discord
   */
  private sendToDiscord = async (info: DiscordLogInfo): Promise<void> => {
    // Use formatted message if available - using string access for Symbol
    // Access the formatted message from Symbol
    const messageSymbol = Object.getOwnPropertySymbols(info).find(
      (sym) => sym.toString() === 'Symbol(message)'
    );

    // Get the formatted message or fall back to regular message
    const message = messageSymbol
      ? (info[messageSymbol] as string)
      : (info.message as string);

    const postBody: DiscordMessage = {
      embeds: [
        {
          description: message,
          color:
            DiscordTransport.COLORS[info.level] || DiscordTransport.COLORS.info,
          fields: [],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (info.level === 'error' && info.error && info.error.stack) {
      postBody.content = `\`\`\`${info.error.stack}\`\`\``;
    }

    if (this.defaultMeta) {
      Object.keys(this.defaultMeta).forEach((key) => {
        postBody.embeds[0].fields.push({
          name: key,
          value: this.defaultMeta[key],
        });
      });
    }

    if (info.meta) {
      Object.keys(info.meta).forEach((key) => {
        if (info.meta && key in info.meta) {
          postBody.embeds[0].fields.push({
            name: key,
            value: info.meta[key],
          });
        }
      });
    }

    postBody.embeds[0].fields.push({
      name: 'Host',
      value: os.hostname(),
    });

    try {
      await axios.post(this.getUrl(), postBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      const error = err as Error;
      console.error(`Error sending to discord`, error);
    }
  };
}

export { DiscordTransport };

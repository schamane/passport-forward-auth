import { Request } from 'express';
import { Strategy } from 'passport';

export interface ForwardAuthStrategyOptions {
  name?: string;
  authHeaders: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DoneCallback = (error: Error, user?: Record<string, unknown>, info?: any) => void;

export interface VerifyHeaders {
  [key: string]: string;
}

export type VerifyFunction = (verifyHeaders: VerifyHeaders, done: DoneCallback) => void;

/**
 * Forward-Auth Passport Strategy for express authentication behind forward-auth.
 * @extends Strategy
 */
export class ForwardAuthStrategy extends Strategy {
  private verify?: VerifyFunction;

  private authHeaders: string[];

  /**
   * The ForwardAuthStrategy constructor.
   *
   * Optionally an `options` object can be passed to custom configure the Strategy.
   * options = {
   *  name: String - The name of the strategy, defaults to 'forward-auth'
   *  passReqToCallback: Boolean - When true `req` is the first argument to the
   *                                  verify callback, defaults to false
   * }
   *  @param {Object} options
   *  @param {Function} verify
   */
  constructor(options?: ForwardAuthStrategyOptions, verify?: VerifyFunction) {
    // Allows verify to be passed as the first parameter and options skipped
    let settings: ForwardAuthStrategyOptions = {
      authHeaders: []
    };

    super();

    if (typeof options === 'function') {
      this.verify = options;
    } else {
      settings = options || settings;
      this.verify = verify;
    }

    this.name = settings.name || 'forward-auth';
    this.authHeaders = settings.authHeaders;
  }

  /**
   * Authenticate request. Always authenticates successfully by default
   * unless instructed otherwise through `verify` callback that was
   * passed to the constructor.
   *
   * @param {Object} req
   */
  public authenticate(req?: Request): void {
    if (!this.verify) {
      return this.fail('No verify function was specified!');
    }

    const verified: DoneCallback = (error, user, info) => {
      if (error) {
        return this.error(error);
      }

      if (!user) {
        return this.fail(info);
      }

      return this.success(user, info);
    };

    const headers = this.authHeaders.map((key) => ({ key, value: req.headers[key] })).reduce((result, { key, value }) => (value ? { ...result, [key]: value } : result), {});

    try {
      return this.verify(headers, verified);
    } catch (e) {
      return this.error(e);
    }
  }
}

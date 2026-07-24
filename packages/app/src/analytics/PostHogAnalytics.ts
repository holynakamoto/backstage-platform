import posthog from 'posthog-js';
import {
  AnalyticsApi,
  AnalyticsEvent,
  ConfigApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

/**
 * A Backstage {@link AnalyticsApi} implementation backed by posthog-js.
 *
 * Backstage emits a `navigate` event on every route change (the SPA
 * equivalent of a page view). Because we let Backstage drive routing, we
 * disable posthog's automatic pageview capture and translate `navigate`
 * events into PostHog `$pageview` events ourselves. All other Backstage
 * analytics events are forwarded verbatim as custom events.
 */
export class PostHogAnalytics implements AnalyticsApi {
  private readonly initialized: boolean;

  private constructor(options: {
    token?: string;
    host: string;
    debug: boolean;
    identityApi?: IdentityApi;
  }) {
    const { token, host, debug, identityApi } = options;

    // Without a project API key there is nothing to send to, so behave as a
    // no-op (this is the case in tests and in dev setups without config).
    if (!token) {
      // eslint-disable-next-line no-console
      console.warn(
        'PostHog analytics is not configured (missing app.analytics.posthog.token); analytics events will be dropped.',
      );
      this.initialized = false;
      return;
    }

    posthog.init(token, {
      api_host: host,
      // Backstage owns routing, so we translate its `navigate` events into
      // `$pageview` events rather than relying on posthog's own SPA tracking.
      capture_pageview: false,
      debug,
    });
    this.initialized = true;

    // Associate captured events with the signed-in user when we can.
    if (identityApi) {
      this.identify(identityApi);
    }
  }

  /**
   * Creates a {@link PostHogAnalytics} instance from the app config, reading
   * `app.analytics.posthog.{token,host,debug}`.
   */
  static fromConfig(
    config: ConfigApi,
    options: { identityApi?: IdentityApi } = {},
  ): PostHogAnalytics {
    return new PostHogAnalytics({
      token: config.getOptionalString('app.analytics.posthog.token'),
      host:
        config.getOptionalString('app.analytics.posthog.host') ??
        'https://us.posthog.com',
      debug: config.getOptionalBoolean('app.analytics.posthog.debug') ?? false,
      identityApi: options.identityApi,
    });
  }

  captureEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      return;
    }

    const { action, subject, value, attributes, context } = event;

    // A `navigate` action is Backstage's page view; forward it as `$pageview`
    // so it powers PostHog's web and product analytics.
    if (action === 'navigate') {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        subject,
        ...context,
        ...attributes,
      });
      return;
    }

    posthog.capture(action, {
      subject,
      value,
      ...context,
      ...attributes,
    });
  }

  private async identify(identityApi: IdentityApi): Promise<void> {
    try {
      const { userEntityRef } = await identityApi.getBackstageIdentity();
      const profile = await identityApi.getProfileInfo();
      posthog.identify(userEntityRef, {
        email: profile.email,
        name: profile.displayName,
      });
    } catch {
      // Identity is best-effort; never let it break analytics or the app.
    }
  }
}

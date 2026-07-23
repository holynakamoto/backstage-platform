import { ConfigReader } from '@backstage/core-app-api';
import posthog from 'posthog-js';
import { PostHogAnalytics } from './PostHogAnalytics';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    capture: jest.fn(),
    identify: jest.fn(),
  },
}));

const mockedPosthog = posthog as jest.Mocked<typeof posthog>;

const event = (action: string, subject: string) => ({
  action,
  subject,
  context: { pluginId: 'catalog', extension: 'App', routeRef: 'unknown' },
});

describe('PostHogAnalytics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializes posthog from config with the configured host', () => {
    PostHogAnalytics.fromConfig(
      new ConfigReader({
        app: { analytics: { posthog: { token: 'phc_test' } } },
      }),
    );

    expect(mockedPosthog.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://us.posthog.com',
        capture_pageview: false,
      }),
    );
  });

  it('maps navigate events to $pageview', () => {
    const api = PostHogAnalytics.fromConfig(
      new ConfigReader({
        app: { analytics: { posthog: { token: 'phc_test' } } },
      }),
    );

    api.captureEvent(event('navigate', '/catalog'));

    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      '$pageview',
      expect.objectContaining({ subject: '/catalog', pluginId: 'catalog' }),
    );
  });

  it('forwards other events as custom events', () => {
    const api = PostHogAnalytics.fromConfig(
      new ConfigReader({
        app: { analytics: { posthog: { token: 'phc_test' } } },
      }),
    );

    api.captureEvent(event('search', 'query'));

    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      'search',
      expect.objectContaining({ subject: 'query' }),
    );
  });

  it('is a no-op when no token is configured', () => {
    const api = PostHogAnalytics.fromConfig(new ConfigReader({}));
    api.captureEvent(event('navigate', '/catalog'));

    expect(mockedPosthog.init).not.toHaveBeenCalled();
    expect(mockedPosthog.capture).not.toHaveBeenCalled();
  });
});

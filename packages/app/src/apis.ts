import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  analyticsApiRef,
  configApiRef,
  createApiFactory,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { PostHogAnalytics } from './analytics/PostHogAnalytics';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: analyticsApiRef,
    deps: { configApi: configApiRef, identityApi: identityApiRef },
    factory: ({ configApi, identityApi }) =>
      PostHogAnalytics.fromConfig(configApi, { identityApi }),
  }),
];

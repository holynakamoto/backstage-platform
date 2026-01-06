# Runbook: {{ values.name }}

## Service Overview

**Service Name**: {{ values.name }}
**Owner**: {{ values.owner }}
**Runtime**: {{ values.runtime }}

## Common Operations

### Restart Service

```bash
kubectl rollout restart deployment/{{ values.name }}
kubectl rollout status deployment/{{ values.name }}
```

### Scale Service

```bash
# Scale to 5 replicas
kubectl scale deployment/{{ values.name }} --replicas=5
```

### View Service Status

```bash
kubectl get deployment {{ values.name }}
kubectl get pods -l app={{ values.name }}
kubectl get service {{ values.name }}
```

### Access Service

```bash
# Port forward for local access
kubectl port-forward service/{{ values.name }} 8080:80

# Access via ingress
curl https://{{ values.name }}.example.com/health
```

## Incident Response

### Service Down

1. Check pod status: `kubectl get pods -l app={{ values.name }}`
2. Check logs: `kubectl logs -l app={{ values.name }} --tail=100`
3. Check events: `kubectl get events --field-selector involvedObject.name={{ values.name }}`
4. Restart if needed: `kubectl rollout restart deployment/{{ values.name }}`

### High Error Rate

1. Check metrics: `kubectl top pods -l app={{ values.name }}`
2. Review logs for errors
3. Check database connectivity (if applicable)
4. Scale up if resource constrained

### Database Issues

{% if values.database %}
1. Check RDS status in AWS console
2. Verify connection string: `kubectl get secret {{ values.name }}-db-credentials`
3. Test connection from pod
4. Check Crossplane claim status
{% else %}
Database is not configured for this service.
{% endif %}

## Maintenance Windows

Schedule maintenance during low-traffic periods. Notify team via Slack/email.

## Escalation

If issues persist:
1. Contact platform team
2. Escalate to {{ values.owner }}
3. Check Backstage catalog for service dependencies


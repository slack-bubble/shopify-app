const namespace = 'slack_bubble';
const key = 'widget_id';

async function request(query, variables = {}) {
  const response = await fetch('shopify:admin/api/2026-07/graphql.json', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query, variables}),
  });
  if (!response.ok) throw new Error('Unable to reach Shopify. Please try again.');
  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(' '));
  }
  if (!result.data) throw new Error('Shopify returned an empty response. Please try again.');
  return result.data;
}

export async function loadWidgetSettings() {
  const data = await request(`query WidgetSettings {
    currentAppInstallation {
      id
      metafield(namespace: "slack_bubble", key: "widget_id") { value }
    }
  }`);
  if (!data.currentAppInstallation?.id) throw new Error('Unable to load this app installation.');
  return {
    installationId: data.currentAppInstallation.id,
    widgetId: data.currentAppInstallation.metafield?.value ?? '',
  };
}

export async function saveWidgetSettings(installationId, widgetId) {
  const value = widgetId.trim();
  if (!value) throw new Error('Enter your widget ID.');
  const data = await request(`mutation SaveWidgetSettings($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { value }
      userErrors { field message }
    }
  }`, {
    metafields: [{ownerId: installationId, namespace, key, type: 'single_line_text_field', value}],
  });
  const result = data.metafieldsSet;
  if (result?.userErrors?.length) {
    throw new Error(result.userErrors.map((error) => error.message).join(' '));
  }
  if (!result?.metafields?.length) throw new Error('The widget ID was not saved. Please try again.');
  return result.metafields[0].value;
}

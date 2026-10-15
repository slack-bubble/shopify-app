import {useEffect, useState} from 'preact/hooks';
import {loadWidgetSettings, saveWidgetSettings} from '../../../../shared/models/widget-settings';

export default function SettingsPage() {
  const [installationId, setInstallationId] = useState('');
  const [widgetId, setWidgetId] = useState('');
  const [savedId, setSavedId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const settings = await loadWidgetSettings();
      setInstallationId(settings.installationId);
      setWidgetId(settings.widgetId);
      setSavedId(settings.widgetId);
      setStatus('idle');
    } catch (error) {
      setError(error.message);
      setStatus('load-error');
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (status === 'saving') return;
    if (!widgetId.trim()) {
      setFieldError('Enter your widget ID.');
      return;
    }
    setStatus('saving');
    setError('');
    try {
      const value = await saveWidgetSettings(installationId, widgetId);
      setWidgetId(value);
      setSavedId(value);
      setStatus('saved');
    } catch (error) {
      setError(error.message);
      setStatus('idle');
    }
  }

  const busy = status === 'loading' || status === 'saving';
  return (
    <s-page heading="Settings" inlineSize="small">
      <s-section heading="Slack Bubble widget">
        <s-stack gap="base">
          {error && <s-banner tone="critical">{error}</s-banner>}
          {status === 'saved' && <s-banner tone="success">Widget ID saved.</s-banner>}
          {status === 'loading' && <s-paragraph>Loading settings…</s-paragraph>}
          {status === 'load-error' ? (
            <s-button onClick={load}>Retry</s-button>
          ) : (
            <>
              <s-text-field
                label="Widget ID"
                name="widget_id"
                value={widgetId}
                details="Paste the widget ID from Slack Bubble, not the full script or URL."
                required
                disabled={busy}
                error={fieldError}
                onInput={(event) => {
                  setWidgetId(event.currentTarget.value);
                  setFieldError('');
                  setError('');
                  setStatus('idle');
                }}
              />
              <s-button
                variant="primary"
                onClick={save}
                loading={status === 'saving'}
                disabled={busy || !installationId || widgetId.trim() === savedId}
              >Save</s-button>
              <s-paragraph>
                Enable Slack Bubble Chat Widget in your theme editor’s App embeds to show it on your storefront.
              </s-paragraph>
            </>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

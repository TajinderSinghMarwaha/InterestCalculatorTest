import { IWorld } from '@cucumber/cucumber';

/**
 * Attach a validation / error message so it appears in Cucumber HTML
 * and the generated playwright-report.
 */
export async function attachValidationMessage(
  world: IWorld,
  label: string,
  message: string | null | undefined
): Promise<void> {
  const text = (message ?? '').trim();
  if (!text) return;
  const payload = `Validation error [${label}]: ${text}`;
  await world.attach(payload, 'text/plain');
}

/**
 * Attach multiple related validation messages as one report entry.
 */
export async function attachValidationMessages(
  world: IWorld,
  messages: Record<string, string | null | undefined>
): Promise<void> {
  const lines = Object.entries(messages)
    .map(([key, value]) => {
      const text = (value ?? '').trim();
      return text ? `- ${key}: ${text}` : null;
    })
    .filter(Boolean);

  if (lines.length === 0) return;
  await world.attach(`Validation errors:\n${lines.join('\n')}`, 'text/plain');
}

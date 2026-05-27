// Server route that SSRs the composition scenario, then hydrates — same
// SSR→hydrate path real consumers hit. Asserted by e2e/scenarios.spec.ts.
import { ScenarioAppShellCombobox } from '../../gallery/scenarios';

export const dynamic = 'force-dynamic';

export default function ScenariosPage() {
  return <ScenarioAppShellCombobox />;
}

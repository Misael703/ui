import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock, JsonViewer } from './Code';

export default { title: 'ERP/Code', tags: ['autodocs'] } as Meta;

export const CodeBlockDemo: StoryObj = {
  render: () => (
    <CodeBlock language="bash" filename="install.sh">
      {`npm install @misael703/elalba-ui
npm run storybook`}
    </CodeBlock>
  ),
};

export const CodeBlockSinHeader: StoryObj = {
  render: () => (
    <CodeBlock>
      {`const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);`}
    </CodeBlock>
  ),
};

export const JsonViewerDemo: StoryObj = {
  render: () => (
    <JsonViewer
      data={{
        order: {
          id: 1042,
          customer: 'Constructora Norte SpA',
          items: [
            { sku: 'ELT-12', name: 'Cemento gris', qty: 10, price: 5490 },
            { sku: 'FRR-08', name: 'Fierro 12mm', qty: 5, price: 3290 },
          ],
          total: 71350,
          paid: true,
          shippingAddress: null,
        },
      }}
    />
  ),
};

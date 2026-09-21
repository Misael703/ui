import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { TagInput, type TagInputProps } from './InputsExtra';

function Controlled(args: TagInputProps) {
  const [tags, setTags] = React.useState(args.value);
  return <TagInput {...args} value={tags} onChange={setTags} />;
}

const meta = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: { value: ['Taladro', 'Sierra'], onChange: fn() },
} satisfies Meta<typeof TagInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };

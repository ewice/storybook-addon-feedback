import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Hello Storybook',
    content:
      'This is a beautiful card designed to show how easy it is to test navigation counts in our feedback survey addon.',
  },
};

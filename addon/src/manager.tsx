// oxlint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { ADDON_ID, TOOL_ID } from './constants';
import { FeedbackAddon } from './containers/FeedbackAddon';

addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    title: 'Feedback Survey',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <FeedbackAddon api={api} />
  });
});

import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { FeedbackAddon } from './containers/FeedbackAddon';

const ADDON_ID = 'storybook-feedback-survey';
const TOOL_ID = `${ADDON_ID}/tool`;

addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    title: 'Feedback Survey',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <FeedbackAddon api={api} />
  });
});

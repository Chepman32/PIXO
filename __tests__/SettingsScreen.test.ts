import { getLocaleSelectOptions } from '../src/pages/settings/SettingsScreen';

describe('SettingsScreen locale options', () => {
  it('uses the detected system locale for the system option description', () => {
    const options = getLocaleSelectOptions('en', 'ru');

    expect(options[0]).toMatchObject({
      id: 'system',
      label: 'System Default',
      description: 'Русский',
    });
  });
});

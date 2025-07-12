export default {
  editor: {
    label: {
      en: "My Section",
    },
  },
  properties: {
    articles: {
      label: { en: 'Articles' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item.title || 'Untitled Article';
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            date: '',
            label: '',
            title: '',
            volume: '',
            difficulty: '',
            buttonText: '',
            articleUrl: ''
          },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              date: { label: { en: 'Date (YYYY-MM-DD)' }, type: 'Text' },
              label: { label: { en: 'Label' }, type: 'Text' },
              title: { label: { en: 'Title' }, type: 'Text' },
              volume: { label: { en: 'Volume' }, type: 'Text' },
              difficulty: { label: { en: 'Difficulty' }, type: 'Text' },
              buttonText: { label: { en: 'Button Text' }, type: 'Text' },
              articleUrl: { label: { en: 'Article URL' }, type: 'Text' }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Bind to an array of article objects with required properties: id, date, title, etc.',
      },
      /* wwEditor:end */
    }
  },
};

export default {
  // site-level options
  lang: 'en-US',
  title: 'S3 Desktop',
  description: 'S3 Browser for desktop.',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    ko: {
      label: '한국어',
      lang: 'ko', // optional, will be added  as `lang` attribute on `html` tag
      //   link: '/ko/', // default /fr/ -- shows on navbar translations menu, can be external

      // other locale specific properties...
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/icymonk/s3-desktop' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is S3 Desktop?', link: '/guide/what-is-s3-desktop' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
    ],
  },
}

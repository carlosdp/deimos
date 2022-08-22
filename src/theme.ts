import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

const markdownComponents = {
  Heading: {
    variants: {
      'md-h1': {
        fontSize: '24px',
        paddingBottom: '14px',
        paddingTop: '16px',
      },
      'md-h2': {
        fontSize: '18px',
        paddingBottom: '12px',
        paddingTop: '14px',
      },
      'md-h3': {
        fontSize: '14px',
        paddingBottom: '10px',
        paddingTop: '12px',
      },
      'md-h4': {
        fontSize: '12px',
        paddingBottom: '10px',
        paddingTop: '12px',
      },
      'md-h5': {
        fontSize: '12px',
        paddingBottom: '10px',
        paddingTop: '12px',
      },
      'md-h6': {
        fontSize: '12px',
        paddingBottom: '10px',
        paddingTop: '12px',
      },
    },
  },
  Text: {
    variants: {
      'md-p': {
        paddingBottom: '10px',
      },
    },
  },
  Link: {
    variants: {
      'md-a': {
        textDecoration: 'underline',
      },
    },
  },
};

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'system',
    },
    styles: {
      global: {
        body: {
          background: 'blackAlpha.50',
        },
      },
    },
    colors: {
      brand: {
        '50': '#EBF9F3',
        '100': '#C7F0DC',
        '200': '#A3E6C6',
        '300': '#7FDCAF',
        '400': '#5BD299',
        '500': '#37C883',
        '600': '#2CA068',
        '700': '#21784E',
        '800': '#165034',
        '900': '#0B281A',
      },
    },
    semanticTokens: {
      colors: {
        cardBackground: {
          default: 'white',
          _dark: 'whiteAlpha.100',
        },
      },
    },
    components: {
      ...markdownComponents,
      Box: {
        variants: {
          card: {
            boxShadow: '0 2px 2px rgba(0,0,0,0.1)',
            borderRadius: '24px',
          },
        },
      },
    },
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

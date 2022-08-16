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
    colors: {
      brand: {
        500: 'rgb(54, 196, 128)',
      },
    },
    components: {
      ...markdownComponents,
    },
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

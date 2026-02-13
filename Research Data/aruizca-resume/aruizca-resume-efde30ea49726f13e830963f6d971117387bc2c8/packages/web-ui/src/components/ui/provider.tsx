import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import React from 'react'

// Define your custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#cce7ff',
      200: '#99cfff',
      300: '#66b7ff',
      400: '#339fff',
      500: '#0087ff',
      600: '#006acc',
      700: '#004d99',
      800: '#003066',
      900: '#001a33',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  )
}

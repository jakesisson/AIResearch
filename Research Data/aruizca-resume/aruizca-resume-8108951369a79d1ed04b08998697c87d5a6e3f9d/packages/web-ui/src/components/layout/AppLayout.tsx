import { Box, Container } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

export interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Main app layout wrapper component
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <AppHeader />
      
      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

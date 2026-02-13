import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface AppNavigationProps {
  currentTabIndex: number;
  onTabChange: (index: number) => void;
  resumeContent: ReactNode;
  coverLetterContent: ReactNode;
}

/**
 * Main navigation tabs component
 */
export const AppNavigation = ({ 
  currentTabIndex, 
  onTabChange, 
  resumeContent, 
  coverLetterContent 
}: AppNavigationProps) => {
  return (
    <Tabs 
      variant="enclosed" 
      colorScheme="brand"
      index={currentTabIndex}
      onChange={onTabChange}
    >
      <TabList mb={8} justifyContent="center">
        <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
          📄 Generate JSON Resume
        </Tab>
        <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
          ✉️ Generate Cover Letter
        </Tab>
      </TabList>

      <TabPanels>
        {/* Resume Generation Tab */}
        <TabPanel p={0}>
          {resumeContent}
        </TabPanel>

        {/* Cover Letter Generation Tab */}
        <TabPanel p={0}>
          {coverLetterContent}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

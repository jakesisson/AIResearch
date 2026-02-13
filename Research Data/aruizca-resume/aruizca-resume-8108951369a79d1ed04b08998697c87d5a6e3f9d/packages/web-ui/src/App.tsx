import { useAppNavigation } from './hooks';
import { AppLayout, AppNavigation } from './components/layout';
import { CoverLetterPage, ResumePage } from './pages';

/**
 * Main application component
 * 
 * Simplified to handle only top-level routing and layout composition.
 * Business logic has been extracted to custom hooks and page components.
 */
function App() {
  const { currentTabIndex, handleTabChange } = useAppNavigation();

  return (
    <AppLayout>
      <AppNavigation
        currentTabIndex={currentTabIndex}
        onTabChange={handleTabChange}
        resumeContent={<ResumePage />}
        coverLetterContent={<CoverLetterPage />}
      />
    </AppLayout>
  );
}

export default App;
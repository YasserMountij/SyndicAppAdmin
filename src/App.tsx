import { ConfigProvider, theme } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#1677ff',
              colorBgContainer: '#141414',
              colorBgElevated: '#1f1f1f',
              colorBorder: '#303030',
              borderRadius: 6,
            },
            components: {
              Layout: {
                siderBg: '#141414',
                bodyBg: '#0a0a0a',
              },
              Menu: {
                darkItemBg: 'transparent',
                darkSubMenuItemBg: 'transparent',
              },
              Table: {
                headerBg: '#1f1f1f',
                rowHoverBg: '#1f1f1f',
              },
              Card: {
                colorBgContainer: '#141414',
              },
              Modal: {
                contentBg: '#141414',
                headerBg: '#141414',
              },
              Input: {
                colorBgContainer: '#1f1f1f',
              },
              Select: {
                colorBgContainer: '#1f1f1f',
              },
              DatePicker: {
                colorBgContainer: '#1f1f1f',
              },
            },
          }}
        >
          <AppRoutes />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

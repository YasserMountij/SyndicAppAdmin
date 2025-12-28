import { useState, useEffect } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

const { Content, Sider } = Layout;

// Custom hook for detecting mobile breakpoint
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close drawer when navigating (for mobile)
  const handleNavigate = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Mobile layout with drawer
  if (isMobile) {
    return (
      <Layout className="min-h-screen">
        {/* Fixed mobile header */}
        <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#141414] border-b border-[#303030] flex items-center px-4">
          <Button
            type="text"
            icon={<MenuOutlined className="text-white text-lg" />}
            onClick={() => setDrawerOpen(true)}
            className="mr-3"
          />
          <h1 className="text-white font-bold text-lg">SyndicApp Admin</h1>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={
            <span className="text-white font-bold">Menu</span>
          }
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
          closeIcon={<CloseOutlined className="text-white" />}
          styles={{
            header: { 
              background: '#141414', 
              borderBottom: '1px solid #303030' 
            },
            body: { 
              background: '#141414', 
              padding: 0 
            },
          }}
        >
          <Sidebar collapsed={false} onNavigate={handleNavigate} />
        </Drawer>

        {/* Main content with top padding for fixed header */}
        <Content className="p-4 pt-18 bg-[#0a0a0a] min-h-screen overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    );
  }

  // Desktop layout with collapsible sidebar
  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="bg-[#141414]! border-r border-[#303030] fixed! left-0 top-0 bottom-0 z-50 h-screen overflow-hidden"
        width={240}
        style={{ position: 'fixed', height: '100vh', overflow: 'hidden' }}
      >
        <div className="h-16 flex items-center justify-center border-b border-[#303030]">
          <h1 className={`text-white font-bold ${collapsed ? 'text-lg' : 'text-xl'}`}>
            {collapsed ? 'SA' : 'SyndicApp Admin'}
          </h1>
        </div>
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar collapsed={collapsed} />
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Content className="p-6 bg-[#0a0a0a] min-h-screen overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import {
  DashboardOutlined,
  HomeOutlined,
  DollarOutlined,
  UserOutlined,
  DeleteOutlined,
  TeamOutlined,
  LogoutOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, logout, user } = useAuth();

  // Get the current route for menu selection
  const selectedKey = location.pathname === '/' 
    ? '/' 
    : '/' + location.pathname.split('/')[1];

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === 'logout') {
      await logout();
      navigate('/login');
      return;
    }
    navigate(key);
    onNavigate?.();
  };

  // Build menu items dynamically
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/residences',
      icon: <HomeOutlined />,
      label: 'Residences',
    },
    {
      key: '/payments',
      icon: <DollarOutlined />,
      label: 'Payments',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/deletion-requests',
      icon: <DeleteOutlined />,
      label: 'Deletion Requests',
    },
    {
      key: '/otps',
      icon: <KeyOutlined />,
      label: 'OTPs',
    },
    // Admin Users - only visible to SUPER_ADMIN
    ...(isSuperAdmin ? [{
      key: '/admin-users',
      icon: <TeamOutlined />,
      label: 'Admin Users',
    }] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none bg-transparent flex-1"
        inlineCollapsed={collapsed}
      />
      
      {/* User info and logout at bottom */}
      <div className="border-t border-[#303030] p-3">
        {!collapsed && user && (
          <div className="text-gray-400 text-xs mb-2 truncate px-2">
            {user.email}
          </div>
        )}
        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              danger: true,
            },
          ]}
          onClick={handleMenuClick}
          className="border-none bg-transparent"
          inlineCollapsed={collapsed}
          selectable={false}
        />
      </div>
    </div>
  );
}

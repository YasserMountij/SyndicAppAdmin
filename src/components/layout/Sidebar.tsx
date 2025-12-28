import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import {
  DashboardOutlined,
  HomeOutlined,
  DollarOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface SidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

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
];

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current route for menu selection
  const selectedKey = location.pathname === '/' 
    ? '/' 
    : '/' + location.pathname.split('/')[1];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    onNavigate?.();
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={handleMenuClick}
      className="border-none bg-transparent"
      inlineCollapsed={collapsed}
    />
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, Gamepad2, Archive, TrendingUp, User, Settings, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const mainItems = [
  { path: '/', icon: Home, label: 'Home', labelKo: '홈' },
  { path: '/pick', icon: Target, label: 'PICK', labelKo: 'PICK' },
  { path: '/play', icon: Gamepad2, label: 'PLAY', labelKo: 'PLAY' },
];

const collectionItems = [
  { path: '/vault', icon: Archive, label: 'VAULT', labelKo: 'VAULT' },
  { path: '/rise', icon: TrendingUp, label: 'RISE', labelKo: 'RISE' },
  { path: '/collection', icon: Archive, label: 'Collection', labelKo: '컬렉션' },
];

const accountItems = [
  { path: '/my', icon: User, label: 'MY', labelKo: 'MY' },
  { path: '/settings', icon: Settings, label: 'Settings', labelKo: '설정' },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { language } = useLanguage();

  const getLabel = (item: any) => {
    return language === 'ko' ? item.labelKo : item.label;
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isGroupExpanded = (items: any[]) => {
    return items.some((item) => isActive(item.path));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarTrigger className="m-2" />

      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>{language === 'ko' ? '메인' : 'Main'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} end={item.path === '/'} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {open && <span>{getLabel(item)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collection */}
        <SidebarGroup>
          <SidebarGroupLabel>{language === 'ko' ? '컬렉션' : 'Collection'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collectionItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {open && <span>{getLabel(item)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>{language === 'ko' ? '계정' : 'Account'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {open && <span>{getLabel(item)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

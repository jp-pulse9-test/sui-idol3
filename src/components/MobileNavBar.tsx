import { NavLink } from 'react-router-dom';
import { Home, Target, Gamepad2, Archive, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home', labelKo: '홈' },
  { path: '/pick', icon: Target, label: 'PICK', labelKo: 'PICK' },
  { path: '/play', icon: Gamepad2, label: 'PLAY', labelKo: 'PLAY' },
  { path: '/vault', icon: Archive, label: 'VAULT', labelKo: 'VAULT' },
  { path: '/my', icon: User, label: 'MY', labelKo: 'MY' },
];

export function MobileNavBar() {
  const { language } = useLanguage();

  const getLabel = (item: typeof navItems[0]) => {
    return language === 'ko' ? item.labelKo : item.label;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1',
                'text-muted-foreground hover:text-foreground',
                isActive && 'text-primary bg-primary/10'
              )
            }
            end={item.path === '/'}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{getLabel(item)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

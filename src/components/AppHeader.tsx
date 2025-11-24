import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Target, Gamepad2, Archive, TrendingUp, User, Settings, Wallet, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home', labelKo: '홈' },
  { path: '/pick', icon: Target, label: 'PICK', labelKo: 'PICK', requiresAuth: false },
  { path: '/play', icon: Gamepad2, label: 'PLAY', labelKo: 'PLAY', requiresAuth: false },
  { path: '/vault', icon: Archive, label: 'VAULT', labelKo: 'VAULT', requiresAuth: false },
  { path: '/simulator', icon: TrendingUp, label: 'The Legend & Old Earth Simulator', labelKo: 'The Legend & Old Earth Simulator', requiresAuth: false, isExternal: true, externalUrl: 'https://aidol101-old-earth-simulator-1034785841986.us-west1.run.app/' },
  { path: '/my', icon: User, label: 'MY', labelKo: 'MY', requiresAuth: false },
  { path: '/settings', icon: Settings, label: 'Settings', labelKo: '설정', requiresAuth: false },
];

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const { isGuest } = useAuthGuard('/', false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const getLabel = (item: typeof navItems[0]) => {
    return language === 'ko' ? item.labelKo : item.label;
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileMenuOpen(false);
    if (item.isExternal) {
      setSimulatorOpen(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo (홈 링크 통합) */}
          <NavLink 
            to="/" 
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="text-2xl font-bold text-white">AIDOL101</div>
          </NavLink>

          {/* Right: Hamburger Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 pt-8">
                  {/* Language & Wallet */}
                  <div className="flex items-center gap-2 mb-4">
                    <LanguageSelector />
                    <WalletConnectButton />
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      item.isExternal ? (
                        <button
                          key={item.path}
                          onClick={() => handleNavClick(item)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-foreground hover:bg-muted text-left"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-base">{getLabel(item)}</span>
                        </button>
                      ) : (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                              'text-foreground hover:bg-muted',
                              isActive && 'bg-primary/10 text-primary font-medium'
                            )
                          }
                          end={item.path === '/'}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-base">{getLabel(item)}</span>
                        </NavLink>
                      )
                    ))}
                  </nav>

                  {/* Guest Mode Badge */}
                  {isGuest && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {language === 'ko' ? '게스트 모드 - 지갑을 연결하여 더 많은 기능 이용' : 'Guest Mode - Connect wallet for more features'}
                      </p>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Simulator Modal */}
      <Dialog open={simulatorOpen} onOpenChange={setSimulatorOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">The Legend & Old Earth Simulator</DialogTitle>
          <iframe
            src="https://aidol101-old-earth-simulator-1034785841986.us-west1.run.app/"
            className="w-full h-full border-0"
            title="The Legend & Old Earth Simulator"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Home, Target, Gamepad2, Archive, TrendingUp, User, Settings, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const commands = [
  { path: '/', icon: Home, label: 'Home', labelKo: '홈', keywords: ['home', 'main', '홈', '메인'] },
  { path: '/pick', icon: Target, label: 'PICK', labelKo: 'PICK', keywords: ['pick', 'tournament', '픽', '토너먼트'] },
  { path: '/play', icon: Gamepad2, label: 'PLAY', labelKo: 'PLAY', keywords: ['play', 'mission', '플레이', '미션'] },
  { path: '/vault', icon: Archive, label: 'VAULT', labelKo: 'VAULT', keywords: ['vault', 'box', '볼트', '박스'] },
  { path: '/rise', icon: TrendingUp, label: 'RISE', labelKo: 'RISE', keywords: ['rise', 'leaderboard', '라이즈', '리더보드'] },
  { path: '/my', icon: User, label: 'MY', labelKo: 'MY', keywords: ['my', 'profile', '마이', '프로필'] },
  { path: '/settings', icon: Settings, label: 'Settings', labelKo: '설정', keywords: ['settings', 'config', '설정'] },
  { path: '/collection', icon: Archive, label: 'Collection', labelKo: '컬렉션', keywords: ['collection', 'photocard', '컬렉션', '포토카드'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const getLabel = (cmd: typeof commands[0]) => {
    return language === 'ko' ? cmd.labelKo : cmd.label;
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={language === 'ko' ? '검색...' : 'Search...'} />
      <CommandList>
        <CommandEmpty>{language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}</CommandEmpty>
        <CommandGroup heading={language === 'ko' ? '페이지' : 'Pages'}>
          {commands.map((cmd) => (
            <CommandItem key={cmd.path} onSelect={() => handleSelect(cmd.path)}>
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{getLabel(cmd)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

import { Bell, Search, User } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface HeaderProps {
  title: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

function Header({ 
  title, 
  searchPlaceholder = "البحث...",
  showSearch = true,
  showNotifications = true,
  showProfile = true 
}: HeaderProps) {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {showSearch && (
            <div className="relative">
              <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="w-64 pr-10 rtl:pl-10 rtl:pr-3"
              />
            </div>
          )}
          
          {showNotifications && (
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          )}
          
          {showProfile && (
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
export default Header;
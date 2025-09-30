import { Link, useLocation } from "react-router-dom";
import { TablerIcon } from "@tabler/icons-react";

type TabItem = {
  title: string;
  url: string;
  icon: TablerIcon;
};

interface AnimatedTabNavProps {
  items: TabItem[];
  themeColor?: string;
}

export function AnimatedTabNav({ items, themeColor }: AnimatedTabNavProps) {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.url;
        
        return (
          <Link
            key={item.title}
            to={item.url}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
              transition-all duration-300 ease-in-out
              ${isActive 
                ? 'shadow-md' 
                : 'hover:shadow-md'
              }
              ${isActive 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            style={{
              color: isActive ? (themeColor || 'hsl(var(--primary))') : undefined
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
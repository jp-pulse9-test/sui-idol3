import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  id?: string;
}

export const SectionHeader = ({ icon: Icon, emoji, title, description, id }: SectionHeaderProps) => {
  return (
    <div id={id} className="space-y-2 scroll-mt-24">
      <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8" />}
        {emoji && <span className="text-4xl">{emoji}</span>}
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

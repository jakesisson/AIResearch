import { LucideIcon, LucideProps } from "lucide-react";
import * as Icons from "lucide-react";

interface AppIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

const AppIcon = ({ name, ...props }: AppIconProps) => {
  const IconComponent = (Icons as Record<string, LucideIcon>)[name];
  
  if (!IconComponent) {
    return <Icons.HelpCircle {...props} />;
  }
  
  return <IconComponent {...props} />;
};

export { AppIcon };
export default AppIcon;

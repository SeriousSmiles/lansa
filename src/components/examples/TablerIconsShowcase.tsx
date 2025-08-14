import { 
  IconHome, 
  IconUser, 
  IconSettings, 
  IconHeart, 
  IconStar, 
  IconBell, 
  IconMessage, 
  IconSearch, 
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconUpload,
  IconShare,
  IconPalette,
  IconBolt,
  IconShield,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconMenu,
  IconGrid3x3,
  IconList,
  IconCalendar,
  IconClock,
  IconMail,
  IconPhone,
  IconMapPin,
  IconGlobe,
  IconCamera,
  IconPhoto,
  IconVideo,
  IconMusic,
  IconFile,
  IconFolder,
  IconLock,
  IconLockOpen,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconChartLine,
  IconDatabase,
  IconCloud,
  IconWifi,
  IconBluetooth,
  IconBattery,
  IconVolume,
  IconMicrophone,
  IconHeadphones
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TablerIconsShowcase() {
  const iconCategories = [
    {
      title: "Navigation & UI",
      icons: [
        { name: "Home", icon: IconHome },
        { name: "User", icon: IconUser },
        { name: "Settings", icon: IconSettings },
        { name: "Menu", icon: IconMenu },
        { name: "Search", icon: IconSearch },
        { name: "Plus", icon: IconPlus },
        { name: "Edit", icon: IconEdit },
        { name: "Trash", icon: IconTrash },
        { name: "Eye", icon: IconEye },
        { name: "Check", icon: IconCheck },
        { name: "X", icon: IconX },
        { name: "Arrow Left", icon: IconArrowLeft },
        { name: "Arrow Right", icon: IconArrowRight },
        { name: "Chevron Down", icon: IconChevronDown },
        { name: "Grid", icon: IconGrid3x3 },
        { name: "List", icon: IconList }
      ]
    },
    {
      title: "Communication & Social", 
      icons: [
        { name: "Heart", icon: IconHeart },
        { name: "Star", icon: IconStar },
        { name: "Bell", icon: IconBell },
        { name: "Message", icon: IconMessage },
        { name: "Share", icon: IconShare },
        { name: "Mail", icon: IconMail },
        { name: "Phone", icon: IconPhone }
      ]
    },
    {
      title: "Files & Media",
      icons: [
        { name: "Download", icon: IconDownload },
        { name: "Upload", icon: IconUpload },
        { name: "Camera", icon: IconCamera },
        { name: "Photo", icon: IconPhoto },
        { name: "Video", icon: IconVideo },
        { name: "Music", icon: IconMusic },
        { name: "File", icon: IconFile },
        { name: "Folder", icon: IconFolder }
      ]
    },
    {
      title: "System & Status",
      icons: [
        { name: "Palette", icon: IconPalette },
        { name: "Bolt", icon: IconBolt },
        { name: "Shield", icon: IconShield },
        { name: "Lock", icon: IconLock },
        { name: "Lock Open", icon: IconLockOpen },
        { name: "Refresh", icon: IconRefresh },
        { name: "Wifi", icon: IconWifi },
        { name: "Bluetooth", icon: IconBluetooth },
        { name: "Battery", icon: IconBattery }
      ]
    },
    {
      title: "Data & Analytics",
      icons: [
        { name: "Trending Up", icon: IconTrendingUp },
        { name: "Trending Down", icon: IconTrendingDown },
        { name: "Chart", icon: IconChartLine },
        { name: "Database", icon: IconDatabase },
        { name: "Cloud", icon: IconCloud }
      ]
    },
    {
      title: "Location & Time",
      icons: [
        { name: "Map Pin", icon: IconMapPin },
        { name: "Globe", icon: IconGlobe },
        { name: "Calendar", icon: IconCalendar },
        { name: "Clock", icon: IconClock }
      ]
    },
    {
      title: "Audio & Media",
      icons: [
        { name: "Volume", icon: IconVolume },
        { name: "Microphone", icon: IconMicrophone },
        { name: "Headphones", icon: IconHeadphones }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tabler Icons Showcase</h1>
        <p className="text-muted-foreground">
          A collection of beautiful, customizable icons from Tabler Icons library
        </p>
      </div>

      {iconCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="text-xl">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
              {category.icons.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Icon className="w-6 h-6 text-foreground" />
                    <span className="text-xs text-center text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Usage:</h4>
            <code className="bg-muted p-2 rounded text-sm block">
              {`import { IconHome } from "@tabler/icons-react";

<IconHome className="w-6 h-6" />`}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">With Custom Props:</h4>
            <code className="bg-muted p-2 rounded text-sm block">
              {`<IconHeart 
  className="w-8 h-8 text-red-500" 
  stroke={1.5}
/>`}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Different Sizes:</h4>
            <div className="flex items-center gap-4">
              <IconStar className="w-4 h-4 text-yellow-500" />
              <IconStar className="w-6 h-6 text-yellow-500" />
              <IconStar className="w-8 h-8 text-yellow-500" />
              <IconStar className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
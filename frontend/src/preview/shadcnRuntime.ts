import { getShadcnCatalogRuntimeScript } from './shadcnCatalogRuntime'
import { getShadcnChartsRuntimeScript } from './shadcnChartsRuntime'
import { getShadcnExtendedRuntimeScript } from './shadcnExtendedRuntime'
import {
  getLucideIconsGlobalsExposeScript,
  getLucideIconsRuntimeScript,
} from './lucideIconsRuntime'

/**
 * ShadCN-style React components injected into the preview iframe as globals.
 * API mirrors shadcn/ui so generated code can use familiar component names.
 */
function getShadcnBaseRuntimeScript(): string {
  return `
const { useState, useEffect, useRef, createContext, useContext } = React;

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const buttonVariants = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};
const buttonSizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};
function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      {...props}
    />
  );
}

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  );
}
function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}
function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-semibold leading-none tracking-tight', className)} {...props} />;
}
function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />;
}
function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
  outline: 'text-foreground',
};
function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="separator"
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

function Avatar({ className, ...props }) {
  return <span className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />;
}
function AvatarImage({ className, ...props }) {
  return <img className={cn('aspect-square h-full w-full object-cover', className)} {...props} />;
}
function AvatarFallback({ className, ...props }) {
  return (
    <span
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    />
  );
}

function Table({ className, ...props }) {
  return <div className="relative w-full overflow-auto"><table className={cn('w-full caption-bottom text-sm', className)} {...props} /></div>;
}
function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}
function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}
function TableRow({ className, ...props }) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...props} />;
}
function TableHead({ className, ...props }) {
  return <th className={cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground', className)} {...props} />;
}
function TableCell({ className, ...props }) {
  return <td className={cn('p-2 align-middle', className)} {...props} />;
}

const TabsContext = createContext(null);
function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }) {
  const [internal, setInternal] = useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : internal;
  const setValue = (v) => {
    if (controlledValue === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}
function TabsList({ className, ...props }) {
  return (
    <div
      className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
      {...props}
    />
  );
}
function TabsTrigger({ className, value, ...props }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-background text-foreground shadow' : '',
        className
      )}
      {...props}
    />
  );
}
function TabsContent({ className, value, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
      {...props}
    />
  );
}

const SelectContext = createContext({ value: '', onValueChange: () => {} });
function Select({ value, onValueChange, children }) {
  return <SelectContext.Provider value={{ value, onValueChange }}>{children}</SelectContext.Provider>;
}
function SelectTrigger({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function SelectValue({ placeholder }) {
  const ctx = useContext(SelectContext);
  return <span>{ctx.value || placeholder}</span>;
}
function SelectContent({ className, children, ...props }) {
  return (
    <div className={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props}>
      {children}
    </div>
  );
}
function SelectItem({ className, value, children, ...props }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Checkbox({ className, checked, onCheckedChange, ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        checked ? 'bg-primary text-primary-foreground' : '',
        className
      )}
      {...props}
    >
      {checked ? '✓' : ''}
    </button>
  );
}
function Switch({ className, checked, onCheckedChange, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
        checked ? 'bg-primary' : 'bg-input',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}

function Alert({ className, variant, ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm',
        variant === 'destructive'
          ? 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
          : 'bg-background text-foreground',
        className
      )}
      {...props}
    />
  );
}
function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}
function AlertDescription({ className, ...props }) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}

function Progress({ className, value = 0, ...props }) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)} {...props}>
      <div
        className="h-full bg-primary transition-all"
        style={{ width: Math.min(100, Math.max(0, value)) + '%' }}
      />
    </div>
  );
}

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

function ScrollArea({ className, children, ...props }) {
  return (
    <div className={cn('relative overflow-auto', className)} {...props}>
      {children}
    </div>
  );
}

`.trim();
}

const SHADCN_GLOBAL_NAMES = [
  // Primitives & display
  'Button', 'ButtonGroup', 'Badge', 'Separator', 'Skeleton', 'Progress', 'AspectRatio', 'Spinner',
  'Kbd', 'KbdGroup', 'Toggle', 'ToggleGroup', 'ToggleGroupItem',
  // Layout
  'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
  'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
  'Collapsible', 'CollapsibleTrigger', 'CollapsibleContent',
  'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
  'Resizable', 'ResizablePanelGroup', 'ResizablePanel', 'ResizableHandle',
  'ScrollArea', 'ScrollBar',
  'Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbSeparator', 'BreadcrumbPage', 'BreadcrumbEllipsis',
  'Pagination', 'PaginationContent', 'PaginationItem', 'PaginationLink', 'PaginationPrevious', 'PaginationNext', 'PaginationEllipsis',
  'Sidebar', 'SidebarProvider', 'SidebarTrigger', 'SidebarContent', 'SidebarHeader', 'SidebarFooter',
  'SidebarMenu', 'SidebarMenuItem', 'SidebarMenuButton', 'SidebarGroup', 'SidebarGroupLabel',
  'SidebarGroupContent', 'SidebarInset', 'SidebarRail', 'SidebarSeparator',
  // Forms
  'Input', 'Label', 'Textarea',
  'InputGroup', 'InputGroupInput', 'InputGroupAddon',
  'InputOTP', 'InputOTPGroup', 'InputOTPSlot', 'InputOTPSeparator',
  'Checkbox', 'Switch', 'Slider',
  'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'SelectGroup', 'SelectLabel', 'SelectSeparator',
  'NativeSelect', 'RadioGroup', 'RadioGroupItem', 'Combobox', 'Calendar',
  'Field', 'FieldLabel', 'FieldDescription', 'FieldError', 'FieldGroup', 'FieldSet', 'FieldLegend',
  'Item', 'ItemContent', 'ItemTitle', 'ItemDescription', 'ItemMedia', 'Empty',
  // Feedback & overlays
  'Alert', 'AlertTitle', 'AlertDescription',
  'AlertDialog', 'AlertDialogTrigger', 'AlertDialogContent', 'AlertDialogHeader', 'AlertDialogFooter',
  'AlertDialogTitle', 'AlertDialogDescription', 'AlertDialogAction', 'AlertDialogCancel',
  'Dialog', 'DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter', 'DialogClose',
  'Drawer', 'DrawerTrigger', 'DrawerContent', 'DrawerHeader', 'DrawerTitle', 'DrawerDescription', 'DrawerFooter', 'DrawerClose',
  'Sheet', 'SheetTrigger', 'SheetContent', 'SheetHeader', 'SheetTitle', 'SheetDescription', 'SheetFooter', 'SheetClose',
  'Tooltip', 'TooltipTrigger', 'TooltipContent', 'TooltipProvider',
  'Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverAnchor',
  'HoverCard', 'HoverCardTrigger', 'HoverCardContent',
  'DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuCheckboxItem',
  'DropdownMenuRadioItem', 'DropdownMenuLabel', 'DropdownMenuSeparator', 'DropdownMenuShortcut',
  'DropdownMenuGroup', 'DropdownMenuSub', 'DropdownMenuSubContent', 'DropdownMenuSubTrigger', 'DropdownMenuRadioGroup',
  'ContextMenu', 'ContextMenuTrigger', 'ContextMenuContent', 'ContextMenuItem', 'ContextMenuCheckboxItem',
  'ContextMenuRadioItem', 'ContextMenuLabel', 'ContextMenuSeparator', 'ContextMenuShortcut',
  'ContextMenuGroup', 'ContextMenuSub', 'ContextMenuSubContent', 'ContextMenuSubTrigger', 'ContextMenuRadioGroup',
  'Menubar', 'MenubarMenu', 'MenubarTrigger', 'MenubarContent', 'MenubarItem', 'MenubarSeparator',
  'MenubarLabel', 'MenubarCheckboxItem', 'MenubarRadioGroup', 'MenubarRadioItem',
  'MenubarShortcut', 'MenubarGroup', 'MenubarSub', 'MenubarSubContent', 'MenubarSubTrigger',
  'NavigationMenu', 'NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuTrigger',
  'NavigationMenuContent', 'NavigationMenuLink', 'NavigationMenuIndicator', 'NavigationMenuViewport',
  'Command', 'CommandDialog', 'CommandInput', 'CommandList', 'CommandEmpty', 'CommandGroup',
  'CommandItem', 'CommandShortcut', 'CommandSeparator',
  'toast', 'Sonner',
  'Toast', 'ToastProvider', 'ToastViewport', 'ToastTitle', 'ToastDescription', 'ToastClose', 'ToastAction', 'Toaster', 'useToast',
  // Data display
  'Avatar', 'AvatarImage', 'AvatarFallback',
  'Table', 'TableHeader', 'TableBody', 'TableFooter', 'TableRow', 'TableHead', 'TableCell', 'TableCaption',
  'Carousel', 'CarouselContent', 'CarouselItem', 'CarouselPrevious', 'CarouselNext',
  // Charts
  'ChartContainer', 'ChartTooltip', 'ChartTooltipContent', 'ChartLegend', 'ChartLegendContent', 'ChartStyle',
  'BarChart', 'Bar', 'LineChart', 'Line', 'AreaChart', 'Area', 'PieChart', 'Pie', 'Cell',
  'RadarChart', 'Radar', 'PolarGrid', 'PolarAngleAxis', 'PolarRadiusAxis',
  'RadialBarChart', 'RadialBar', 'XAxis', 'YAxis', 'CartesianGrid', 'ResponsiveContainer',
  'Legend', 'ReferenceLine', 'ReferenceArea',
] as const

function getShadcnGlobalsExposeScript(): string {
  return `
if (typeof window !== 'undefined') {
  const __names = ${JSON.stringify(SHADCN_GLOBAL_NAMES)};
  __names.forEach((name) => {
    try {
      const ref = eval(name);
      if (ref !== undefined) window[name] = ref;
    } catch (_) {}
  });
}
`.trim();
}

export function getShadcnRuntimeScript(): string {
  return [
    getShadcnBaseRuntimeScript(),
    getLucideIconsRuntimeScript(),
    getShadcnExtendedRuntimeScript(),
    getShadcnCatalogRuntimeScript(),
    getShadcnChartsRuntimeScript(),
    getShadcnGlobalsExposeScript(),
    getLucideIconsGlobalsExposeScript(),
  ].join('\n\n');
}

/** Dark theme for preview — ReactBits shader backgrounds (Aurora, LiquidEther) need a dark canvas. */
export const SHADCN_PREVIEW_THEME_DARK = `
:root {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --card: 222 47% 8%;
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 8%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222 47% 11%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 33% 20%;
  --input: 217 33% 20%;
  --ring: 212 27% 84%;
  --radius: 0.5rem;
  --chart-1: 221 83% 53%;
  --chart-2: 212 95% 68%;
  --chart-3: 216 92% 60%;
  --chart-4: 210 98% 78%;
  --chart-5: 212 97% 87%;
}
body {
  font-family: ui-sans-serif, system-ui, sans-serif;
  background-color: #020617;
  color: hsl(var(--foreground));
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.45s ease-out both;
}
`.trim();

export const SHADCN_PREVIEW_THEME = `
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
  --chart-1: 221 83% 53%;
  --chart-2: 212 95% 68%;
  --chart-3: 216 92% 60%;
  --chart-4: 210 98% 78%;
  --chart-5: 212 97% 87%;
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
body {
  font-family: ui-sans-serif, system-ui, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.45s ease-out both;
}
@keyframes aurora-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes particle-float {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(12px, -18px); opacity: 0.85; }
}
.animate-particle-float {
  animation: particle-float ease-in-out infinite;
}
`.trim();

export const SHADCN_TAILWIND_CONFIG = `
tailwind.config = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
`.trim();

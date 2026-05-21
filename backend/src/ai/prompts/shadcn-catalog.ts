/** ShadCN components available in the preview runtime (injected as globals). */
export const SHADCN_COMPONENT_CATALOG = `
Available ShadCN components (use as JSX tags — no imports; React and all components are globals):

=== PRIMITIVES & DISPLAY ===
- Button (variant: default | destructive | outline | secondary | ghost | link; size: default | sm | lg | icon)
- ButtonGroup — group of related buttons or split buttons
- Badge (variant: default | secondary | destructive | outline)
- Separator (orientation: horizontal | vertical)
- Skeleton — loading placeholder
- Progress — progress bar (value: 0–100)
- AspectRatio — enforces aspect ratio on media
- Spinner — animated loading indicator
- Kbd, KbdGroup — keyboard key display (e.g. <KbdGroup><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup>)
- Toggle (variant: default | outline; size: default | sm | lg)
- ToggleGroup, ToggleGroupItem

=== LAYOUT & STRUCTURE ===
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Accordion, AccordionItem, AccordionTrigger, AccordionContent
- Collapsible, CollapsibleTrigger, CollapsibleContent
- Tabs, TabsList, TabsTrigger, TabsContent (defaultValue on Tabs)
- Resizable — ResizablePanelGroup, ResizablePanel, ResizableHandle
- ScrollArea, ScrollBar
- Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbEllipsis
- Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis
- Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarInset, SidebarRail, SidebarSeparator

=== LUCIDE ICONS (globals — no imports) ===
- Check, X, ChevronDown, ChevronRight, ChevronLeft, ChevronUp
- ArrowRight, ArrowLeft, Plus, Minus, Star, CircleCheck, CheckCircle2
- Search, Menu, Mail, User, Users, Loader2, Sparkles, Zap
- Example: <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Feature</li>
- Do not use other Lucide icon names or import from lucide-react.

=== TYPOGRAPHY ===
- Use semantic HTML: h1–h4, p, blockquote, ul, code, and Tailwind prose utilities

=== FORMS ===
- Input, Label, Textarea
- InputGroup, InputGroupInput, InputGroupAddon — input with icons/buttons/labels
- InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator
- Checkbox, Switch, Slider
- Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator
- NativeSelect — native <select> styled component
- RadioGroup, RadioGroupItem
- Combobox — searchable select (composed from Command + Popover)
- Calendar — date picker calendar (uses react-day-picker)
- Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend
- Item, ItemContent, ItemTitle, ItemDescription, ItemMedia — list item display
- Empty — empty state component

=== FEEDBACK & OVERLAYS ===
- Alert, AlertTitle, AlertDescription
- AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel
- Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
- Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose
- Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose
- Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
- Popover, PopoverTrigger, PopoverContent, PopoverAnchor
- HoverCard, HoverCardTrigger, HoverCardContent
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuRadioGroup
- ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator,
  ContextMenuShortcut, ContextMenuGroup, ContextMenuSub, ContextMenuSubContent,
  ContextMenuSubTrigger, ContextMenuRadioGroup
- Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator,
  MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem,
  MenubarShortcut, MenubarGroup, MenubarSub, MenubarSubContent, MenubarSubTrigger
- NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger,
  NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport
- Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem, CommandShortcut, CommandSeparator
- Sonner / toast() — toast notifications (call toast("msg") from sonner)
- Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction, Toaster, useToast

=== DATA DISPLAY ===
- Avatar, AvatarImage, AvatarFallback
- Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
- Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext

=== CHARTS (Recharts — use inside ChartContainer) ===
- ChartContainer (config: { [seriesKey]: { label, color } }, className for size)
- ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle
- Recharts globals: BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Legend, ReferenceLine, ReferenceArea

Chart example:
<Card className="backdrop-blur-md bg-white/5 border border-white/10 m-2">
  <CardHeader>
    <CardTitle>Monthly Revenue</CardTitle>
    <CardDescription>Last 6 months</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-1))" } }} className="min-h-[280px] w-full">
      <BarChart data={[{ month: "Jan", revenue: 4200 }, { month: "Feb", revenue: 5100 }]}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  </CardContent>
</Card>
`.trim();

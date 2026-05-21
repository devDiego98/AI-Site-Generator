/** Remaining ShadCN catalog components for the preview iframe (globals). */
export function getShadcnCatalogRuntimeScript(): string {
  return `
// ── Primitives ──────────────────────────────────────────────────────────────
function ButtonGroup({ className, orientation = 'horizontal', children, ...props }) {
  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(
        'flex w-fit items-stretch',
        orientation === 'vertical'
          ? 'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none'
          : '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Spinner({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}

function Kbd({ className, ...props }) {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }) {
  return <span className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

const ToggleGroupCtx = createContext({ type: 'single', value: '', onValueChange: () => {} });
function ToggleGroup({ type = 'single', value, onValueChange, className, children, ...props }) {
  return (
    <ToggleGroupCtx.Provider value={{ type, value, onValueChange }}>
      <div className={cn('inline-flex items-center rounded-md border', className)} role="group" {...props}>
        {children}
      </div>
    </ToggleGroupCtx.Provider>
  );
}
function ToggleGroupItem({ value, className, children, ...props }) {
  const ctx = useContext(ToggleGroupCtx);
  const pressed = ctx.value === value;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        'inline-flex items-center justify-center px-3 py-1.5 text-sm transition-colors hover:bg-accent',
        pressed ? 'bg-accent text-accent-foreground' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Toggle({ pressed, onPressedChange, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent',
        pressed ? 'bg-accent text-accent-foreground' : 'bg-transparent',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Layout ──────────────────────────────────────────────────────────────────
function ResizablePanelGroup({ className, direction = 'horizontal', children, ...props }) {
  return (
    <div
      className={cn('flex h-full w-full', direction === 'vertical' ? 'flex-col' : 'flex-row', className)}
      {...props}
    >
      {children}
    </div>
  );
}
function ResizablePanel({ className, defaultSize, children, ...props }) {
  return (
    <div className={cn('flex-1 overflow-auto', className)} style={{ flexBasis: defaultSize ? defaultSize + '%' : undefined }} {...props}>
      {children}
    </div>
  );
}
function ResizableHandle({ className, ...props }) {
  return <div className={cn('w-1 shrink-0 cursor-col-resize bg-border', className)} {...props} />;
}
function Resizable(props) {
  return <ResizablePanelGroup {...props} />;
}

function ScrollBar({ className, orientation = 'vertical', ...props }) {
  return (
    <div
      className={cn(
        'flex touch-none select-none bg-border/40',
        orientation === 'vertical' ? 'h-full w-2.5 border-l border-l-transparent p-px' : 'h-2.5 w-full border-t border-t-transparent p-px',
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
      …
    </span>
  );
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span className={cn('flex h-9 w-9 items-center justify-center text-sm', className)} {...props}>
      …
    </span>
  );
}

const SidebarCtx = createContext({ open: true, setOpen: () => {}, collapsed: false });
function SidebarProvider({ defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, setOpen, collapsed, setCollapsed }}>
      <div className="flex min-h-full w-full">{children}</div>
    </SidebarCtx.Provider>
  );
}
function Sidebar({ className, children, ...props }) {
  const ctx = useContext(SidebarCtx);
  if (!ctx.open) return null;
  return (
    <aside className={cn('flex w-64 shrink-0 flex-col border-r bg-muted/30', ctx.collapsed && 'w-14', className)} {...props}>
      {children}
    </aside>
  );
}
function SidebarInset({ className, children, ...props }) {
  return <main className={cn('flex flex-1 flex-col', className)} {...props}>{children}</main>;
}
function SidebarTrigger({ className, ...props }) {
  const ctx = useContext(SidebarCtx);
  return (
    <Button variant="ghost" size="icon" className={className} onClick={() => ctx.setOpen(!ctx.open)} {...props}>
      ☰
    </Button>
  );
}
function SidebarHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-2 p-4', className)} {...props} />;
}
function SidebarFooter({ className, ...props }) {
  return <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}
function SidebarContent({ className, ...props }) {
  return <div className={cn('flex flex-1 flex-col gap-2 overflow-auto p-2', className)} {...props} />;
}
function SidebarGroup({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 px-2 py-2', className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }) {
  return <div className={cn('px-2 py-1 text-xs font-medium text-muted-foreground', className)} {...props} />;
}
function SidebarGroupContent({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}
function SidebarMenu({ className, ...props }) {
  return <ul className={cn('flex flex-col gap-1', className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }) {
  return <li className={cn('list-none', className)} {...props} />;
}
function SidebarMenuButton({ className, isActive, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
        isActive ? 'bg-accent text-accent-foreground' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function SidebarRail({ className, ...props }) {
  return <div className={cn('absolute inset-y-0 right-0 w-1 cursor-col-resize', className)} {...props} />;
}
function SidebarSeparator({ className, ...props }) {
  return <Separator className={cn('my-2', className)} {...props} />;
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function InputGroup({ className, ...props }) {
  return <div className={cn('flex w-full items-center rounded-md border border-input shadow-sm', className)} {...props} />;
}
function InputGroupInput({ className, ...props }) {
  return <Input className={cn('border-0 shadow-none focus-visible:ring-0', className)} {...props} />;
}
function InputGroupAddon({ className, ...props }) {
  return <div className={cn('flex items-center px-3 text-sm text-muted-foreground', className)} {...props} />;
}

const InputOTPCtx = createContext({ value: '', setValue: () => {}, maxLength: 6 });
function InputOTP({ maxLength = 6, value, onChange, children, ...props }) {
  const [internal, setInternal] = useState('');
  const current = value !== undefined ? value : internal;
  const setValue = (v) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };
  return (
    <InputOTPCtx.Provider value={{ value: current, setValue, maxLength }}>
      <div className={cn('flex items-center gap-2', props.className)}>{children}</div>
    </InputOTPCtx.Provider>
  );
}
function InputOTPGroup({ className, ...props }) {
  return <div className={cn('flex items-center gap-1', className)} {...props} />;
}
function InputOTPSlot({ index, className, ...props }) {
  const ctx = useContext(InputOTPCtx);
  const char = ctx.value[index] || '';
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md border border-input text-sm',
        className
      )}
      {...props}
    >
      {char}
    </div>
  );
}
function InputOTPSeparator({ ...props }) {
  return <span className="text-muted-foreground" {...props}>–</span>;
}

function SelectGroup({ className, ...props }) {
  return <div className={cn('p-1', className)} {...props} />;
}
function SelectLabel({ className, ...props }) {
  return <div className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)} {...props} />;
}
function SelectSeparator({ className, ...props }) {
  return <Separator className={cn('my-1', className)} {...props} />;
}

function NativeSelect({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function FieldSet({ className, ...props }) {
  return <fieldset className={cn('space-y-4', className)} {...props} />;
}
function FieldLegend({ className, ...props }) {
  return <legend className={cn('text-sm font-medium', className)} {...props} />;
}
function FieldGroup({ className, ...props }) {
  return <div className={cn('space-y-4', className)} {...props} />;
}
function Field({ className, ...props }) {
  return <div className={cn('space-y-2', className)} {...props} />;
}
function FieldLabel({ className, ...props }) {
  return <Label className={className} {...props} />;
}
function FieldDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
function FieldError({ className, children, ...props }) {
  return <p className={cn('text-sm text-destructive', className)} {...props}>{children}</p>;
}

function Item({ className, ...props }) {
  return <div className={cn('flex items-start gap-3 rounded-lg border p-3', className)} {...props} />;
}
function ItemMedia({ className, ...props }) {
  return <div className={cn('shrink-0', className)} {...props} />;
}
function ItemContent({ className, ...props }) {
  return <div className={cn('flex flex-1 flex-col gap-1', className)} {...props} />;
}
function ItemTitle({ className, ...props }) {
  return <div className={cn('text-sm font-medium', className)} {...props} />;
}
function ItemDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function Empty({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Calendar({ className, selected, onSelect, ...props }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className={cn('rounded-md border p-3', className)} {...props}>
      <div className="mb-2 flex items-center justify-between text-sm font-medium">
        <button type="button" onClick={() => setMonth((m) => (m === 0 ? (setYear(y => y - 1), 11) : m - 1))}>‹</button>
        <span>{monthNames[month]} {year}</span>
        <button type="button" onClick={() => setMonth((m) => (m === 11 ? (setYear(y => y + 1), 0) : m + 1))}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <span key={d} className="text-muted-foreground">{d}</span>)}
        {days.map((d, i) => (
          d ? (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(new Date(year, month, d))}
              className={cn(
                'rounded p-1 hover:bg-accent',
                selected && selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year
                  ? 'bg-primary text-primary-foreground'
                  : ''
              )}
            >
              {d}
            </button>
          ) : <span key={i} />
        ))}
      </div>
    </div>
  );
}

function DialogClose({ className, children, ...props }) {
  const ctx = useContext(DialogContext);
  return (
    <Button variant="outline" className={className} onClick={() => ctx.setOpen(false)} {...props}>
      {children || 'Close'}
    </Button>
  );
}

const AlertDialogCtx = createContext({ open: false, setOpen: () => {} });
function AlertDialog({ open, onOpenChange, children }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open !== undefined ? open : internal;
  const setOpen = (v) => { if (open === undefined) setInternal(v); onOpenChange?.(v); };
  return <AlertDialogCtx.Provider value={{ open: isOpen, setOpen }}>{children}</AlertDialogCtx.Provider>;
}
function AlertDialogTrigger({ children }) {
  const ctx = useContext(AlertDialogCtx);
  const child = React.Children.only(children);
  return React.cloneElement(child, { onClick: (e) => { child.props.onClick?.(e); ctx.setOpen(true); } });
}
function AlertDialogContent({ className, children, ...props }) {
  const ctx = useContext(AlertDialogCtx);
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" />
      <div className={cn('relative z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg', className)} {...props}>
        {children}
      </div>
    </div>
  );
}
function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}
function AlertDialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}
function AlertDialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}
function AlertDialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
function AlertDialogAction({ className, children, ...props }) {
  const ctx = useContext(AlertDialogCtx);
  return <Button className={className} onClick={() => { props.onClick?.(); ctx.setOpen(false); }} {...props}>{children}</Button>;
}
function AlertDialogCancel({ className, children, ...props }) {
  const ctx = useContext(AlertDialogCtx);
  return <Button variant="outline" className={className} onClick={() => ctx.setOpen(false)} {...props}>{children || 'Cancel'}</Button>;
}

const DrawerCtx = createContext({ open: false, setOpen: () => {} });
function Drawer({ open, onOpenChange, children }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open !== undefined ? open : internal;
  const setOpen = (v) => { if (open === undefined) setInternal(v); onOpenChange?.(v); };
  return <DrawerCtx.Provider value={{ open: isOpen, setOpen }}>{children}</DrawerCtx.Provider>;
}
function DrawerTrigger({ children }) {
  const ctx = useContext(DrawerCtx);
  const child = React.Children.only(children);
  return React.cloneElement(child, { onClick: (e) => { child.props.onClick?.(e); ctx.setOpen(true); } });
}
function DrawerContent({ className, children, ...props }) {
  const ctx = useContext(DrawerCtx);
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col gap-4 border-t bg-background p-6 shadow-lg animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
function DrawerHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}
function DrawerTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}
function DrawerDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
function DrawerFooter({ className, ...props }) {
  return <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />;
}
function DrawerClose({ className, children, ...props }) {
  const ctx = useContext(DrawerCtx);
  return <Button variant="outline" className={className} onClick={() => ctx.setOpen(false)} {...props}>{children || 'Close'}</Button>;
}

function SheetFooter({ className, ...props }) {
  return <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />;
}
function SheetClose({ className, children, ...props }) {
  const ctx = useContext(SheetContext);
  return <Button variant="outline" className={className} onClick={() => ctx.setOpen(false)} {...props}>{children || 'Close'}</Button>;
}

const PopoverCtx = createContext({ open: false, setOpen: () => {} });
function Popover({ children }) {
  const [open, setOpen] = useState(false);
  return <PopoverCtx.Provider value={{ open, setOpen }}>{children}</PopoverCtx.Provider>;
}
function PopoverTrigger({ children }) {
  const ctx = useContext(PopoverCtx);
  const child = React.Children.only(children);
  return React.cloneElement(child, { onClick: (e) => { child.props.onClick?.(e); ctx.setOpen(!ctx.open); } });
}
function PopoverContent({ className, children, align = 'center', ...props }) {
  const ctx = useContext(PopoverCtx);
  if (!ctx.open) return null;
  return (
    <div className={cn('absolute z-50 mt-1 min-w-[8rem] rounded-md border bg-popover p-4 text-popover-foreground shadow-md', className)} {...props}>
      {children}
    </div>
  );
}
function PopoverAnchor({ className, ...props }) {
  return <span className={cn('inline-block', className)} {...props} />;
}

function DropdownMenuLabel({ className, ...props }) {
  return <div className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)} {...props} />;
}
function DropdownMenuCheckboxItem({ className, checked, children, onCheckedChange, ...props }) {
  const ctx = useContext(DropdownCtx);
  return (
    <button type="button" className={cn('relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} onClick={() => { onCheckedChange?.(!checked); ctx.setOpen(false); }} {...props}>
      <span>{checked ? '☑' : '☐'}</span>{children}
    </button>
  );
}
function DropdownMenuRadioGroup({ value, onValueChange, children }) {
  return <div data-value={value}>{React.Children.map(children, (child) => React.cloneElement(child, { __radioValue: value, __onRadioChange: onValueChange }))}</div>;
}
function DropdownMenuRadioItem({ className, value, children, __radioValue, __onRadioChange, ...props }) {
  const ctx = useContext(DropdownCtx);
  return (
    <button type="button" className={cn('relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} onClick={() => { __onRadioChange?.(value); ctx.setOpen(false); }} {...props}>
      <span>{__radioValue === value ? '●' : '○'}</span>{children}
    </button>
  );
}
function DropdownMenuShortcut({ className, ...props }) {
  return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
}
function DropdownMenuGroup({ className, ...props }) {
  return <div className={cn('p-1', className)} {...props} />;
}
function DropdownMenuSub({ children }) {
  const [open, setOpen] = useState(false);
  return <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>{React.Children.map(children, (c) => React.cloneElement(c, { __subOpen: open }))}</div>;
}
function DropdownMenuSubTrigger({ className, children, __subOpen, ...props }) {
  return <button type="button" className={cn('flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} {...props}>{children} ›</button>;
}
function DropdownMenuSubContent({ className, children, __subOpen, ...props }) {
  if (!__subOpen) return null;
  return <div className={cn('absolute left-full top-0 ml-1 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md', className)} {...props}>{children}</div>;
}

const ContextMenuCtx = createContext({ open: false, setOpen: () => {}, x: 0, y: 0 });
function ContextMenu({ children }) {
  const [state, setState] = useState({ open: false, x: 0, y: 0 });
  return (
    <ContextMenuCtx.Provider value={{ ...state, setOpen: (open, x, y) => setState({ open, x: x || 0, y: y || 0 }) }}>
      <div onContextMenu={(e) => { e.preventDefault(); setState({ open: true, x: e.clientX, y: e.clientY }); }}>{children}</div>
    </ContextMenuCtx.Provider>
  );
}
function ContextMenuTrigger({ children }) { return <>{children}</>; }
function ContextMenuContent({ className, children, ...props }) {
  const ctx = useContext(ContextMenuCtx);
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={() => ctx.setOpen(false)}>
      <div className={cn('absolute z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md', className)} style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()} {...props}>
        {children}
      </div>
    </div>
  );
}
function ContextMenuItem({ className, children, ...props }) {
  const ctx = useContext(ContextMenuCtx);
  return <button type="button" className={cn('flex w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} onClick={() => ctx.setOpen(false)} {...props}>{children}</button>;
}
function ContextMenuLabel(props) { return DropdownMenuLabel(props); }
function ContextMenuSeparator(props) { return DropdownMenuSeparator(props); }
function ContextMenuShortcut(props) { return DropdownMenuShortcut(props); }
function ContextMenuGroup(props) { return DropdownMenuGroup(props); }
function ContextMenuCheckboxItem(props) { return DropdownMenuCheckboxItem(props); }
function ContextMenuRadioGroup(props) { return DropdownMenuRadioGroup(props); }
function ContextMenuRadioItem(props) { return DropdownMenuRadioItem(props); }
function ContextMenuSub(props) { return DropdownMenuSub(props); }
function ContextMenuSubTrigger(props) { return DropdownMenuSubTrigger(props); }
function ContextMenuSubContent(props) { return DropdownMenuSubContent(props); }

const MenubarCtx = createContext({ openMenu: null, setOpenMenu: () => {} });
function Menubar({ className, children, ...props }) {
  const [openMenu, setOpenMenu] = useState(null);
  return (
    <MenubarCtx.Provider value={{ openMenu, setOpenMenu }}>
      <div className={cn('flex h-9 items-center gap-1 rounded-md border bg-background p-1', className)} {...props}>{children}</div>
    </MenubarCtx.Provider>
  );
}
function MenubarMenu({ value, children }) {
  return <div className="relative">{React.Children.map(children, (c) => React.cloneElement(c, { __menuValue: value }))}</div>;
}
function MenubarTrigger({ className, children, __menuValue, ...props }) {
  const ctx = useContext(MenubarCtx);
  return (
    <button type="button" className={cn('rounded px-3 py-1 text-sm hover:bg-accent', className)} onClick={() => ctx.setOpenMenu(ctx.openMenu === __menuValue ? null : __menuValue)} {...props}>
      {children}
    </button>
  );
}
function MenubarContent({ className, children, __menuValue, ...props }) {
  const ctx = useContext(MenubarCtx);
  if (ctx.openMenu !== __menuValue) return null;
  return <div className={cn('absolute left-0 top-full z-50 mt-1 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md', className)} {...props}>{children}</div>;
}
function MenubarItem({ className, children, ...props }) {
  const ctx = useContext(MenubarCtx);
  return <button type="button" className={cn('flex w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} onClick={() => ctx.setOpenMenu(null)} {...props}>{children}</button>;
}
function MenubarSeparator(props) { return DropdownMenuSeparator(props); }
function MenubarLabel(props) { return DropdownMenuLabel(props); }
function MenubarShortcut(props) { return DropdownMenuShortcut(props); }
function MenubarGroup(props) { return DropdownMenuGroup(props); }
function MenubarCheckboxItem(props) { return DropdownMenuCheckboxItem(props); }
function MenubarRadioGroup(props) { return DropdownMenuRadioGroup(props); }
function MenubarRadioItem(props) { return DropdownMenuRadioItem(props); }
function MenubarSub(props) { return DropdownMenuSub(props); }
function MenubarSubTrigger(props) { return DropdownMenuSubTrigger(props); }
function MenubarSubContent(props) { return DropdownMenuSubContent(props); }

const NavMenuCtx = createContext({ value: '', setValue: () => {} });
function NavigationMenu({ className, children, ...props }) {
  const [value, setValue] = useState('');
  return (
    <NavMenuCtx.Provider value={{ value, setValue }}>
      <nav className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>{children}</nav>
    </NavMenuCtx.Provider>
  );
}
function NavigationMenuList({ className, ...props }) {
  return <ul className={cn('flex flex-1 list-none items-center justify-center gap-1', className)} {...props} />;
}
function NavigationMenuItem({ className, ...props }) {
  return <li className={cn('relative', className)} {...props} />;
}
function NavigationMenuTrigger({ className, children, ...props }) {
  return <button type="button" className={cn('rounded-md px-4 py-2 text-sm font-medium hover:bg-accent', className)} {...props}>{children}</button>;
}
function NavigationMenuContent({ className, children, ...props }) {
  return <div className={cn('absolute left-0 top-full mt-1 rounded-md border bg-popover p-4 shadow-md', className)} {...props}>{children}</div>;
}
function NavigationMenuLink({ className, href, onClick, ...props }) {
  var safeHref =
    href && (String(href).charAt(0) === '#' || /^javascript:/i.test(String(href)))
      ? href
      : '#';
  return (
    <a
      href={safeHref}
      onClick={onClick}
      className={cn('rounded-md px-4 py-2 text-sm hover:bg-accent', className)}
      {...props}
    />
  );
}
function NavigationMenuIndicator({ className, ...props }) {
  return <div className={cn('top-full h-1.5 w-1.5 rotate-45 rounded-tl-sm bg-border', className)} {...props} />;
}
function NavigationMenuViewport({ className, ...props }) {
  return <div className={cn('absolute left-0 top-full flex justify-center', className)} {...props} />;
}

const CommandCtx = createContext({ search: '', setSearch: () => {} });
function Command({ className, children, ...props }) {
  const [search, setSearch] = useState('');
  return (
    <CommandCtx.Provider value={{ search, setSearch }}>
      <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)} {...props}>{children}</div>
    </CommandCtx.Provider>
  );
}
function CommandDialog({ open, onOpenChange, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">{children}</DialogContent>
    </Dialog>
  );
}
function CommandInput({ className, placeholder, ...props }) {
  const ctx = useContext(CommandCtx);
  return (
    <input
      className={cn('flex h-10 w-full border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground', className)}
      placeholder={placeholder || 'Search…'}
      value={ctx.search}
      onChange={(e) => ctx.setSearch(e.target.value)}
      {...props}
    />
  );
}
function CommandList({ className, ...props }) {
  return <div className={cn('max-h-[300px] overflow-y-auto p-1', className)} {...props} />;
}
function CommandEmpty({ className, children, ...props }) {
  return <div className={cn('py-6 text-center text-sm text-muted-foreground', className)} {...props}>{children || 'No results.'}</div>;
}
function CommandGroup({ className, heading, children, ...props }) {
  return (
    <div className={cn('overflow-hidden p-1', className)} {...props}>
      {heading ? <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div> : null}
      {children}
    </div>
  );
}
function CommandItem({ className, children, onSelect, ...props }) {
  return (
    <button type="button" className={cn('relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent', className)} onClick={onSelect} {...props}>
      {children}
    </button>
  );
}
function CommandShortcut({ className, ...props }) {
  return DropdownMenuShortcut(props);
}
function CommandSeparator({ className, ...props }) {
  return <Separator className={cn('my-1', className)} {...props} />;
}

function Combobox({ options = [], value, onValueChange, placeholder }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((o) => String(o.label || o).toLowerCase().includes(search.toLowerCase()));
  const selected = options.find((o) => (o.value ?? o) === value);
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" className="w-full justify-between">
          {selected?.label || selected || placeholder || 'Select…'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput value={search} onChange={(e) => setSearch(e.target.value)} />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((o, i) => {
                const v = o.value ?? o;
                const label = o.label ?? o;
                return (
                  <CommandItem key={i} onSelect={() => onValueChange?.(v)}>
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Toast / Sonner ────────────────────────────────────────────────────────────
const __toastStore = { items: [], listeners: [] };
let __toastId = 0;
function __syncToasts() {
  __toastStore.listeners.forEach((fn) => fn([...__toastStore.items]));
}
function toast(message, options) {
  const id = ++__toastId;
  const item = { id, message, ...(options || {}) };
  __toastStore.items = [...__toastStore.items, item];
  __syncToasts();
  const dismiss = () => {
    __toastStore.items = __toastStore.items.filter((t) => t.id !== id);
    __syncToasts();
  };
  setTimeout(dismiss, options?.duration ?? 4000);
  return { id, dismiss };
}
function Sonner() { return <Toaster />; }

const ToastCtx = createContext({ toasts: [], dismiss: () => {} });
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const sync = (items) => setToasts(items);
    __toastStore.listeners.push(sync);
    return () => {
      __toastStore.listeners = __toastStore.listeners.filter((l) => l !== sync);
    };
  }, []);
  const dismiss = (id) => {
    __toastStore.items = __toastStore.items.filter((t) => t.id !== id);
    __syncToasts();
  };
  return <ToastCtx.Provider value={{ toasts, dismiss }}>{children}</ToastCtx.Provider>;
}
function useToast() {
  const ctx = useContext(ToastCtx);
  return { toast, toasts: ctx?.toasts || [], dismiss: ctx?.dismiss || (() => {}) };
}
function ToastViewport({ className, ...props }) {
  return <div className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]', className)} {...props} />;
}
function Toaster({ className, ...props }) {
  const { toasts, dismiss } = useToast();
  return (
    <ToastViewport className={className} {...props}>
      {toasts.map((t) => (
        <Toast key={t.id}>
          <div className="grid gap-1">
            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            <ToastDescription>{t.message || t.description}</ToastDescription>
          </div>
          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}
    </ToastViewport>
  );
}
function Toast({ className, ...props }) {
  return <div className={cn('pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border bg-background p-4 shadow-lg', className)} {...props} />;
}
function ToastTitle({ className, ...props }) {
  return <div className={cn('text-sm font-semibold', className)} {...props} />;
}
function ToastDescription({ className, ...props }) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />;
}
function ToastClose({ className, ...props }) {
  return <button type="button" className={cn('rounded-md p-1 text-muted-foreground hover:text-foreground', className)} {...props}>×</button>;
}
function ToastAction({ className, altText, children, ...props }) {
  return <Button size="sm" variant="outline" className={className} {...props}>{children}</Button>;
}

// ── Data display ──────────────────────────────────────────────────────────────
function TableFooter({ className, ...props }) {
  return <tfoot className={cn('border-t bg-muted/50 font-medium', className)} {...props} />;
}
function TableCaption({ className, ...props }) {
  return <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}

const CarouselCtx = createContext({ index: 0, setIndex: () => {}, count: 0 });
function Carousel({ className, children, ...props }) {
  const [index, setIndex] = useState(0);
  const count = React.Children.count(children);
  return (
    <CarouselCtx.Provider value={{ index, setIndex, count }}>
      <div className={cn('relative', className)} {...props}>{children}</div>
    </CarouselCtx.Provider>
  );
}
function CarouselContent({ className, children, ...props }) {
  const ctx = useContext(CarouselCtx);
  return (
    <div className={cn('overflow-hidden', className)} {...props}>
      <div className="flex transition-transform" style={{ transform: 'translateX(-' + ctx.index * 100 + '%)' }}>
        {React.Children.map(children, (child) => (
          <div className="min-w-full shrink-0">{child}</div>
        ))}
      </div>
    </div>
  );
}
function CarouselItem({ className, ...props }) {
  return <div className={cn('min-w-0 shrink-0 grow-0 basis-full', className)} {...props} />;
}
function CarouselPrevious({ className, ...props }) {
  const ctx = useContext(CarouselCtx);
  return (
    <Button variant="outline" size="icon" className={cn('absolute left-2 top-1/2 -translate-y-1/2', className)} onClick={() => ctx.setIndex(Math.max(0, ctx.index - 1))} {...props}>
      ‹
    </Button>
  );
}
function CarouselNext({ className, ...props }) {
  const ctx = useContext(CarouselCtx);
  return (
    <Button variant="outline" size="icon" className={cn('absolute right-2 top-1/2 -translate-y-1/2', className)} onClick={() => ctx.setIndex(Math.min(ctx.count - 1, ctx.index + 1))} {...props}>
      ›
    </Button>
  );
}
`.trim();
}

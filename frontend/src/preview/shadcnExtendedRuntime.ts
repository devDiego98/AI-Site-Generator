/** Additional ShadCN-style components for the preview iframe. */
export function getShadcnExtendedRuntimeScript(): string {
  return `
const DialogContext = createContext({ open: false, setOpen: () => {} });
function Dialog({ open, onOpenChange, children }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open !== undefined ? open : internal;
  const setOpen = (v) => {
    if (open === undefined) setInternal(v);
    onOpenChange?.(v);
  };
  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>;
}
function DialogTrigger({ asChild, children, ...props }) {
  const ctx = useContext(DialogContext);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: (e) => {
      child.props.onClick?.(e);
      ctx.setOpen(true);
    },
    ...props,
  });
}
function DialogContent({ className, children, ...props }) {
  const ctx = useContext(DialogContext);
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          'relative z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
function DialogHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props}>
      {children}
    </div>
  );
}
function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

const SheetContext = createContext({ open: false, setOpen: () => {} });
function Sheet({ open, onOpenChange, children }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open !== undefined ? open : internal;
  const setOpen = (v) => {
    if (open === undefined) setInternal(v);
    onOpenChange?.(v);
  };
  return <SheetContext.Provider value={{ open: isOpen, setOpen }}>{children}</SheetContext.Provider>;
}
function SheetTrigger({ children }) {
  const ctx = useContext(SheetContext);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: (e) => {
      child.props.onClick?.(e);
      ctx.setOpen(true);
    },
  });
}
function SheetContent({ className, children, side = 'right', ...props }) {
  const ctx = useContext(SheetContext);
  if (!ctx.open) return null;
  const sideClass =
    side === 'left'
      ? 'left-0 border-r'
      : side === 'bottom'
        ? 'bottom-0 left-0 right-0 border-t'
        : 'right-0 border-l';
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          'fixed z-50 flex h-full w-full max-w-sm flex-col gap-4 border bg-background p-6 shadow-lg animate-fade-in',
          sideClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
function SheetHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />;
}
function SheetTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}
function SheetDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

const AccordionContext = createContext({ type: 'single', open: null, setOpen: () => {} });
function Accordion({ type = 'single', defaultValue, children, className, ...props }) {
  const [open, setOpen] = useState(defaultValue || null);
  return (
    <AccordionContext.Provider value={{ type, open, setOpen }}>
      <div className={cn('space-y-2', className)} {...props}>{children}</div>
    </AccordionContext.Provider>
  );
}
function AccordionItem({ value, className, children, ...props }) {
  return (
    <div className={cn('rounded-lg border px-4', className)} data-value={value} {...props}>
      {children}
    </div>
  );
}
function AccordionTrigger({ className, children, ...props }) {
  const ctx = useContext(AccordionContext);
  const item = props.value;
  const isOpen = ctx.open === item;
  return (
    <button
      type="button"
      className={cn('flex w-full items-center justify-between py-4 text-left font-medium transition-all', className)}
      onClick={() => ctx.setOpen(isOpen ? null : item)}
      {...props}
    >
      {children}
      <span className="text-muted-foreground">{isOpen ? '−' : '+'}</span>
    </button>
  );
}
function AccordionContent({ className, children, value, ...props }) {
  const ctx = useContext(AccordionContext);
  if (ctx.open !== value) return null;
  return (
    <div className={cn('pb-4 text-sm text-muted-foreground', className)} {...props}>
      {children}
    </div>
  );
}

const CollapsibleContext = createContext({ open: false, setOpen: () => {} });
function Collapsible({ open, onOpenChange, children }) {
  const [internal, setInternal] = useState(false);
  const isOpen = open !== undefined ? open : internal;
  const setOpen = (v) => {
    if (open === undefined) setInternal(v);
    onOpenChange?.(v);
  };
  return <CollapsibleContext.Provider value={{ open: isOpen, setOpen }}>{children}</CollapsibleContext.Provider>;
}
function CollapsibleTrigger({ children, className, ...props }) {
  const ctx = useContext(CollapsibleContext);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: () => ctx.setOpen(!ctx.open),
    className: cn(child.props.className, className),
    ...props,
  });
}
function CollapsibleContent({ className, children, ...props }) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx.open) return null;
  return (
    <div className={cn('pt-2', className)} {...props}>
      {children}
    </div>
  );
}

function AspectRatio({ ratio = 16 / 9, className, children, ...props }) {
  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ paddingBottom: (1 / ratio) * 100 + '%' }} {...props}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

function Slider({ className, value = [50], onValueChange, max = 100, min = 0, step = 1, ...props }) {
  const v = Array.isArray(value) ? value[0] : value;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={cn('h-2 w-full cursor-pointer accent-primary', className)}
      {...props}
    />
  );
}

const RadioGroupContext = createContext({ value: '', onValueChange: () => {} });
function RadioGroup({ value, onValueChange, className, children, ...props }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('grid gap-2', className)} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
function RadioGroupItem({ value, className, children, ...props }) {
  const ctx = useContext(RadioGroupContext);
  const checked = ctx.value === value;
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 text-sm', className)}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={() => ctx.onValueChange?.(value)}
        className={cn(
          'h-4 w-4 rounded-full border border-primary',
          checked ? 'bg-primary ring-2 ring-primary ring-offset-2' : ''
        )}
        {...props}
      />
      {children}
    </label>
  );
}

function Breadcrumb({ className, ...props }) {
  return <nav className={cn('text-sm text-muted-foreground', className)} aria-label="Breadcrumb" {...props} />;
}
function BreadcrumbList({ className, ...props }) {
  return <ol className={cn('flex flex-wrap items-center gap-1.5', className)} {...props} />;
}
function BreadcrumbItem({ className, ...props }) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}
function BreadcrumbLink({ className, ...props }) {
  return <a className={cn('transition-colors hover:text-foreground', className)} {...props} />;
}
function BreadcrumbSeparator({ className, children = '/', ...props }) {
  return (
    <li role="presentation" className={cn('text-muted-foreground', className)} {...props}>
      {children}
    </li>
  );
}
function BreadcrumbPage({ className, ...props }) {
  return <span className={cn('font-normal text-foreground', className)} aria-current="page" {...props} />;
}

function Pagination({ className, ...props }) {
  return <nav className={cn('mx-auto flex w-full justify-center', className)} {...props} />;
}
function PaginationContent({ className, ...props }) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}
function PaginationItem({ className, ...props }) {
  return <li className={cn('', className)} {...props} />;
}
function PaginationLink({ className, isActive, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
        className
      )}
      {...props}
    />
  );
}
function PaginationPrevious({ className, ...props }) {
  return <PaginationLink className={cn('gap-1 px-2.5', className)} {...props}>Prev</PaginationLink>;
}
function PaginationNext({ className, ...props }) {
  return <PaginationLink className={cn('gap-1 px-2.5', className)} {...props}>Next</PaginationLink>;
}

const TooltipCtx = createContext({ delay: 0 });
function TooltipProvider({ children, delayDuration = 0 }) {
  return <TooltipCtx.Provider value={{ delay: delayDuration }}>{children}</TooltipCtx.Provider>;
}
function Tooltip({ children }) {
  return <>{children}</>;
}
function TooltipTrigger({ asChild, children }) {
  return <>{children}</>;
}
function TooltipContent({ className, children, ...props }) {
  return null;
}

const DropdownCtx = createContext({ open: false, setOpen: () => {} });
function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return <DropdownCtx.Provider value={{ open, setOpen }}>{children}</DropdownCtx.Provider>;
}
function DropdownMenuTrigger({ asChild, children }) {
  const ctx = useContext(DropdownCtx);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: (e) => {
      child.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  });
}
function DropdownMenuContent({ className, children, align = 'start', ...props }) {
  const ctx = useContext(DropdownCtx);
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
function DropdownMenuItem({ className, children, onSelect, ...props }) {
  const ctx = useContext(DropdownCtx);
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent',
        className
      )}
      onClick={() => {
        onSelect?.();
        ctx.setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

const HoverCardCtx = createContext({ open: false, setOpen: () => {} });
function HoverCard({ children }) {
  const [open, setOpen] = useState(false);
  return <HoverCardCtx.Provider value={{ open, setOpen }}>{children}</HoverCardCtx.Provider>;
}
function HoverCardTrigger({ children }) {
  const ctx = useContext(HoverCardCtx);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onMouseEnter: () => ctx.setOpen(true),
    onMouseLeave: () => ctx.setOpen(false),
  });
}
function HoverCardContent({ className, children, ...props }) {
  const ctx = useContext(HoverCardCtx);
  if (!ctx.open) return null;
  return (
    <div
      className={cn('z-50 mt-2 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md', className)}
      {...props}
    >
      {children}
    </div>
  );
}
`.trim();
}

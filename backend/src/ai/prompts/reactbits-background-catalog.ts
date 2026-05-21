/** Auto-generated from ReactBits .tsx sources — run: node scripts/generate-reactbits-ai.mjs */
export const REACTBITS_LIBRARY_CATALOG = `
=== REACTBITS LIBRARY (backgrounds — REQUIRED) ===
Animated page backgrounds from reactbits.dev. All components are pre-installed globals — use directly, NO imports, NO inlining, NO third-party background libs.

MANDATORY: Every UI MUST include at least one ReactBits background.
FORBIDDEN: ColorBends, GridPattern, DotPattern, Spotlight, BackgroundLayer, custom canvas/CSS backgrounds, import statements, PrismaticBurst, Ribbons (removed from library — never use).

=== BACKGROUND PROP RULES (strict) ===
Every ReactBits component ships with built-in default values for ALL props (speed, size, intensity, counts, etc.).
When writing JSX you MUST:
1. Use the bare component with NO props when defaults look fine, OR
2. Pass ONLY color-related props tuned to the user's brand/theme (hex arrays/strings, hue, saturation, gradient colors, lineColor, raysColor, etc.).
NEVER pass non-color props (speed, amplitude, density, mouseForce, resolution, bandHeight, counts, booleans, sizes, etc.) — those always use library defaults.
If a component has no color props, use <ComponentName /> with zero attributes.

=== BACKGROUND SELECTION (required — read the user prompt first) ===
Before writing code, infer the site's subject, industry, and mood from the user's prompt.
Pick exactly ONE ReactBits background that visually reinforces that theme — never a random default.

Selection process:
1. Read the user prompt for industry, product, audience, and emotional tone.
2. Choose the single best-matching component from the catalog (examples below).
3. Customize ONLY color props to match the brand palette when the prompt implies colors (e.g. cyan/green for telecom, warm gold for luxury).

Theme → background (use when the prompt fits):
- Fiber optic / telecom / networking / ISP / broadband / data cables / connectivity → Hyperspeed, LaserFlow
- AI / ML / futuristic tech / startups → Aurora, LiquidEther, LightRays, Prism
- SaaS / B2B software / dashboards / analytics → Hyperspeed, GridScan, DotGrid
- Finance / fintech / banking → Galaxy, Aurora, DarkVeil
- Wellness / spa / meditation / yoga → SoftAurora, FloatingLines, Grainient
- Creative agency / portfolio / design studio → Particles, Iridescence, LiquidEther, SplashCursor
- Gaming / entertainment → Hyperspeed, PixelSnow, Plasma
- Space / astronomy / science → Galaxy, Aurora, LightRays
- Cybersecurity / hacker / dark tech → DarkVeil, GridScan, Hyperspeed
- Events / conferences / meetups → Aurora, LightRays, LiquidEther
- Education / courses / learning → Aurora, FloatingLines
- Healthcare / medical → SoftAurora, FloatingLines (calm, trustworthy)
- Real estate / luxury / premium brands → LightPillar, Iridescence, Prism, Orb
- E-commerce / retail (playful) → SplashCursor, Particles, DotGrid
- Nature / eco / sustainability → Grainient, SoftAurora (green-tinted color props)
- Music / audio → Orb, PlasmaWave, Plasma, LightRays

Fallback by vibe (only when no clear industry match):
- Hero / landing / premium → LiquidEther, Aurora, LightRays, LightPillar
- Tech / SaaS / dashboard → Hyperspeed, GridScan, LaserFlow
- Calm / wellness → SoftAurora, FloatingLines, Grainient
- Playful / creative → Particles, SplashCursor, PlasmaWave, DotGrid
- Dark / moody → DarkVeil, Galaxy, Plasma
- Interactive → LiquidEther, DotGrid, SplashCursor

Built-in defaults per component (from component source — do not repeat non-color props in JSX):
- Aurora: defaults { colorStops=["#5227FF", "#7cff67", "#5227FF"], amplitude=1.0, blend=0.5 } | color props only: colorStops
- SoftAurora: defaults { speed=0.6, scale=1.5, brightness=1.0, color1='#f7f7f7', color2='#e100ff', noiseFrequency=2.5, noiseAmplitude=1.0, bandHeight=0.5, bandSpread=1.0, octaveDecay=0.1, layerOffset=0, colorSpeed=1.0, enableMouseInteraction=true, mouseInfluence=0.25 } | color props only: color1, color2
- Iridescence: defaults { color=[1, 1, 1], speed=1.0, amplitude=0.1, mouseReact=true } | color props only: color
- Threads: defaults { color=[1, 1, 1], amplitude=1, distance=0, enableMouseInteraction=false } | color props only: color
- Particles: defaults { particleCount=200, particleSpread=10, speed=0.1, moveParticlesOnHover=false, particleHoverFactor=1, alphaParticles=false, particleBaseSize=100, sizeRandomness=1, cameraDistance=20, disableRotation=false, pixelRatio=1 } | color props only: (none — use bare tag)
- Orb: defaults { hue=0, hoverIntensity=0.2, rotateOnHover=true, forceHoverState=false, backgroundColor='#000000' } | color props only: hue, backgroundColor
- Hyperspeed: defaults { (built-in defaults — no props listed) } | color props only: (none — use bare tag)
- GridScan: defaults { enableWebcam=false, showPreview=false, modelsPath='https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights', sensitivity=0.55, lineThickness=1, linesColor='#2F293A', scanColor='#FF9FFC', scanOpacity=0.4, gridScale=0.1, lineStyle='solid', lineJitter=0.1, scanDirection='pingpong', enablePost=true, bloomIntensity=0, bloomThreshold=0, bloomSmoothing=0, chromaticAberration=0.002, noiseIntensity=0.01, scanGlow=0.5, scanSoftness=2, scanPhaseTaper=0.9, scanDuration=2.0, scanDelay=2.0, enableGyro=false, scanOnClick=false, snapBackDelay=250 } | color props only: linesColor, scanColor
- DotGrid: defaults { dotSize=16, gap=32, baseColor='#5227FF', activeColor='#5227FF', proximity=150, speedTrigger=100, shockRadius=250, shockStrength=5, maxSpeed=5000, resistance=750, returnDuration=1.5, className='' } | color props only: baseColor, activeColor
- Grainient: defaults { timeSpeed=0.25, colorBalance=0.0, warpStrength=1.0, warpFrequency=5.0, warpSpeed=2.0, warpAmplitude=50.0, blendAngle=0.0, blendSoftness=0.05, rotationAmount=500.0, noiseScale=2.0, grainAmount=0.1, grainScale=2.0, grainAnimated=false, contrast=1.5, gamma=1.0, saturation=1.0, centerX=0.0, centerY=0.0, zoom=0.9, color1='#FF9FFC', color2='#5227FF', color3='#B497CF', className='' } | color props only: saturation, color1, color2, color3
- LiquidEther: defaults { mouseForce=20, cursorSize=100, isViscous=false, viscous=30, iterationsViscous=32, iterationsPoisson=32, dt=0.014, BFECC=true, resolution=0.5, isBounce=false, colors=['#5227FF', '#FF9FFC', '#B497CF'], style={}, className='', autoDemo=true, autoSpeed=0.5, autoIntensity=2.2, takeoverDuration=0.25, autoResumeDelay=1000, autoRampDuration=0.6 } | color props only: colors
- Plasma: defaults { color='#ffffff', speed=1, direction='forward', scale=1, opacity=1, mouseInteractive=true } | color props only: color
- PlasmaWave: defaults { xOffset=0, yOffset=0, rotationDeg=0, focalLength=0.8, speed1=0.05, speed2=0.05, dir2=1.0, bend1=1, bend2=0.5, colors=['#A855F7', '#06B6D4'] } | color props only: colors
- Prism: defaults { height=3.5, baseWidth=5.5, animationType='rotate', glow=1, offset={ x: 0, y: 0 }, noise=0.5, transparent=true, scale=3.6, hueShift=0, colorFrequency=1, hoverStrength=2, inertia=0.05, bloom=1, suspendWhenOffscreen=false, timeScale=0.5 } | color props only: hueShift
- Galaxy: defaults { focal=[0.5, 0.5], rotation=[1.0, 0.0], starSpeed=0.5, density=1, hueShift=140, disableAnimation=false, speed=1.0, mouseInteraction=true, glowIntensity=0.3, saturation=0.0, mouseRepulsion=true, repulsionStrength=2, twinkleIntensity=0.3, rotationSpeed=0.1, autoCenterRepulsion=0, transparent=true } | color props only: hueShift, saturation
- PixelSnow: defaults { color='#ffffff', flakeSize=0.01, minFlakeSize=1.25, pixelResolution=200, speed=1.25, depthFade=8, farPlane=20, brightness=1, gamma=0.4545, density=0.3, variant='square', direction=125, className='', style={} } | color props only: color
- DarkVeil: defaults { hueShift=0, noiseIntensity=0, scanlineIntensity=0, speed=0.5, scanlineFrequency=0, warpAmount=0, resolutionScale=1 }: Props) { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = ref.current as HTMLCanvasElement; const parent = canvas.parentElement as HTMLElement; const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), canvas }); const gl = renderer.gl; const geometry = new Triangle(gl); const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 }, uResolution: { value: new Vec2() }, uHueShift: { value: hueShift }, uNoise: { value: noiseIntensity }, uScan: { value: scanlineIntensity }, uScanFreq: { value: scanlineFrequency }, uWarp: { value: warpAmount } } }); const mesh = new Mesh(gl, { geometry, program }); const resize = () => { const w = parent.clientWidth, h = parent.clientHeight; renderer.setSize(w * resolutionScale, h * resolutionScale); program.uniforms.uResolution.value.set(w, h); }; window.addEventListener('resize', resize); resize(); const start = performance.now(); let frame = 0; const loop = () => { program.uniforms.uTime.value = ((performance.now() - start) / 1000) * speed; program.uniforms.uHueShift.value = hueShift; program.uniforms.uNoise.value = noiseIntensity; program.uniforms.uScan.value = scanlineIntensity; program.uniforms.uScanFreq.value = scanlineFrequency; program.uniforms.uWarp.value = warpAmount; renderer.render({ scene: mesh }); frame = requestAnimationFrame(loop); }; loop(); return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); }; } } | color props only: hueShift
- FloatingLines: defaults { enabledWaves=['top', 'middle', 'bottom'], lineCount=[6], lineDistance=[5], bottomWavePosition={ x: 2.0, y: -0.7, rotate: -1 }, animationSpeed=1, interactive=true, bendRadius=5.0, bendStrength=-0.5, mouseDamping=0.05, parallax=true, parallaxStrength=0.2, mixBlendMode='screen' } | color props only: (none — use bare tag)
- LaserFlow: defaults { wispDensity=1, mouseSmoothTime=0.0, mouseTiltStrength=0.01, horizontalBeamOffset=0.1, verticalBeamOffset=0.0, flowSpeed=0.35, verticalSizing=2.0, horizontalSizing=0.5, fogIntensity=0.45, fogScale=0.3, wispSpeed=15.0, wispIntensity=5.0, flowStrength=0.25, decay=1.1, falloffStart=1.2, fogFallSpeed=0.6, color='#FF79C6' } | color props only: color
- LightRays: defaults { raysOrigin='top-center', raysColor='#ffffff', raysSpeed=1, lightSpread=1, rayLength=2, pulsating=false, fadeDistance=1.0, saturation=1.0, followMouse=true, mouseInfluence=0.1, noiseAmount=0.0, distortion=0.0, className='' } | color props only: raysColor, saturation
- LightPillar: defaults { topColor='#5227FF', bottomColor='#FF9FFC', intensity=1.0, rotationSpeed=0.3, interactive=false, className='', glowAmount=0.005, pillarWidth=3.0, pillarHeight=0.4, noiseIntensity=0.5, mixBlendMode='screen', pillarRotation=0, quality='high' } | color props only: topColor, bottomColor
- SplashCursor: defaults { SIM_RESOLUTION=128, DYE_RESOLUTION=1440, CAPTURE_RESOLUTION=512, DENSITY_DISSIPATION=3.5, VELOCITY_DISSIPATION=2, PRESSURE=0.1, PRESSURE_ITERATIONS=20, CURL=3, SPLAT_RADIUS=0.2, SPLAT_FORCE=6000, SHADING=true, COLOR_UPDATE_SPEED=10, BACK_COLOR={ r: 0.5, g: 0, b: 0 }, TRANSPARENT=true, RAINBOW_MODE=true, COLOR='#ff0000' } | color props only: COLOR

Per-component usage (color props only when customizing palette):
- Aurora: container .aurora-container — <Aurora colorStops={["#5227FF", "#7cff67", "#5227FF"]} />
- SoftAurora: container .soft-aurora-container — <SoftAurora color1={'#f7f7f7'} color2={'#e100ff'} />
- Iridescence: container .iridescence-container — <Iridescence color={[1, 1, 1]} />
- Threads: container .threads-container — <Threads color={[1, 1, 1]} />
- Particles: container .particles-container — <Particles />
- Orb: container .orb-container — <Orb hue={0} backgroundColor={'#000000'} />
- Hyperspeed: container .hyperspeed-container — <Hyperspeed />
- GridScan: container .grid-scan-container — <GridScan linesColor={'#2F293A'} scanColor={'#FF9FFC'} />
- DotGrid: container .dot-grid-container — <DotGrid baseColor={'#5227FF'} activeColor={'#5227FF'} />
- Grainient: container .grainient-container — <Grainient saturation={1.0} color1={'#FF9FFC'} color2={'#5227FF'} color3={'#B497CF'} />
- LiquidEther: container .liquid-ether-container — <LiquidEther colors={['#5227FF', '#FF9FFC', '#B497CF']} />
- Plasma: container .plasma-container — <Plasma color={'#ffffff'} />
- PlasmaWave: container .plasma-wave-container — <PlasmaWave colors={['#A855F7', '#06B6D4']} />
- Prism: container .prism-container — <Prism hueShift={0} />
- Galaxy: container .galaxy-container — <Galaxy hueShift={140} saturation={0.0} />
- PixelSnow: container .pixel-snow-container — <PixelSnow color={'#ffffff'} />
- DarkVeil: container .dark-veil-container — <DarkVeil hueShift={0} />
- FloatingLines: container .floating-lines-container — <FloatingLines />
- LaserFlow: container .laser-flow-container — <LaserFlow color={'#FF79C6'} />
- LightRays: container .light-rays-container — <LightRays raysColor={'#ffffff'} saturation={1.0} />
- LightPillar: container .light-pillar-container — <LightPillar topColor={'#5227FF'} bottomColor={'#FF9FFC'} />
- SplashCursor: container .splash-cursor-container — <SplashCursor COLOR={'#ff0000'} />

=== THEME-SPECIFIC BACKGROUND PICKS (use with visual mode from GENERATION BRIEF) ===
Dark pages ONLY: Aurora, LiquidEther, LightRays, Hyperspeed, DarkVeil, Galaxy, Particles, GridScan
Light pages ONLY: SoftAurora, FloatingLines, Grainient, Threads, DotGrid, Iridescence, LightPillar
Never cross lists. Hero/full-page: pick one; tune color props only.

=== PAGE SHELL (pick light OR dark from prompt — not always dark) ===
Place the background ONCE outside page routing — same background for all pages.

Light shell example:
<div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
  <div className="reactbits-bg absolute inset-0 z-0"><SoftAurora color1={'#e0f2fe'} color2={'#a5f3fc'} /></div>
  <main className="relative z-10">{/* nav + sections */}</main>
</div>

Dark shell example:
<div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
  <div className="reactbits-bg absolute inset-0 z-0"><LiquidEther colors={["#0ea5e9","#6366f1"]} /></div>
  <main className="relative z-10">{/* nav + sections */}</main>
</div>

Rules for reactbits-bg wrapper:
- className="reactbits-bg absolute inset-0 z-0" — fills viewport behind content
- Put exactly ONE background component inside
- Foreground MUST use relative z-10 (or higher)
- Light mode: page bg-white/slate-50, cards bg-white border shadow; tune background color props for light surfaces
- Dark mode: page bg-slate-950/#020617, glass cards bg-white/5 backdrop-blur border-white/10
- Match shell to GENERATION BRIEF visual mode — wellness/education/healthcare often light; gaming/cyber often dark
- SoftAurora bandHeight is internal — never pass bandHeight in generated JSX
`.trim();

/** @deprecated Use REACTBITS_LIBRARY_CATALOG */
export const REACTBITS_BACKGROUND_CATALOG = REACTBITS_LIBRARY_CATALOG;

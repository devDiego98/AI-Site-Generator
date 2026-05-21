import { useEffect, useState } from 'react'
import { Text } from '@/atoms/Text'
import styles from './GeneratingPreviewSkeleton.module.css'

const STATUS_MESSAGES = [
  'Applying background…',
  'Adjusting layout…',
  'Composing components…',
  'Styling elements…',
  'Building sections…',
  'Polishing details…',
] as const

const LAYOUT_COUNT = 4
const LAYOUT_INTERVAL_MS = 2800
const MESSAGE_INTERVAL_MS = 2200

function SkeletonBone({ className = '' }: { className?: string }) {
  return <div className={`${styles.bone} ${className}`} aria-hidden />
}

function HeroLayout() {
  return (
    <div className={styles.layout}>
      <SkeletonBone className={styles.nav} />
      <SkeletonBone className={styles.hero} />
      <div className={styles.row3}>
        <SkeletonBone className={styles.card} />
        <SkeletonBone className={styles.card} />
        <SkeletonBone className={styles.card} />
      </div>
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className={`${styles.layout} ${styles.layoutDashboard}`}>
      <SkeletonBone className={styles.sidebar} />
      <div className={styles.main}>
        <SkeletonBone className={styles.statRow} />
        <SkeletonBone className={styles.chart} />
        <div className={styles.list}>
          <SkeletonBone className={styles.listItem} />
          <SkeletonBone className={styles.listItem} />
          <SkeletonBone className={styles.listItem} />
        </div>
      </div>
    </div>
  )
}

function SplitLayout() {
  return (
    <div className={styles.layout}>
      <SkeletonBone className={styles.nav} />
      <div className={styles.split}>
        <div className={styles.splitLeft}>
          <SkeletonBone className={styles.titleBlock} />
          <SkeletonBone className={styles.line} />
          <SkeletonBone className={styles.line} />
          <SkeletonBone className={styles.lineShort} />
          <SkeletonBone className={styles.cta} />
        </div>
        <SkeletonBone className={styles.splitRight} />
      </div>
    </div>
  )
}

function GalleryLayout() {
  return (
    <div className={styles.layout}>
      <SkeletonBone className={styles.nav} />
      <SkeletonBone className={styles.sectionTitle} />
      <div className={styles.grid}>
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonBone key={i} className={styles.tile} />
        ))}
      </div>
    </div>
  )
}

const LAYOUTS = [HeroLayout, DashboardLayout, SplitLayout, GalleryLayout] as const

export function GeneratingPreviewSkeleton() {
  const [layoutIndex, setLayoutIndex] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLayoutIndex((i) => (i + 1) % LAYOUT_COUNT)
    }, LAYOUT_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length)
    }, MESSAGE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const Layout = LAYOUTS[layoutIndex]

  return (
    <div
      className={styles.root}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Generating interface"
    >
      <div className={styles.stage}>
        <div key={layoutIndex} className={styles.layoutFrame}>
          <Layout />
        </div>
      </div>
      <Text variant="body" color="muted" className={styles.status} key={messageIndex}>
        {STATUS_MESSAGES[messageIndex]}
      </Text>
    </div>
  )
}

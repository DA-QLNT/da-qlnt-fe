import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import React from 'react'

const DashboardContent = () => {
  return (
    <>
      <SectionCards/>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive/>
      </div>
    </>
  )
}

export default DashboardContent
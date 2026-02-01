import * as React from 'react'
import { getRoadmapMetadata } from '../../../../../roadmap/roadmap'
import { formatDate } from '../model/constants'

export function RoadmapHeader() {
  const { projectName, projectSummary, lastUpdated } = getRoadmapMetadata()

  return (
    <header className="space-y-2 border-b pb-6">
      <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
      {projectSummary && (
        <p className="text-lg text-muted-foreground">{projectSummary}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Last updated: {formatDate(lastUpdated)}
      </p>
    </header>
  )
}

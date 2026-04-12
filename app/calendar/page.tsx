'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import type { Job, JobStatus } from '@/lib/supabase'

const statusColors: Record<JobStatus, { color: string; bg: string }> = {
  enquiry:     { color: '#D97706', bg: '#FFFBEB' },
  quoted:      { color: '#7C3AED', bg: '#F5F3FF' },
  scheduled:   { color: '#1D4ED8', bg: '#EFF6FF' },
  in_progress: { color: '#000000', bg: '#F0F0F0' },
  completed:   { color: '#059669', bg: '#ECFDF5' },
  invoiced:    { color: '#0369A1', bg: '#E0F2FE' },
  paid:        { color: '#059669', bg: '#D1FAE5' },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    const m = String(month + 1).padStart(2, '0')
    fetch(`/api/jobs?month=${m}&year=${year}`)
      .then(r => r.json())
      .then(d => setJobs(d.jobs || []))
      .finally(() => setLoading(false))
  }, [month, year])

  // Calendar grid computation
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday start
    const totalDays = lastDay.getDate()
    const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7

    return Array.from({ length: totalCells }, (_, i) => {
      const dayNum = i - startOffset + 1
      const isCurrentMonth = dayNum >= 1 && dayNum <= totalDays
      const dateStr = isCurrentMonth
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
        : null
      const dayJobs = dateStr ? jobs.filter(j => j.scheduled_date === dateStr) : []
      const isToday = dateStr === new Date().toISOString().split('T')[0]

      return { dayNum, isCurrentMonth, dateStr, dayJobs, isToday }
    })
  }, [year, month, jobs])

  const goToday = () => setCurrentDate(new Date())
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectedDayJobs = selectedDay ? jobs.filter(j => j.scheduled_date === selectedDay) : []

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFFFF' }}>
      <Sidebar active="calendar" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-widest mb-1" style={{ color: '#999' }}>CYTRON / CALENDAR</p>
            <h1 className="text-2xl font-bold" style={{ color: '#000' }}>Job Calendar</h1>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
              style={{ border: '1px solid #E5E5E5' }}
            >
              ‹
            </button>
            <h2 className="text-lg font-semibold min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
              style={{ border: '1px solid #E5E5E5' }}
            >
              ›
            </button>
          </div>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium rounded-lg"
            style={{ border: '1px solid #E5E5E5', color: '#666' }}
          >
            Today
          </button>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          {/* Weekday header */}
          <div className="grid grid-cols-7" style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium py-2.5" style={{ color: '#999' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {grid.map((cell, i) => (
              <div
                key={i}
                onClick={() => cell.dateStr && setSelectedDay(cell.dateStr === selectedDay ? null : cell.dateStr)}
                className="min-h-[80px] md:min-h-[100px] p-1.5 cursor-pointer transition-colors"
                style={{
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0F0F0' : 'none',
                  borderBottom: i < grid.length - 7 ? '1px solid #F0F0F0' : 'none',
                  background: cell.isToday ? '#FFFBEB' : selectedDay === cell.dateStr ? '#F5F3FF' : '#FFF',
                  opacity: cell.isCurrentMonth ? 1 : 0.3,
                }}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${cell.isToday ? 'w-5 h-5 flex items-center justify-center rounded-full text-white' : ''}`}
                    style={{
                      color: cell.isToday ? '#FFF' : '#333',
                      background: cell.isToday ? '#D97706' : 'transparent',
                    }}
                  >
                    {cell.isCurrentMonth ? cell.dayNum : ''}
                  </span>
                  {cell.dayJobs.length > 0 && (
                    <span className="text-[9px] font-medium px-1 rounded-full" style={{ background: '#F0F0F0', color: '#666' }}>
                      {cell.dayJobs.length}
                    </span>
                  )}
                </div>

                {/* Job pills (max 3) */}
                <div className="space-y-0.5">
                  {cell.dayJobs.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded truncate"
                      style={{
                        background: statusColors[job.status]?.bg || '#F5F5F5',
                        color: statusColors[job.status]?.color || '#666',
                      }}
                      title={`${job.job_number} — ${job.title}`}
                    >
                      {job.title}
                    </div>
                  ))}
                  {cell.dayJobs.length > 3 && (
                    <div className="text-[8px] text-center" style={{ color: '#999' }}>
                      +{cell.dayJobs.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day panel */}
        {selectedDay && (
          <div className="mt-4 p-4 rounded-xl" style={{ border: '1px solid #E5E5E5', background: '#FAFAFA' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#000' }}>
              Jobs on {selectedDay}
            </h3>
            {selectedDayJobs.length === 0 ? (
              <p className="text-sm" style={{ color: '#999' }}>No jobs scheduled for this day</p>
            ) : (
              <div className="space-y-2">
                {selectedDayJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-white" style={{ border: '1px solid #E5E5E5' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#666' }}>
                        {job.job_number}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#000' }}>{job.title}</p>
                        <p className="text-xs" style={{ color: '#999' }}>
                          {job.client_name && `${job.client_name} • `}
                          {job.scheduled_time_start && `${job.scheduled_time_start}`}
                          {job.scheduled_time_end && ` - ${job.scheduled_time_end}`}
                          {job.assigned_to && ` • ${job.assigned_to}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: statusColors[job.status]?.bg, color: statusColors[job.status]?.color }}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

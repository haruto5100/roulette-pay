import { EventGroup } from '@/types'

const STORAGE_KEY = 'roulette-pay-data'

export function loadEvents(): EventGroup[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
            localStorage.removeItem(STORAGE_KEY)
            return []
        }
        return parsed
    } catch {
        localStorage.removeItem(STORAGE_KEY)
        return []
    }
}

export function saveEvents(events: EventGroup[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export function getEvent(id: string): EventGroup | undefined {
    const events = loadEvents()
    return events.find((e) => e.id === id)
}

export function updateEvent(updated: EventGroup): void {
    const events = loadEvents()
    const idx = events.findIndex((e) => e.id === updated.id)
    if (idx >= 0) {
        events[idx] = updated
    } else {
        events.push(updated)
    }
    saveEvents(events)
}

export function deleteEvent(id: string): void {
    const events = loadEvents().filter((e) => e.id !== id)
    saveEvents(events)
}

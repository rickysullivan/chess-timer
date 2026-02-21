import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, STORAGE_KEYS, type TimeControl } from '@/app/types'
import { useAppStore } from '@/app/store'

const TEST_CONTROL: TimeControl = {
  label: '1+2',
  baseMinutes: 1,
  incrementSeconds: 2,
  delaySeconds: 3,
  source: 'custom',
}

function resetStore() {
  useAppStore.setState({
    phase: 'setup',
    controlSource: 'preset',
    selectedPreset: '1+0',
    customBaseMinutes: '',
    customIncrementSeconds: '0',
    customDelaySeconds: '0',
    touched: { base: false, increment: false, delay: false },
    attemptedStart: false,
    startedControl: null,
    activeSide: 'White',
    remainingMs: { White: 0, Black: 0 },
    activeDelayRemainingMs: 0,
    isPaused: false,
    timeoutSide: null,
    undoHistory: [],
    settings: { ...DEFAULT_SETTINGS },
    onboardingSeen: false,
  })
}

describe('app store gameplay timing', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
  })

  it('applies increment to side that just moved and sets next-turn delay', () => {
    const store = useAppStore.getState()
    store.startGame(TEST_CONTROL)

    useAppStore.setState({
      remainingMs: { White: 45_000, Black: 50_000 },
      activeDelayRemainingMs: 0,
      activeSide: 'White',
    })

    const switched = useAppStore.getState().passTurn()
    const after = useAppStore.getState()

    expect(switched).toEqual({ fromSide: 'White', toSide: 'Black' })
    expect(after.activeSide).toBe('Black')
    expect(after.remainingMs.White).toBe(47_000)
    expect(after.remainingMs.Black).toBe(50_000)
    expect(after.activeDelayRemainingMs).toBe(3_000)
    expect(after.undoHistory.length).toBe(1)
  })

  it('consumes delay before decrementing active clock', () => {
    useAppStore.getState().startGame(TEST_CONTROL)

    useAppStore.getState().tickActiveClock(1_000)
    let state = useAppStore.getState()

    expect(state.activeDelayRemainingMs).toBe(2_000)
    expect(state.remainingMs.White).toBe(60_000)

    useAppStore.getState().tickActiveClock(2_500)
    state = useAppStore.getState()

    expect(state.activeDelayRemainingMs).toBe(0)
    expect(state.remainingMs.White).toBe(59_500)
  })

  it('undo restores previous snapshot', () => {
    const store = useAppStore.getState()
    store.startGame(TEST_CONTROL)
    useAppStore.setState({ remainingMs: { White: 30_000, Black: 55_000 }, activeDelayRemainingMs: 0 })

    useAppStore.getState().passTurn()
    const undone = useAppStore.getState().undoTurn()
    const after = useAppStore.getState()

    expect(undone).toBe(true)
    expect(after.activeSide).toBe('White')
    expect(after.remainingMs).toEqual({ White: 30_000, Black: 55_000 })
    expect(after.activeDelayRemainingMs).toBe(0)
  })

  it('times out active side and pauses', () => {
    const store = useAppStore.getState()
    store.startGame(TEST_CONTROL)
    useAppStore.setState({ remainingMs: { White: 300, Black: 10_000 }, activeDelayRemainingMs: 0 })

    useAppStore.getState().tickActiveClock(500)
    const after = useAppStore.getState()

    expect(after.remainingMs.White).toBe(0)
    expect(after.timeoutSide).toBe('White')
    expect(after.isPaused).toBe(true)
  })

  it('reset restores base timers and clears undo history', () => {
    const store = useAppStore.getState()
    store.startGame(TEST_CONTROL)
    useAppStore.setState({
      activeSide: 'Black',
      remainingMs: { White: 10_000, Black: 5_000 },
      undoHistory: [
        {
          activeSide: 'White',
          remainingMs: { White: 10_000, Black: 5_000 },
          activeDelayRemainingMs: 0,
          isPaused: false,
          timeoutSide: null,
        },
      ],
    })

    useAppStore.getState().resetGame()
    const after = useAppStore.getState()

    expect(after.activeSide).toBe('White')
    expect(after.remainingMs).toEqual({ White: 60_000, Black: 60_000 })
    expect(after.undoHistory).toHaveLength(0)
    expect(after.timeoutSide).toBeNull()
  })
})

describe('persisted game-state restore', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
  })

  it('restores fresh game state within ttl', () => {
    const now = Date.now()
    localStorage.setItem(
      STORAGE_KEYS.gameState,
      JSON.stringify({
        phase: 'started',
        activeSide: 'Black',
        remainingMs: { White: 20_000, Black: 30_000 },
        isPaused: true,
        timeoutSide: null,
        activeDelayRemainingMs: 1_000,
        startedControl: TEST_CONTROL,
        layoutMode: 'classic',
        last_updated: now,
      }),
    )

    const outcome = useAppStore.getState().restorePersistedGameState()
    const state = useAppStore.getState()

    expect(outcome).toBe('restored')
    expect(state.phase).toBe('started')
    expect(state.activeSide).toBe('Black')
    expect(state.remainingMs).toEqual({ White: 20_000, Black: 30_000 })
    expect(state.settings.layoutMode).toBe('classic')
  })

  it('expires stale game state beyond ttl', () => {
    const stale = Date.now() - 31 * 60 * 1000
    localStorage.setItem(
      STORAGE_KEYS.gameState,
      JSON.stringify({
        phase: 'started',
        activeSide: 'White',
        remainingMs: { White: 10_000, Black: 10_000 },
        isPaused: false,
        timeoutSide: null,
        activeDelayRemainingMs: 0,
        startedControl: TEST_CONTROL,
        layoutMode: 'adaptive',
        last_updated: stale,
      }),
    )

    const outcome = useAppStore.getState().restorePersistedGameState()

    expect(outcome).toBe('expired')
    expect(localStorage.getItem(STORAGE_KEYS.gameState)).toBeNull()
  })
})

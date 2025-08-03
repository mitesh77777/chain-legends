import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Database types
export interface DatabasePlayer {
  id: string
  wallet_address: string
  username?: string
  fighter_nft_id?: string
  total_wins: number
  total_losses: number
  ranking: number
  last_active: string
  created_at: string
}

export interface DatabaseBattleRoom {
  id: string
  player1_id?: string
  player2_id?: string
  status: 'waiting' | 'active' | 'completed'
  winner_id?: string
  battle_data?: Record<string, unknown>
  created_at: string
  completed_at?: string
}

export interface DatabaseTournament {
  id: string
  name: string
  prize_pool: string
  status: 'upcoming' | 'active' | 'completed'
  max_participants: number
  entry_fee: string
  start_time: string
  bracket_data?: Record<string, unknown>
  created_at: string
}

// Helper functions for database operations
export const dbOperations = {
  // Player operations
  async createPlayer(walletAddress: string, username?: string) {
    const { data, error } = await supabase
      .from('players')
      .insert({
        wallet_address: walletAddress,
        username,
        total_wins: 0,
        total_losses: 0,
        ranking: 1000,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getPlayer(walletAddress: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updatePlayerStats(playerId: string, won: boolean) {
    const updates = won 
      ? { total_wins: supabase.raw('total_wins + 1') }
      : { total_losses: supabase.raw('total_losses + 1') }

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Battle room operations
  async createBattleRoom(player1Id: string) {
    const { data, error } = await supabase
      .from('battle_rooms')
      .insert({
        player1_id: player1Id,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async joinBattleRoom(roomId: string, player2Id: string) {
    const { data, error } = await supabase
      .from('battle_rooms')
      .update({
        player2_id: player2Id,
        status: 'active',
      })
      .eq('id', roomId)
      .eq('status', 'waiting')
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBattleRoom(roomId: string, updates: Partial<DatabaseBattleRoom>) {
    const { data, error } = await supabase
      .from('battle_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findWaitingRoom() {
    const { data, error } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('status', 'waiting')
      .is('player2_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Leaderboard
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_wins', { ascending: false })
      .order('total_losses', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Tournament operations
  async createTournament(tournament: Omit<DatabaseTournament, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTournaments(status?: string) {
    let query = supabase.from('tournaments').select('*')
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('start_time', { ascending: false })

    if (error) throw error
    return data
  },
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToBattleRoom(roomId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`battle_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_rooms',
          filter: `id=eq.${roomId}`,
        },
        callback
      )
      .subscribe()
  },

  subscribeToMatchmaking(callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel('matchmaking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_rooms',
        },
        callback
      )
      .subscribe()
  },

  subscribeToTournament(tournamentId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`tournament_${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        callback
      )
      .subscribe()
  },
}
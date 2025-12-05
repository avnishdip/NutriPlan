'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Plus, Loader2 } from 'lucide-react'
import { logWeight } from '@/actions/weight-logs'

interface WeightLogFormProps {
  currentWeight: number
}

export function WeightLogForm({ currentWeight }: WeightLogFormProps) {
  const router = useRouter()
  const [weight, setWeight] = useState(currentWeight.toString())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return

    setLoading(true)
    setSuccess(false)

    try {
      const result = await logWeight(parseFloat(weight), notes || undefined)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setNotes('')
      router.refresh()

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to log weight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-gray-900">Log Today&apos;s Weight</h2>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              min="20"
              max="300"
              required
              className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-medium"
              placeholder="Weight"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
        </div>
        
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
          placeholder="Notes (optional)"
        />

        <button
          type="submit"
          disabled={loading || !weight}
          className={`px-6 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            success 
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            '✓ Saved'
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Log
            </>
          )}
        </button>
      </div>
    </form>
  )
}



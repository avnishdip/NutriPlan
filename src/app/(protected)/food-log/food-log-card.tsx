'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Flame, Clock } from 'lucide-react'
import { deleteFoodLog } from '@/actions/food-logs'
import { formatDate } from '@/lib/utils'

const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
  snack: { label: 'Snack', emoji: '🍎' },
}

interface FoodLogCardProps {
  log: {
    id: string
    meal_type: string
    food_name: string
    description: string | null
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fat_g: number | null
    photo_url: string | null
    notes: string | null
    logged_at: string
  }
  showDate?: boolean
}

export function FoodLogCard({ log, showDate }: FoodLogCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  
  const mealInfo = mealTypeLabels[log.meal_type] || { label: log.meal_type, emoji: '🍽️' }
  const time = new Date(log.logged_at).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })

  const handleDelete = async () => {
    if (!confirm('Delete this food log?')) return
    
    setDeleting(true)
    const result = await deleteFoodLog(log.id)
    if (result.success) {
      router.refresh()
    } else {
      alert('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Photo */}
      {log.photo_url && (
        <div className="h-40 w-full">
          <img 
            src={log.photo_url} 
            alt={log.food_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{mealInfo.emoji}</span>
              <span>{mealInfo.label}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{showDate ? formatDate(log.logged_at) : time}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{log.food_name}</h3>
            {log.description && (
              <p className="text-sm text-gray-500">{log.description}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Nutrition */}
        {(log.calories || log.protein_g || log.carbs_g || log.fat_g) && (
          <div className="flex items-center gap-4 text-sm">
            {log.calories && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4" />
                <span>{log.calories} kcal</span>
              </div>
            )}
            {log.protein_g && (
              <span className="text-blue-600">{log.protein_g}g protein</span>
            )}
            {log.carbs_g && (
              <span className="text-amber-600">{log.carbs_g}g carbs</span>
            )}
            {log.fat_g && (
              <span className="text-purple-600">{log.fat_g}g fat</span>
            )}
          </div>
        )}

        {/* Notes */}
        {log.notes && (
          <p className="mt-2 text-sm text-gray-500 italic">&quot;{log.notes}&quot;</p>
        )}
      </div>
    </div>
  )
}



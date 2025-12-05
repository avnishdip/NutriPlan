'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ShoppingListItemProps {
  item: {
    id: string
    ingredient_name: string
    quantity: number
    unit: string
    estimated_cost: number | null
    is_purchased: boolean
  }
}

export function ShoppingListItem({ item }: ShoppingListItemProps) {
  const [isPurchased, setIsPurchased] = useState(item.is_purchased)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ 
        is_purchased: !isPurchased,
        purchased_at: !isPurchased ? new Date().toISOString() : null
      })
      .eq('id', item.id)

    if (!error) {
      setIsPurchased(!isPurchased)
    }
    setLoading(false)
  }

  return (
    <div 
      className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        isPurchased ? 'bg-gray-50' : ''
      }`}
      onClick={handleToggle}
    >
      <button
        disabled={loading}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          isPurchased
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-500'
        }`}
      >
        {isPurchased && <Check className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 ${isPurchased ? 'line-through opacity-60' : ''}`}>
          {item.ingredient_name}
        </p>
        <p className="text-sm text-gray-500">
          {item.quantity} {item.unit}
        </p>
      </div>

      {item.estimated_cost && (
        <p className={`text-sm font-medium ${isPurchased ? 'text-gray-400' : 'text-gray-600'}`}>
          ${item.estimated_cost.toFixed(2)}
        </p>
      )}
    </div>
  )
}



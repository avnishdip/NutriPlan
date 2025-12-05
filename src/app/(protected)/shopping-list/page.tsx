import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ShoppingListItem } from './shopping-list-item'

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get the most recent shopping list
  const { data: shoppingList } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!shoppingList) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">No shopping list yet</h1>
        <p className="text-gray-500 mb-6">Generate a meal plan to create your shopping list.</p>
        <Link
          href="/meal-plans/generate"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
        >
          Generate Meal Plan
        </Link>
      </main>
    )
  }

  // Get shopping list items
  const { data: items } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('shopping_list_id', shoppingList.id)
    .order('category', { ascending: true })
    .order('ingredient_name', { ascending: true })

  // Group by category
  const itemsByCategory = (items || []).reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const categories = Object.keys(itemsByCategory).sort()
  const totalItems = items?.length || 0
  const purchasedItems = items?.filter((i: { is_purchased?: boolean }) => i.is_purchased).length || 0

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shoppingList.name}</h1>
            <p className="text-gray-500 text-sm">
              {purchasedItems} of {totalItems} items purchased
            </p>
          </div>
          {shoppingList.estimated_total_cost && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${shoppingList.estimated_total_cost.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">estimated</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
            style={{ width: `${totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {category}
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {itemsByCategory[category]?.map((item) => (
              <ShoppingListItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}



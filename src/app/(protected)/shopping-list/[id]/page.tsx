import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ShoppingListItem } from '../shopping-list-item'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ShoppingListDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get the specific shopping list
  const { data: shoppingList, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (error || !shoppingList) {
    // Redirect to main shopping list page if not found
    redirect('/shopping-list')
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
  const purchasedItems = items?.filter(i => i.is_purchased).length || 0

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

      {categories.length > 0 ? (
        categories.map((category) => (
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
        ))
      ) : (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No items in this shopping list</p>
        </div>
      )}
    </main>
  )
}


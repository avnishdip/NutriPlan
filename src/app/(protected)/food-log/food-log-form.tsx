'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Camera, Loader2, X } from 'lucide-react'
import { createFoodLog } from '@/actions/food-logs'
import { createClient } from '@/lib/supabase/client'
import type { MealType } from '@/types/database'

const mealTypes: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
]

export function FoodLogForm() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [foodName, setFoodName] = useState('')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setFoodName('')
    setDescription('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setPhotoUrl('')
    setNotes('')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(data.path)

      setPhotoUrl(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodName.trim()) return

    setLoading(true)
    try {
      const result = await createFoodLog({
        mealType,
        foodName: foodName.trim(),
        description: description.trim() || undefined,
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
        photoUrl: photoUrl || undefined,
        notes: notes.trim() || undefined,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      resetForm()
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to log food')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-green-600"
      >
        <Plus className="w-5 h-5" />
        Log a Meal
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Log Food</h3>
        <button 
          type="button" 
          onClick={() => { resetForm(); setIsOpen(false) }}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Meal Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setMealType(type.value)}
              className={`p-2 rounded-xl border-2 text-center transition-all ${
                mealType === type.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-lg">{type.emoji}</span>
              <p className="text-xs mt-1">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Food Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">What did you eat?</label>
        <input
          type="text"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="e.g., Grilled chicken salad"
          required
          className="w-full p-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none"
        />
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
        {photoUrl ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden">
            <img src={photoUrl} alt="Food" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
            {uploadingPhoto ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-gray-500">Take or upload a photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />
          </label>
        )}
      </div>

      {/* Nutrition (optional) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition (optional)</label>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal"
              className="w-full p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm"
            />
            <p className="text-xs text-gray-400 text-center mt-1">Calories</p>
          </div>
          <div>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="g"
              step="0.1"
              className="w-full p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm"
            />
            <p className="text-xs text-gray-400 text-center mt-1">Protein</p>
          </div>
          <div>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="g"
              step="0.1"
              className="w-full p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm"
            />
            <p className="text-xs text-gray-400 text-center mt-1">Carbs</p>
          </div>
          <div>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="g"
              step="0.1"
              className="w-full p-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm"
            />
            <p className="text-xs text-gray-400 text-center mt-1">Fat</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it taste? How do you feel?"
          rows={2}
          className="w-full p-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !foodName.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            Log Food
          </>
        )}
      </button>
    </form>
  )
}



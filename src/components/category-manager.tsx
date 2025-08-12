'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  _count: {
    listings: number
  }
}

interface CategoryManagerProps {
  categories: Category[]
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [items, setItems] = useState<Category[]>(categories || [])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Sync hvis server henter nye kategorier
  useEffect(() => {
    setItems(categories || [])
  }, [categories])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Kategorinavn er påkrevd')
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/kategorier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Kunne ikke legge til kategori')
      }
      toast.success('Kategori lagt til')
      setItems(prev => [{ id: data.id, name: data.name, _count: { listings: 0 } }, ...prev])
      setNewCategoryName('')
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke legge til kategori')
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = async (categoryId: string) => {
    if (!editCategoryName.trim()) {
      toast.error('Kategorinavn er påkrevd')
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch(`/api/kategorier/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCategoryName })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Kunne ikke oppdatere kategori')
      }
      toast.success('Kategori oppdatert')
      setItems(prev => prev.map(c => c.id === categoryId ? { ...c, name: data.name } : c))
      setEditingId(null)
      setEditCategoryName('')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke oppdatere kategori')
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string, listingsCount: number) => {
    if (listingsCount > 0) {
      toast.error(`Kan ikke slette kategori med ${listingsCount} annonser`)
      return
    }

    if (!confirm(`Er du sikker på at du vil slette kategorien "${categoryName}"?`)) {
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch(`/api/kategorier/${categoryId}`, {
        method: 'DELETE'
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Kunne ikke slette kategori')
      }
      toast.success('Kategori slettet')
      setItems(prev => prev.filter(c => c.id !== categoryId))
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke slette kategori')
    }
    finally {
      setIsLoading(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditCategoryName(category.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditCategoryName('')
  }

  return (
    <div className="space-y-6">
      {/* Legg til ny kategori */}
      <div className="border-b pb-4">
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Legg til kategori
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Kategorinavn"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              className="max-w-xs"
            />
            <Button onClick={handleAddCategory} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Lagre
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsAdding(false)
                setNewCategoryName('')
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Avbryt
            </Button>
          </div>
        )}
      </div>

      {/* Eksisterende kategorier */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Eksisterende kategorier</h3>
        
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-500" />
                  
                  {editingId === category.id ? (
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category.id)}
                      className="max-w-xs"
                    />
                  ) : (
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {category._count.listings} annonser
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {editingId === category.id ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleEditCategory(category.id)}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Lagre
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Avbryt
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEdit(category)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Rediger
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(
                          category.id, 
                          category.name, 
                          category._count.listings
                        )}
                        className="text-red-600 hover:text-red-700"
                        disabled={category._count.listings > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Slett
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Ingen kategorier funnet</p>
            <p className="text-sm">Legg til din første kategori ovenfor</p>
          </div>
        )}
      </div>
    </div>
  )
}
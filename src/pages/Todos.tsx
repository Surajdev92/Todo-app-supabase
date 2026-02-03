import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
  user_id: string
}

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

type TodoFormData = z.infer<typeof todoSchema>

async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function createTodo(title: string): Promise<Todo> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .insert([{ title, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) throw error
}

export default function Todos() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Todo> }) =>
      updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
  })

  const onSubmit = async (data: TodoFormData) => {
    try {
      await createMutation.mutateAsync(data.title)
      reset()
    } catch (err) {
      console.error('Error creating todo:', err)
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      return
    }
    try {
      await updateMutation.mutateAsync({
        id,
        updates: { title: editTitle.trim() },
      })
      setEditingId(null)
      setEditTitle('')
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Todos</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What needs to be done?"
                  {...register('title')}
                  className="flex-1"
                />
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
              </div>
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8" aria-busy="true" aria-label="Loading todos">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {filter === 'all'
                ? 'No todos yet. Add one above!'
                : filter === 'active'
                  ? 'No active todos. Great job!'
                  : 'No completed todos yet.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <Card key={todo.id}>
                <CardContent className="p-4">
                  {editingId === todo.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(todo.id)
                          } else if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(todo.id)}
                        disabled={!editTitle.trim() || updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={(e) => {
                          updateMutation.mutate({
                            id: todo.id,
                            updates: { completed: e.target.checked },
                          })
                        }}
                        className="w-5 h-5 rounded border-gray-300"
                        disabled={updateMutation.isPending}
                      />
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {todo.title}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(todo)}
                        disabled={updateMutation.isPending || deleteMutation.isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(todo.id)}
                        disabled={deleteMutation.isPending || updateMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

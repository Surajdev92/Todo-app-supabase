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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Todo Flow
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Todos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Capture tasks, stay focused, and check things off one by one.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700 border border-slate-200">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white/80 hover:bg-slate-100"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-slate-200/80 bg-white shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-slate-900">
              Add a new todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="What needs to be done today?"
                  {...register('title')}
                  className="flex-1 bg-slate-50 border-slate-200 placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="shrink-0"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
              </div>
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              <p className="text-xs text-slate-600">
                Tip: Press{' '}
                <span className="inline-flex items-center rounded-sm bg-slate-100 px-1.5 py-0.5 text-[0.7rem] font-semibold text-slate-800 border border-slate-200">
                  Enter
                </span>{' '}
                to quickly add your todo.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex rounded-full bg-white/80 p-1 border border-slate-200">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full border-none ${filter !== 'all' ? 'bg-transparent' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({todos.length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full border-none ${filter !== 'active' ? 'bg-transparent' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full border-none ${filter !== 'completed' ? 'bg-transparent' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </Button>
          </div>
          <div className="flex gap-2 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{activeCount} active</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>{completedCount} completed</span>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12" aria-busy="true" aria-label="Loading todos">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/90 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-slate-600">
              {filter === 'all'
                ? 'No todos yet. Add one above to get started!'
                : filter === 'active'
                  ? 'No active todos. Enjoy the calm!'
                  : 'No completed todos yet. Check off your first task!'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className="border-slate-200/80 bg-white/95 shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg"
              >
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

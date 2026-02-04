import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { generateTodosFromPrompt, type AiTodoSuggestion } from '../lib/ai'
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
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<AiTodoSuggestion[]>([])
  const [selectedSuggestionIndexes, setSelectedSuggestionIndexes] = useState<number[]>([])
  const [aiError, setAiError] = useState<string | null>(null)

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

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const existingTitles = todos.map((t) => t.title)
      return generateTodosFromPrompt(prompt, existingTitles)
    },
    onSuccess: (suggestions) => {
      setAiSuggestions(suggestions)
      setSelectedSuggestionIndexes(suggestions.map((_, index) => index))
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

  const isAiConfigured = useMemo(
    () => Boolean(import.meta.env.VITE_OPENAI_API_KEY?.trim()),
    []
  )

  const toggleSuggestionSelected = (index: number) => {
    setSelectedSuggestionIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return
    setAiError(null)
    try {
      const suggestions = await aiMutation.mutateAsync(aiPrompt.trim())
      if (!suggestions.length) {
        setAiError('AI did not return any suggestions. Try rephrasing or adding more detail.')
      }
    } catch (error) {
      console.error('AI error', error)
      setAiError(
        error instanceof Error ? error.message : 'Something went wrong while talking to the AI.'
      )
    }
  }

  const handleAddSelectedSuggestions = async () => {
    const titlesToAdd = selectedSuggestionIndexes
      .map((i) => aiSuggestions[i]?.title)
      .filter((t): t is string => Boolean(t && t.trim()))

    if (!titlesToAdd.length) return

    try {
      await Promise.all(titlesToAdd.map((title) => createMutation.mutateAsync(title)))
      setAiSuggestions([])
      setSelectedSuggestionIndexes([])
      setAiPrompt('')
    } catch (error) {
      console.error('Error adding AI suggestions as todos', error)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-sky-400/20 blur-3xl animate-[spin_40s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <motion.div
          className="flex flex-col gap-8 lg:flex-row lg:items-start"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex-1">
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
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-700 border border-slate-200">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <motion.div layout transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
          <Card className="mb-6 border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-slate-900 flex items-center gap-2">
              Add a new todo
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Focus mode
              </span>
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
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex rounded-full bg-white/90 p-1 border border-slate-200">
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
          <motion.div
            className="flex justify-center py-12"
            aria-busy="true"
            aria-label="Loading todos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500/70 border-t-transparent" />
              <div className="absolute inset-2 animate-pulse rounded-full bg-emerald-400/30 blur-sm" />
            </div>
          </motion.div>
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
          <motion.div
            className="space-y-3"
            layout
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="border-slate-200/80 bg-white/95 shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg">
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
                        className="w-5 h-5 rounded border-slate-300 bg-white text-emerald-500"
                        disabled={updateMutation.isPending}
                      />
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? 'line-through text-slate-500'
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
              </motion.div>
            ))}
          </motion.div>
        )}
          </div>

          <motion.aside
            className="lg:w-80 lg:sticky lg:top-10 space-y-4"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-emerald-500/40 bg-white/95 shadow-2xl backdrop-blur-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  AI Task Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-700">
                  Describe your day, goals, or brain dump your thoughts. I&apos;ll turn it into clear,
                  actionable todos you can add with one click.
                </p>
                {!isAiConfigured && (
                  <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-900">
                    AI is not configured yet. Add{' '}
                    <span className="font-mono text-[10px]">VITE_OPENAI_API_KEY</span>{' '}
                    to your environment to enable this assistant.
                  </p>
                )}
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g. I need to get ready for a product launch, handle emails, and prepare for a trip this weekend…"
                  className="min-h-[110px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                  disabled={!isAiConfigured || aiMutation.isPending}
                />
                {aiError && <p className="text-[11px] text-destructive">{aiError}</p>}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                    onClick={handleGenerateWithAi}
                    disabled={!isAiConfigured || aiMutation.isPending || !aiPrompt.trim()}
                  >
                    {aiMutation.isPending ? 'Thinking…' : 'Generate todos'}
                  </Button>
                  <span className="text-[10px] text-slate-500">Powered by AI</span>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-md border border-emerald-500/30 bg-emerald-50 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-emerald-700">Suggested todos</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-emerald-700 hover:bg-emerald-100"
                        onClick={() =>
                          setSelectedSuggestionIndexes(aiSuggestions.map((_, index) => index))
                        }
                      >
                        Select all
                      </Button>
                    </div>
                    <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                      {aiSuggestions.map((suggestion, index) => {
                        const selected = selectedSuggestionIndexes.includes(index)
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleSuggestionSelected(index)}
                            className={`flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-[11px] transition ${
                              selected
                                ? 'bg-emerald-500/15 text-emerald-900'
                                : 'bg-transparent text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span
                              className={`mt-0.5 h-3 w-3 rounded border ${
                                selected
                                  ? 'border-emerald-400 bg-emerald-500'
                                  : 'border-slate-400'
                              }`}
                            />
                            <div>
                              <p className="font-medium">{suggestion.title}</p>
                              {suggestion.reason && (
                                <p className="mt-0.5 text-[10px] text-slate-600">
                                  {suggestion.reason}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-1 w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                      onClick={handleAddSelectedSuggestions}
                      disabled={createMutation.isPending || !selectedSuggestionIndexes.length}
                    >
                      Add selected todos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.aside>
        </motion.div>
      </div>
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AIAssistantIcon } from '../components/AIAssistantIcon'
import { AILoadingAnimation } from '../components/AILoadingAnimation'
import { AnimatedCheckbox } from '../components/AnimatedCheckbox'
import { BackgroundDecorations } from '../components/BackgroundDecorations'
import { ProgressBar } from '../components/ProgressBar'
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

  const isAiConfigured = useMemo(() => Boolean(import.meta.env.VITE_OPENAI_API_KEY?.trim()), [])

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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-sky-400/20 blur-3xl animate-[spin_40s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>
      <BackgroundDecorations />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <motion.div
          className="flex flex-col gap-8 lg:flex-row lg:items-start"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="min-w-0 flex-1">
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

            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -2 }}
              className="sticky top-4 z-20 mb-6"
            >
              <Card className="border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-sky-50/30 pointer-events-none" />

                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-base font-medium text-slate-900 flex items-center gap-2">
                    Add a new todo
                    <motion.span
                      className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(16, 185, 129, 0)',
                          '0 0 8px rgba(16, 185, 129, 0.3)',
                          '0 0 0px rgba(16, 185, 129, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      Focus mode
                    </motion.span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="flex min-w-0 gap-2">
                      <motion.div
                        className="min-w-0 flex-1"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Input
                          placeholder="What needs to be done today?"
                          {...register('title')}
                          className="w-full bg-slate-50 border-slate-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          className="shrink-0 relative overflow-hidden"
                        >
                          {createMutation.isPending && (
                            <motion.div
                              className="absolute inset-0 bg-emerald-600"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                          )}
                          <span className="relative z-10">
                            {createMutation.isPending ? 'Adding...' : 'Add'}
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
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

            <motion.div
              className="flex flex-wrap items-center justify-between gap-3 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex rounded-full bg-white/90 p-1 border border-slate-200 shadow-sm">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full border-none ${filter !== 'all' ? 'bg-transparent' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({todos.length})
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={filter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full border-none ${filter !== 'active' ? 'bg-transparent' : ''}`}
                    onClick={() => setFilter('active')}
                  >
                    Active ({activeCount})
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full border-none ${filter !== 'completed' ? 'bg-transparent' : ''}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed ({completedCount})
                  </Button>
                </motion.div>
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
            </motion.div>

            {/* Progress Bar */}
            {!isLoading && todos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <Card className="border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-xl">
                  <CardContent className="p-4">
                    <ProgressBar completed={completedCount} total={todos.length} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-dashed border-slate-300 bg-white/90 backdrop-blur-xl">
                  <CardContent className="py-10 text-center text-slate-600">
                    <motion.div className="text-4xl mb-2">✨</motion.div>
                    <p>
                      {filter === 'all'
                        ? 'No todos yet. Add one above to get started!'
                        : filter === 'active'
                          ? 'No active todos. Enjoy the calm!'
                          : 'No completed todos yet. Check off your first task!'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
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
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-slate-200/80 bg-white/95 shadow-md backdrop-blur-xl transition-all hover:shadow-xl hover:border-emerald-200/50">
                        <CardContent className="p-4">
                          {editingId === todo.id ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex min-w-0 items-center gap-2"
                            >
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
                                className="min-w-0 flex-1"
                                autoFocus
                              />
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(todo.id)}
                                  disabled={!editTitle.trim() || updateMutation.isPending}
                                >
                                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={updateMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <AnimatedCheckbox
                                checked={todo.completed}
                                onChange={(checked) => {
                                  updateMutation.mutate({
                                    id: todo.id,
                                    updates: { completed: checked },
                                  })
                                }}
                                disabled={updateMutation.isPending}
                              />
                              <motion.span
                                className={`flex-1 ${
                                  todo.completed ? 'line-through text-slate-500' : ''
                                }`}
                                initial={false}
                                animate={{
                                  opacity: todo.completed ? 0.6 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {todo.title}
                              </motion.span>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(todo)}
                                  disabled={updateMutation.isPending || deleteMutation.isPending}
                                >
                                  Edit
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteMutation.mutate(todo.id)}
                                  disabled={deleteMutation.isPending || updateMutation.isPending}
                                >
                                  Delete
                                </Button>
                              </motion.div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <motion.aside
            className="min-w-0 shrink-0 space-y-4 lg:sticky lg:top-4 lg:z-20 lg:w-80 lg:self-start"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-emerald-500/40 bg-white/95 shadow-2xl backdrop-blur-2xl relative overflow-hidden min-h-[600px]">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-sky-50/30 to-transparent pointer-events-none" />

              {/* Animated background shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute top-10 right-10 w-20 h-20 rounded-full bg-emerald-200/20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-sky-200/20 blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.25, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              </div>

              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <AIAssistantIcon size={36} />
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span>AI Task Assistant</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Describe your day, goals, or brain dump your thoughts. I&apos;ll turn it into
                    clear, actionable todos you can add with one click.
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {[
                      { icon: '✨', text: 'Smart parsing' },
                      { icon: '🎯', text: 'Actionable' },
                      { icon: '⚡', text: 'Instant' },
                      { icon: '🎨', text: 'Organized' },
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="flex items-center gap-1.5 rounded-md bg-emerald-50/50 px-2 py-1.5 border border-emerald-100/50"
                      >
                        <span className="text-xs">{feature.icon}</span>
                        <span className="text-[10px] font-medium text-emerald-700">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {!isAiConfigured && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-900"
                  >
                    <p className="font-semibold mb-1">⚠️ AI Not Configured</p>
                    <p>
                      Add{' '}
                      <span className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">
                        VITE_OPENAI_API_KEY
                      </span>{' '}
                      to your environment to enable this assistant.
                    </p>
                  </motion.div>
                )}

                {/* Example prompts */}
                {isAiConfigured && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                      Try these examples:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        'Plan my week: meetings, workouts, and meal prep',
                        'Break down my project into daily tasks',
                        'Create todos for organizing my workspace',
                      ].map((example, idx) => (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => setAiPrompt(example)}
                          disabled={aiMutation.isPending}
                          className="w-full text-left text-[10px] text-slate-600 hover:text-emerald-700 p-2 rounded-md bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 transition-all"
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-emerald-500 mr-1.5">→</span>
                          {example}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                    Your Input:
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g. I need to get ready for a product launch, handle emails, and prepare for a trip this weekend…"
                    className="min-h-[140px] w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 transition-all resize-none"
                    disabled={!isAiConfigured || aiMutation.isPending}
                  />
                  <motion.div
                    className="flex items-center gap-1 text-[9px] text-slate-500"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <span>💡</span>
                    <span>Tip: Be specific for better results</span>
                  </motion.div>
                </div>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md border border-red-300 bg-red-50 p-2 text-[11px] text-red-900"
                  >
                    <p className="font-semibold">⚠️ Error</p>
                    <p>{aiError}</p>
                  </motion.div>
                )}

                {/* Stats section */}
                {aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-md bg-gradient-to-r from-emerald-50 to-sky-50 p-2.5 border border-emerald-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-700">
                          {aiSuggestions.length} suggestions generated
                        </p>
                        <p className="text-[9px] text-emerald-600 mt-0.5">
                          {selectedSuggestionIndexes.length} selected
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="text-lg"
                      >
                        ✨
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      className="w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400 relative overflow-hidden"
                      onClick={handleGenerateWithAi}
                      disabled={!isAiConfigured || aiMutation.isPending || !aiPrompt.trim()}
                    >
                      {aiMutation.isPending ? (
                        <AILoadingAnimation />
                      ) : (
                        <span className="relative z-10">Generate todos</span>
                      )}
                      {!aiMutation.isPending && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 hover:opacity-100 transition-opacity"
                          initial={false}
                        />
                      )}
                    </Button>
                  </motion.div>
                  <motion.span
                    className="text-[10px] text-slate-500"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    Powered by AI
                  </motion.span>
                </div>

                {aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 space-y-2 rounded-md border border-emerald-500/30 bg-emerald-50 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <motion.p
                        className="text-[11px] font-semibold text-emerald-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Suggested todos
                      </motion.p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                      </motion.div>
                    </div>
                    <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                      {aiSuggestions.map((suggestion, index) => {
                        const selected = selectedSuggestionIndexes.includes(index)
                        return (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => toggleSuggestionSelected(index)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-[11px] transition ${
                              selected
                                ? 'bg-emerald-500/15 text-emerald-900'
                                : 'bg-transparent text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <motion.span
                              className={`mt-0.5 h-3 w-3 rounded border ${
                                selected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-400'
                              }`}
                              animate={{
                                scale: selected ? [1, 1.2, 1] : 1,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {selected && (
                                <motion.svg
                                  className="h-full w-full"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <path
                                    d="M2 6L5 9L10 3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </motion.svg>
                              )}
                            </motion.span>
                            <div>
                              <p className="font-medium">{suggestion.title}</p>
                              {suggestion.reason && (
                                <p className="mt-0.5 text-[10px] text-slate-600">
                                  {suggestion.reason}
                                </p>
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-1"
                    >
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                        onClick={handleAddSelectedSuggestions}
                        disabled={createMutation.isPending || !selectedSuggestionIndexes.length}
                      >
                        Add selected todos
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.aside>
        </motion.div>
      </div>
    </div>
  )
}

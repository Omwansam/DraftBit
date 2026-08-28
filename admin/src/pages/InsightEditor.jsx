import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, ImageOff, Save, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import { Input, Select, Switch, TagInput, Textarea } from '../components/ui/Field'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { StatusBadge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { slugify, uniqueSlug } from '../lib/slug'
import { formatDateTime } from '../lib/format'
import { INSIGHT_CATEGORIES } from '../data/seed'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

/** ~200 wpm, rounded up — matches how the public site labels articles. */
const readTimeFor = (body) => {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export default function InsightEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { insights, team, create, update, remove } = useData()
  const { can, user } = useAuth()
  const { toast } = useToast()

  const isNew = id === 'new'
  /* Match the saved id or the optimistic one the URL still carries: a newly
     created record is navigated to before the server has assigned its id. */
  const existing = useMemo(
    () => insights.find((p) => p.id === id || p.tempId === id),
    [insights, id],
  )

  /* Once the real id lands, put it in the URL so a refresh or a shared link
     resolves. */
  useEffect(() => {
    if (existing && existing.id !== id && existing.tempId === id) {
      navigate(`/insights/${existing.id}`, { replace: true })
    }
  }, [existing, id, navigate])

  const BLANK = useMemo(
    () => ({
      title: '', slug: '', excerpt: '', body: '', category: 'Engineering',
      author: user?.name ?? '', status: 'draft', featured: false,
      readTime: '1 min read', publishedAt: null, image: '', tags: [], views: 0,
    }),
    [user],
  )

  const [form, setForm] = useState(() => (isNew ? BLANK : existing ?? BLANK))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadedId, setLoadedId] = useState(id)

  const readOnly = !can('write')

  /* Reload the form only when the route points at a different record — see the
     note in ProjectEditor: resyncing on every store change loses live edits. */
  if (loadedId !== id) {
    setLoadedId(id)
    setForm(isNew ? BLANK : existing ?? BLANK)
    setErrors({})
    setDirty(false)
    setSlugTouched(!isNew)
  }

  useEffect(() => {
    if (!dirty) return undefined
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  if (!isNew && !existing) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-sm text-muted-foreground">That article no longer exists.</p>
          <Button variant="outline" to="/insights" className="mt-4">Back to insights</Button>
        </CardBody>
      </Card>
    )
  }

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setDirty(true)
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'A headline is required'
    if (!form.excerpt.trim()) next.excerpt = 'The excerpt appears on the insights index'
    if (form.status === 'published' && form.body.trim().length < 200) {
      next.body = 'Write at least a couple of paragraphs before publishing'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = () => {
    if (!validate()) {
      toast('Fix the highlighted fields before saving.', { tone: 'error' })
      return
    }

    const slug = form.slug.trim()
      ? slugify(form.slug)
      : uniqueSlug(form.title, insights, isNew ? null : id)

    const payload = {
      ...form,
      slug,
      readTime: readTimeFor(form.body),
      // Stamp the publish date the first time it goes live, then leave it be.
      publishedAt:
        form.status === 'published' && !form.publishedAt
          ? new Date().toISOString()
          : form.publishedAt,
    }

    if (isNew) {
      const created = create('insights', payload)
      setDirty(false)
      toast('Article created.')
      navigate(`/insights/${created.id}`, { replace: true })
    } else {
      update('insights', id, payload)
      setDirty(false)
      toast('Changes saved.')
    }
  }

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="ghost" size="sm" to="/insights">
          <ArrowLeft className="h-4 w-4" /> Insights
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {isNew ? 'New article' : form.title || 'Untitled article'}
          </p>
          {dirty && <p className="text-xs text-warning">Unsaved changes</p>}
        </div>
        {!isNew && form.status === 'published' && (
          <Button
            variant="ghost"
            size="sm"
            href={`${SITE_URL}/insights/${form.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" /> View
          </Button>
        )}
        {!readOnly && (
          <Button size="sm" onClick={save} disabled={!dirty && !isNew}>
            <Save className="h-4 w-4" /> {isNew ? 'Create article' : 'Save changes'}
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Headline"
                required
                value={form.title}
                error={errors.title}
                disabled={readOnly}
                onChange={(e) => {
                  const title = e.target.value
                  set(slugTouched ? { title } : { title, slug: slugify(title) })
                }}
                placeholder="Why Clean Architecture Matters for Startups"
              />
              <Input
                label="URL slug"
                hint={`Public address: ${SITE_URL}/insights/${form.slug || 'your-slug'}`}
                value={form.slug}
                disabled={readOnly}
                onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }) }}
                onBlur={(e) => set({ slug: slugify(e.target.value) })}
              />
              <Textarea
                label="Excerpt"
                required
                rows={2}
                value={form.excerpt}
                error={errors.excerpt}
                disabled={readOnly}
                onChange={(e) => set({ excerpt: e.target.value })}
                placeholder="One sentence that makes someone want to read it."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Body"
              subtitle="Plain text. Blank lines separate paragraphs."
              actions={
                <span className="tnum text-xs text-muted-foreground">
                  {wordCount} words · {readTimeFor(form.body)}
                </span>
              }
            />
            <CardBody>
              <Textarea
                rows={22}
                value={form.body}
                error={errors.body}
                disabled={readOnly}
                onChange={(e) => set({ body: e.target.value })}
                placeholder="Start writing…"
                className="font-[var(--font-body)] leading-7"
              />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Publishing" />
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-muted-foreground">Current status</span>
                <StatusBadge status={form.status} />
              </div>
              <Select
                label="Status"
                value={form.status}
                disabled={readOnly || !can('publish')}
                onChange={(e) => set({ status: e.target.value })}
                options={[
                  { value: 'draft', label: 'Draft — not on the site' },
                  { value: 'published', label: 'Published — live' },
                  { value: 'archived', label: 'Archived — hidden' },
                ]}
              />
              <Switch
                label="Feature on the homepage"
                description="Featured articles appear in the insights strip."
                checked={form.featured}
                disabled={readOnly}
                onChange={(featured) => set({ featured })}
              />
              {form.publishedAt && (
                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                  First published {formatDateTime(form.publishedAt)}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="flex flex-col gap-4">
              <Select
                label="Category"
                value={form.category}
                disabled={readOnly}
                onChange={(e) => set({ category: e.target.value })}
                options={INSIGHT_CATEGORIES}
              />
              <Select
                label="Author"
                value={form.author}
                disabled={readOnly}
                onChange={(e) => set({ author: e.target.value })}
                options={[
                  ...(team.some((t) => t.name === form.author) || !form.author
                    ? []
                    : [form.author]),
                  ...team.map((t) => t.name),
                ]}
              />
              <TagInput
                label="Tags"
                value={form.tags}
                onChange={(tags) => set({ tags })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cover image" />
            <CardBody className="flex flex-col gap-4">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-2">
                {form.image ? (
                  <img
                    src={form.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.opacity = '0.15' }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-subtle-foreground">
                    <ImageOff className="h-6 w-6" aria-hidden="true" />
                    <p className="text-xs">No cover image</p>
                  </div>
                )}
              </div>
              <Input
                label="Image URL"
                value={form.image}
                disabled={readOnly}
                onChange={(e) => set({ image: e.target.value })}
                placeholder="https://…"
              />
            </CardBody>
          </Card>

          {!isNew && !readOnly && (
            <Card className="border-critical/30">
              <CardHeader title="Danger zone" subtitle="Deleting removes the article from the site." />
              <CardBody>
                <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Delete article
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          remove('insights', id)
          toast('Article deleted.', { tone: 'info' })
          navigate('/insights', { replace: true })
        }}
        title={`Delete “${form.title}”?`}
        message="This permanently removes the article. It cannot be undone."
      />
    </div>
  )
}

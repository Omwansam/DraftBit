import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, ImageOff, Save, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import { Input, ListEditor, Select, Switch, TagInput, Textarea } from '../components/ui/Field'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { StatusBadge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { slugify, uniqueSlug } from '../lib/slug'
import { formatDateTime } from '../lib/format'
import { ICON_OPTIONS, PROJECT_CATEGORIES } from '../data/seed'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

const BLANK = {
  title: '', slug: '', description: '', category: 'Web', status: 'draft',
  featured: false, client: '', role: '', year: String(new Date().getFullYear()),
  liveUrl: '', image: '', imageAlt: '', icon: 'Code', tags: [],
  challenge: '', solution: '', results: [], views: 0,
}

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const isNew = id === 'new'
  /* Match the saved id or the optimistic one the URL still carries: a newly
     created record is navigated to before the server has assigned its id. */
  const existing = useMemo(
    () => projects.find((p) => p.id === id || p.tempId === id),
    [projects, id],
  )

  /* Once the real id lands, put it in the URL so a refresh or a shared link
     resolves. */
  useEffect(() => {
    if (existing && existing.id !== id && existing.tempId === id) {
      navigate(`/projects/${existing.id}`, { replace: true })
    }
  }, [existing, id, navigate])

  const [form, setForm] = useState(() => (isNew ? BLANK : existing ?? BLANK))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadedId, setLoadedId] = useState(id)

  const readOnly = !can('write')

  /* Reload the form only when the route points at a different record. Syncing
     on every store change instead would wipe unsaved edits the moment anything
     else in the console wrote to the store. */
  if (loadedId !== id) {
    setLoadedId(id)
    setForm(isNew ? BLANK : existing ?? BLANK)
    setErrors({})
    setDirty(false)
    setSlugTouched(!isNew)
  }

  /* Warn before losing unsaved edits to a browser navigation. */
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
          <p className="text-sm text-muted-foreground">That project no longer exists.</p>
          <Button variant="outline" to="/projects" className="mt-4">Back to projects</Button>
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
    if (!form.title.trim()) next.title = 'A title is required'
    if (!form.description.trim()) next.description = 'Write a one-line summary for the card'
    if (form.liveUrl && !/^https?:\/\//.test(form.liveUrl)) {
      next.liveUrl = 'Include the protocol, e.g. https://'
    }
    if (form.image && !/^https?:\/\//.test(form.image)) {
      next.image = 'Use a full image URL'
    }
    if (form.status === 'published' && !form.challenge.trim()) {
      next.challenge = 'A published case study needs the challenge section filled in'
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
      : uniqueSlug(form.title, projects, isNew ? null : id)

    if (isNew) {
      const created = create('projects', { ...form, slug })
      setDirty(false)
      toast('Project created.')
      navigate(`/projects/${created.id}`, { replace: true })
    } else {
      update('projects', id, { ...form, slug })
      setDirty(false)
      toast('Changes saved.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sticky action bar so Save is reachable from anywhere in a long form. */}
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="ghost" size="sm" to="/projects">
          <ArrowLeft className="h-4 w-4" /> Projects
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {isNew ? 'New project' : form.title || 'Untitled project'}
          </p>
          {dirty && <p className="text-xs text-warning">Unsaved changes</p>}
        </div>
        {!isNew && form.status === 'published' && (
          <Button
            variant="ghost"
            size="sm"
            href={`${SITE_URL}/projects/${form.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" /> View
          </Button>
        )}
        {!readOnly && (
          <Button size="sm" onClick={save} disabled={!dirty && !isNew}>
            <Save className="h-4 w-4" /> {isNew ? 'Create project' : 'Save changes'}
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---- Main column ---- */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Overview" subtitle="What appears on the projects grid" />
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Title"
                required
                value={form.title}
                error={errors.title}
                disabled={readOnly}
                onChange={(e) => {
                  const title = e.target.value
                  set(slugTouched ? { title } : { title, slug: slugify(title) })
                }}
                placeholder="e.g. FIBI"
              />

              <Input
                label="URL slug"
                hint={`Public address: ${SITE_URL}/projects/${form.slug || 'your-slug'}`}
                value={form.slug}
                disabled={readOnly}
                onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }) }}
                onBlur={(e) => set({ slug: slugify(e.target.value) })}
                placeholder="fibi-community"
              />

              <Textarea
                label="Card description"
                required
                rows={3}
                value={form.description}
                error={errors.description}
                disabled={readOnly}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="One or two sentences describing the product."
              />

              <TagInput
                label="Tech stack"
                hint="Shown as chips on the project card."
                value={form.tags}
                onChange={(tags) => set({ tags })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Case study" subtitle="The long-form detail page" />
            <CardBody className="flex flex-col gap-4">
              <Textarea
                label="The challenge"
                rows={5}
                value={form.challenge}
                error={errors.challenge}
                disabled={readOnly}
                onChange={(e) => set({ challenge: e.target.value })}
                placeholder="What problem was the client facing?"
              />
              <Textarea
                label="Our solution"
                rows={7}
                value={form.solution}
                disabled={readOnly}
                onChange={(e) => set({ solution: e.target.value })}
                placeholder="What did we build, and how?"
              />
              <ListEditor
                label="Results"
                hint="Concrete outcomes, one per line."
                value={form.results}
                onChange={(results) => set({ results })}
                placeholder="e.g. 3x online revenue in 12 months"
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
                    alt={form.imageAlt || ''}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.opacity = '0.15' }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-subtle-foreground">
                    <ImageOff className="h-6 w-6" aria-hidden="true" />
                    <p className="text-xs">No cover image set</p>
                  </div>
                )}
              </div>
              <Input
                label="Image URL"
                value={form.image}
                error={errors.image}
                disabled={readOnly}
                onChange={(e) => set({ image: e.target.value })}
                placeholder="https://…"
              />
              <Input
                label="Alt text"
                hint="Describe the image for screen readers and when it fails to load."
                value={form.imageAlt}
                disabled={readOnly}
                onChange={(e) => set({ imageAlt: e.target.value })}
                placeholder="Aerial view of open farmland"
              />
            </CardBody>
          </Card>
        </div>

        {/* ---- Sidebar ---- */}
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
                description="Featured projects appear in the homepage grid."
                checked={form.featured}
                disabled={readOnly}
                onChange={(featured) => set({ featured })}
              />
              {!isNew && (
                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                  Last updated {formatDateTime(form.updatedAt)}
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
                options={PROJECT_CATEGORIES}
              />
              <Select
                label="Icon"
                hint="Lucide icon used as a fallback on the card."
                value={form.icon}
                disabled={readOnly}
                onChange={(e) => set({ icon: e.target.value })}
                options={ICON_OPTIONS}
              />
              <Input
                label="Client"
                value={form.client}
                disabled={readOnly}
                onChange={(e) => set({ client: e.target.value })}
                placeholder="East Africa Retail Group"
              />
              <Input
                label="Our role"
                value={form.role}
                disabled={readOnly}
                onChange={(e) => set({ role: e.target.value })}
                placeholder="Lead Engineer"
              />
              <Input
                label="Year"
                value={form.year}
                disabled={readOnly}
                onChange={(e) => set({ year: e.target.value })}
                placeholder="2026"
              />
              <Input
                label="Live URL"
                value={form.liveUrl}
                error={errors.liveUrl}
                disabled={readOnly}
                onChange={(e) => set({ liveUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </CardBody>
          </Card>

          {!isNew && !readOnly && (
            <Card className="border-critical/30">
              <CardHeader
                title="Danger zone"
                subtitle="Deleting removes the case study from the public site."
              />
              <CardBody>
                <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Delete project
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
          remove('projects', id)
          toast('Project deleted.', { tone: 'info' })
          navigate('/projects', { replace: true })
        }}
        title={`Delete “${form.title}”?`}
        message="This permanently removes the project and its case study. It cannot be undone."
      />
    </div>
  )
}

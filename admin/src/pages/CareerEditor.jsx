import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Users } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import { Input, ListEditor, Select, Textarea } from '../components/ui/Field'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { StatusBadge } from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { slugify, uniqueSlug } from '../lib/slug'
import { formatDate, formatNumber } from '../lib/format'
import { DEPARTMENTS, EMPLOYMENT_TYPES } from '../data/seed'

const BLANK = {
  title: '', slug: '', department: 'Engineering', location: 'Nairobi / Remote',
  type: 'Full-time', status: 'open', description: '', requirements: [],
  applicants: 0, postedAt: new Date().toISOString(),
}

export default function CareerEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { careers, create, update, remove } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const isNew = id === 'new'
  const existing = useMemo(() => careers.find((c) => c.id === id), [careers, id])

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

  if (!isNew && !existing) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-sm text-muted-foreground">That role no longer exists.</p>
          <Button variant="outline" to="/careers" className="mt-4">Back to careers</Button>
        </CardBody>
      </Card>
    )
  }

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setDirty(true)
  }

  const save = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'A job title is required'
    if (!form.description.trim()) next.description = 'Describe the role'
    if (form.status === 'open' && form.requirements.length === 0) {
      next.requirements = 'List at least one requirement before opening the role'
    }
    setErrors(next)

    if (Object.keys(next).length) {
      toast('Fix the highlighted fields before saving.', { tone: 'error' })
      return
    }

    const slug = form.slug.trim()
      ? slugify(form.slug)
      : uniqueSlug(form.title, careers, isNew ? null : id)

    if (isNew) {
      const created = create('careers', { ...form, slug })
      setDirty(false)
      toast('Role posted.')
      navigate(`/careers/${created.id}`, { replace: true })
    } else {
      update('careers', id, { ...form, slug })
      setDirty(false)
      toast('Changes saved.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="ghost" size="sm" to="/careers">
          <ArrowLeft className="h-4 w-4" /> Careers
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {isNew ? 'New role' : form.title || 'Untitled role'}
          </p>
          {dirty && <p className="text-xs text-warning">Unsaved changes</p>}
        </div>
        {!readOnly && (
          <Button size="sm" onClick={save} disabled={!dirty && !isNew}>
            <Save className="h-4 w-4" /> {isNew ? 'Post role' : 'Save changes'}
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="The role" />
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Job title"
                required
                value={form.title}
                error={errors.title}
                disabled={readOnly}
                onChange={(e) => {
                  const title = e.target.value
                  set(slugTouched ? { title } : { title, slug: slugify(title) })
                }}
                placeholder="Senior Full-Stack Engineer"
              />
              <Input
                label="URL slug"
                value={form.slug}
                disabled={readOnly}
                onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }) }}
                onBlur={(e) => set({ slug: slugify(e.target.value) })}
              />
              <Textarea
                label="Description"
                required
                rows={5}
                value={form.description}
                error={errors.description}
                disabled={readOnly}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="What will this person do, and what will they own?"
              />
              <ListEditor
                label="Requirements"
                hint={errors.requirements || 'One bullet per requirement.'}
                value={form.requirements}
                onChange={(requirements) => set({ requirements })}
                placeholder="e.g. 5+ years full-stack experience"
              />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Listing" />
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
                  { value: 'open', label: 'Open — accepting applications' },
                  { value: 'closed', label: 'Closed — hidden from the site' },
                ]}
              />
              <Select
                label="Department"
                value={form.department}
                disabled={readOnly}
                onChange={(e) => set({ department: e.target.value })}
                options={DEPARTMENTS}
              />
              <Select
                label="Employment type"
                value={form.type}
                disabled={readOnly}
                onChange={(e) => set({ type: e.target.value })}
                options={EMPLOYMENT_TYPES}
              />
              <Input
                label="Location"
                value={form.location}
                disabled={readOnly}
                onChange={(e) => set({ location: e.target.value })}
                placeholder="Nairobi / Remote"
              />
            </CardBody>
          </Card>

          {!isNew && (
            <Card>
              <CardHeader title="Applications" />
              <CardBody>
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {formatNumber(form.applicants ?? 0)}
                  </span>
                  <span className="text-[0.8125rem] text-muted-foreground">
                    {form.applicants === 1 ? 'application' : 'applications'}
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Posted {formatDate(form.postedAt)}
                </p>
              </CardBody>
            </Card>
          )}

          {!isNew && !readOnly && (
            <Card className="border-critical/30">
              <CardHeader title="Danger zone" />
              <CardBody>
                <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Delete role
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
          remove('careers', id)
          toast('Role deleted.', { tone: 'info' })
          navigate('/careers', { replace: true })
        }}
        title={`Delete “${form.title}”?`}
        message="This removes the listing and its applicant count. It cannot be undone."
      />
    </div>
  )
}

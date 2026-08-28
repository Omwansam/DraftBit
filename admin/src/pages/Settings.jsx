import { useState } from 'react'
import { Building2, Globe, RotateCcw, Save, Search, Share2, Sliders } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Tabs from '../components/ui/Tabs'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Input, Switch, Textarea } from '../components/ui/Field'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Globe },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'features', label: 'Features', icon: Sliders },
]

export default function Settings() {
  const { settings, saveSettings, reset } = useData()
  const { can } = useAuth()
  const { toast } = useToast()

  const [tab, setTab] = useState('general')
  const [form, setForm] = useState(settings)
  const [dirty, setDirty] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [synced, setSynced] = useState(settings)

  const readOnly = !can('manage_settings')

  /* Pick up an external change to settings — a reset, or another tab — but
     never on top of edits in progress. */
  if (synced !== settings && !dirty) {
    setSynced(settings)
    setForm(settings)
  }

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setDirty(true)
  }
  const setNested = (key, patch) => {
    setForm((f) => ({ ...f, [key]: { ...f[key], ...patch } }))
    setDirty(true)
  }

  const save = () => {
    saveSettings(form)
    setDirty(false)
    toast('Site settings saved.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="Global content used across the public site — contact details, copy and feature switches."
        actions={
          !readOnly && (
            <Button onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          )
        }
      />

      {dirty && (
        <p className="rounded-lg border border-warning/35 bg-warning/10 px-3.5 py-2.5 text-[0.8125rem] text-warning">
          You have unsaved changes.
        </p>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'general' && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Identity" subtitle="Name and positioning shown across the site" />
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Company name"
                value={form.name}
                disabled={readOnly}
                onChange={(e) => set({ name: e.target.value })}
              />
              <Input
                label="Tagline"
                hint="Used in the hero and page titles."
                value={form.tagline}
                disabled={readOnly}
                onChange={(e) => set({ tagline: e.target.value })}
              />
              <Textarea
                label="Description"
                rows={3}
                value={form.description}
                disabled={readOnly}
                onChange={(e) => set({ description: e.target.value })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Mission & vision" subtitle="Long-form copy on the about page" />
            <CardBody className="flex flex-col gap-4">
              <Textarea
                label="Mission"
                rows={4}
                value={form.mission}
                disabled={readOnly}
                onChange={(e) => set({ mission: e.target.value })}
              />
              <Textarea
                label="Vision"
                rows={4}
                value={form.vision}
                disabled={readOnly}
                onChange={(e) => set({ vision: e.target.value })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Headline statistics"
              subtitle="The counters in the stats strip on the homepage"
            />
            <CardBody className="flex flex-col gap-4">
              {form.stats.map((stat, i) => (
                <div key={stat.label} className="grid gap-3 sm:grid-cols-[1fr_6rem_5rem]">
                  <Input
                    label={i === 0 ? 'Label' : undefined}
                    value={stat.label}
                    disabled={readOnly}
                    onChange={(e) => {
                      const stats = [...form.stats]
                      stats[i] = { ...stat, label: e.target.value }
                      set({ stats })
                    }}
                  />
                  <Input
                    label={i === 0 ? 'Value' : undefined}
                    type="number"
                    value={stat.value}
                    disabled={readOnly}
                    onChange={(e) => {
                      const stats = [...form.stats]
                      stats[i] = { ...stat, value: Number(e.target.value) }
                      set({ stats })
                    }}
                  />
                  <Input
                    label={i === 0 ? 'Suffix' : undefined}
                    value={stat.suffix}
                    disabled={readOnly}
                    onChange={(e) => {
                      const stats = [...form.stats]
                      stats[i] = { ...stat, suffix: e.target.value }
                      set({ stats })
                    }}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'contact' && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Contact details" subtitle="Shown in the footer and on the contact page" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email address"
                type="email"
                value={form.email}
                disabled={readOnly}
                onChange={(e) => set({ email: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                disabled={readOnly}
                onChange={(e) => set({ phone: e.target.value })}
              />
              <Input
                label="Location"
                value={form.location}
                disabled={readOnly}
                onChange={(e) => set({ location: e.target.value })}
              />
              <Input
                label="Street address"
                value={form.address}
                disabled={readOnly}
                onChange={(e) => set({ address: e.target.value })}
              />
              <Input
                label="Map URL"
                className="sm:col-span-2"
                value={form.mapUrl}
                disabled={readOnly}
                onChange={(e) => set({ mapUrl: e.target.value })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Business hours" />
            <CardBody className="flex flex-col gap-4">
              {form.businessHours.map((row, i) => (
                <div key={row.days} className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label={i === 0 ? 'Days' : undefined}
                    value={row.days}
                    disabled={readOnly}
                    onChange={(e) => {
                      const businessHours = [...form.businessHours]
                      businessHours[i] = { ...row, days: e.target.value }
                      set({ businessHours })
                    }}
                  />
                  <Input
                    label={i === 0 ? 'Hours' : undefined}
                    value={row.time}
                    disabled={readOnly}
                    onChange={(e) => {
                      const businessHours = [...form.businessHours]
                      businessHours[i] = { ...row, time: e.target.value }
                      set({ businessHours })
                    }}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'social' && (
        <Card>
          <CardHeader title="Social profiles" subtitle="Linked from the footer. Leave blank to hide." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {Object.entries(form.social).map(([key, value]) => (
              <Input
                key={key}
                label={key[0].toUpperCase() + key.slice(1)}
                value={value}
                disabled={readOnly}
                onChange={(e) => setNested('social', { [key]: e.target.value })}
                placeholder={`https://${key}.com/draftbit`}
              />
            ))}
          </CardBody>
        </Card>
      )}

      {tab === 'seo' && (
        <Card>
          <CardHeader title="Search engines" subtitle="Defaults used when a page has no metadata of its own" />
          <CardBody className="flex flex-col gap-4">
            <Input
              label="Default page title"
              hint={`${form.seo.defaultTitle.length} characters — aim for under 60.`}
              value={form.seo.defaultTitle}
              disabled={readOnly}
              onChange={(e) => setNested('seo', { defaultTitle: e.target.value })}
            />
            <Textarea
              label="Default meta description"
              rows={3}
              hint={`${form.seo.defaultDescription.length} characters — aim for 140–160.`}
              value={form.seo.defaultDescription}
              disabled={readOnly}
              onChange={(e) => setNested('seo', { defaultDescription: e.target.value })}
            />
            <div className="border-t border-border pt-4">
              <Switch
                label="Allow search engines to index the site"
                description="Turning this off adds a noindex directive to every page. Use only for staging."
                checked={form.seo.indexable}
                disabled={readOnly}
                onChange={(indexable) => setNested('seo', { indexable })}
              />
            </div>

            {/* Search result preview — shows the effect of the two fields above. */}
            <div className="mt-2 rounded-lg border border-border bg-surface-2 p-4">
              <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-widest text-subtle-foreground">
                Search result preview
              </p>
              <p className="truncate text-[0.8125rem] text-success">draftbit.com</p>
              <p className="mt-0.5 truncate text-base text-primary">{form.seo.defaultTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-[0.8125rem] text-muted-foreground">
                {form.seo.defaultDescription}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'features' && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Site features" subtitle="Turn public-site widgets on or off" />
            <CardBody className="flex flex-col gap-5">
              <Switch
                label="Chat widget"
                description="Floating chat launcher in the bottom-right corner."
                checked={form.features.chatWidget}
                disabled={readOnly}
                onChange={(v) => setNested('features', { chatWidget: v })}
              />
              <Switch
                label="WhatsApp button"
                description="Quick-contact button linked to the studio number."
                checked={form.features.whatsapp}
                disabled={readOnly}
                onChange={(v) => setNested('features', { whatsapp: v })}
              />
              <Switch
                label="Cookie banner"
                description="Consent notice shown to first-time visitors."
                checked={form.features.cookieBanner}
                disabled={readOnly}
                onChange={(v) => setNested('features', { cookieBanner: v })}
              />
              <Switch
                label="Newsletter signup"
                description="Email capture form in the footer."
                checked={form.features.newsletter}
                disabled={readOnly}
                onChange={(v) => setNested('features', { newsletter: v })}
              />
            </CardBody>
          </Card>

          {!readOnly && (
            <Card className="border-critical/30">
              <CardHeader
                title="Reset demo data"
                subtitle="Restores every collection to the seeded content and discards all local edits."
              />
              <CardBody>
                <Button variant="danger" onClick={() => setConfirmReset(true)}>
                  <RotateCcw className="h-4 w-4" /> Reset all data
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          reset()
          toast('All data reset to the seeded content.', { tone: 'info' })
        }}
        title="Reset all data?"
        message="Every project, article, role, message and setting reverts to the seeded content. Anything you have changed in this browser is lost."
        confirmLabel="Reset everything"
      />
    </div>
  )
}

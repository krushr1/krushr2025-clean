import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Save, Download, Trash2, Star, Clock, Layout, FolderOpen } from 'lucide-react'
import { useLayoutPersistence } from '../../hooks/use-layout-persistence'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'

interface LayoutManagerModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  panels: any[]
  initialMode?: 'save' | 'load'
}

export default function LayoutManagerModal({ 
  open, 
  onClose, 
  workspaceId, 
  panels,
  initialMode = 'save'
}: LayoutManagerModalProps) {
  const [activeTab, setActiveTab] = useState(initialMode)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [makeDefault, setMakeDefault] = useState(false)

  const {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    setDefaultPreset,
    isSaving,
    isLoading,
    isDeleting,
    isSettingDefault
  } = useLayoutPersistence({ workspaceId, panels, enabled: true })

  const handleSave = () => {
    if (!saveName.trim()) return
    
    savePreset(saveName, saveDescription || undefined, makeDefault)
    setSaveName('')
    setSaveDescription('')
    setMakeDefault(false)
    setActiveTab('load')
  }

  const handleLoad = (presetId: string) => {
    loadPreset(presetId)
    onClose()
  }

  const handleDelete = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this layout?')) {
      deletePreset(presetId)
    }
  }

  const handleSetDefault = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDefaultPreset(presetId)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-krushr-primary" />
            Layout Manager
          </DialogTitle>
          <DialogDescription>
            Save your current panel arrangement or load a previously saved layout
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">
              <Save className="w-4 h-4 mr-2" />
              Save Layout
            </TabsTrigger>
            <TabsTrigger value="load">
              <Download className="w-4 h-4 mr-2" />
              Load Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                placeholder="My Workspace Layout"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout-description">Description (optional)</Label>
              <Textarea
                id="layout-description"
                placeholder="Describe this layout..."
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="make-default"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-gray-300 text-krushr-primary focus:ring-krushr-primary"
              />
              <Label htmlFor="make-default" className="text-sm font-normal">
                Set as default layout for this workspace
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!saveName.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Layout
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="load" className="mt-4">
            {presets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved layouts yet</p>
                <p className="text-sm mt-1">Save your current layout to get started</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleLoad(preset.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      "hover:bg-gray-50 hover:border-krushr-primary/50",
                      preset.isDefault && "border-krushr-primary bg-krushr-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{preset.name}</h4>
                          {preset.isDefault && (
                            <Star className="w-4 h-4 text-krushr-primary fill-current" />
                          )}
                        </div>
                        {preset.description && (
                          <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Saved {formatDistanceToNow(new Date(preset.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        {!preset.isDefault && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleSetDefault(preset.id, e)}
                            disabled={isSettingDefault || isLoading}
                            title="Set as default"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDelete(preset.id, e)}
                          disabled={isDeleting || isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Close
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
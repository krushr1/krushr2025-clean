/**
 * LayoutManager - UI controls for saving and loading workspace layouts
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Badge } from '../ui/badge'
import {
  Save,
  FolderOpen,
  Settings2,
  Star,
  Trash2,
  Download,
  Upload,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { useLayoutPersistence } from '../../hooks/use-layout-persistence'
import { cn } from '../../lib/utils'

interface LayoutManagerProps {
  workspaceId: string
  panels: any[]
  className?: string
}

export default function LayoutManager({ workspaceId, panels, className }: LayoutManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    isDefault: false
  })

  const {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    setDefaultPreset,
    performAutoSave,
    isSaving,
    isLoading,
    isDeleting,
    isSettingDefault,
    isAutoSaving,
    refetchPresets
  } = useLayoutPersistence({
    workspaceId,
    panels,
    enabled: true
  })

  const handleSavePreset = () => {
    if (!saveForm.name.trim()) return

    savePreset(saveForm.name.trim(), saveForm.description.trim() || undefined, saveForm.isDefault)
    
    // Reset form and close dialog
    setSaveForm({ name: '', description: '', isDefault: false })
    setSaveDialogOpen(false)
  }

  const handleLoadPreset = (presetId: string) => {
    loadPreset(presetId)
    setLoadDialogOpen(false)
  }

  const handleDeletePreset = (presetId: string) => {
    deletePreset(presetId)
  }

  const handleSetDefault = (presetId: string) => {
    setDefaultPreset(presetId)
  }

  const handleManualSave = () => {
    performAutoSave()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const hasUnsavedChanges = panels.length > 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {/* Manual save button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualSave}
        disabled={!hasUnsavedChanges || isAutoSaving}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">Save Now</span>
      </Button>

      {/* Save as preset */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={panels.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save Layout</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Layout Preset</DialogTitle>
            <DialogDescription>
              Save your current panel arrangement as a reusable layout preset.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <FloatingInput
                id="preset-name"
                label="Preset Name"
                value={saveForm.name}
                onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="preset-description">Description (Optional)</Label>
              <Textarea
                id="preset-description"
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this layout arrangement..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-default"
                checked={saveForm.isDefault}
                onChange={(e) => setSaveForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is-default" className="text-sm">
                Set as default layout for this workspace
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePreset}
              disabled={!saveForm.name.trim() || isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load preset */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={presets.length === 0}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Load Layout</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Layout Preset</DialogTitle>
            <DialogDescription>
              Choose a saved layout to restore your panel arrangement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved layout presets yet.</p>
                <p className="text-sm">Save your current layout to get started.</p>
              </div>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{preset.name}</h4>
                      {preset.isDefault && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {preset.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Created {formatDate(preset.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadPreset(preset.id)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                    
                    {!preset.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(preset.id)}
                          disabled={isSettingDefault}
                          className="text-orange-600 hover:text-orange-700"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Layout Preset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{preset.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePreset(preset.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setLoadDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Layout Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => refetchPresets()}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Refresh Presets
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
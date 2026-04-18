import { SparklesIcon } from 'lucide-react'
import { PanePlaceholder } from '@/components/workbench/panes/PanePlaceholder'

/**
 * Right pane — replaced in M2 (Assistant v0) by the side-pane assistant
 * built on AI Elements `Conversation`, `Message`, `PromptInput` etc.
 */
export function AssistantPanePlaceholder() {
  return (
    <PanePlaceholder
      icon={<SparklesIcon className="size-5" aria-hidden />}
      title="Assistant"
      milestone="M2"
      description="Your context-aware AI assistant will live here. It'll see whatever you have in focus and let you save, take notes, or build protocols by chat."
    />
  )
}

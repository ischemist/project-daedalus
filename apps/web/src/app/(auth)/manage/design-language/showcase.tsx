import { ButtonsSection } from "./buttons-section"
import { InteractionSection } from "./interaction-section"

export function ShowcasePage() {
  return (
    <div className="bg-background">
      <div className="space-y-16">
        <ButtonsSection />
        <InteractionSection />
      </div>
    </div>
  )
}

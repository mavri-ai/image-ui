import { GenerationCard } from '../components/image-ui/generation-card'
import { useDemoGeneration } from '../demo/use-demo-generation'

export default function Example() {
  const job = useDemoGeneration('idle')
  return (
    <GenerationCard
      title="Desert study"
      status={job.status}
      progress={job.progress}
      src={`${import.meta.env.BASE_URL}images/dunes.jpg`}
      alt="Golden dunes in afternoon light"
      onGenerate={job.run}
      onRetry={job.run}
      onCancel={job.cancel}
    />
  )
}

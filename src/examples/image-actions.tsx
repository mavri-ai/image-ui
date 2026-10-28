import { ImageActions } from '../components/image-ui/image-actions'

export default function Example() {
  return (
    <ImageActions
      src={`${import.meta.env.BASE_URL}images/dunes.jpg`}
      alt="Golden dunes in afternoon light"
      fileName="desert-study.jpg"
    />
  )
}

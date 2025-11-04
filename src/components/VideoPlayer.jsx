export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl) return null

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video">
        <video
          controls
          className="w-full h-full"
          src={videoUrl}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    </div>
  )
}

const cells = Array.from({ length: 432 }, (_, index) => (index % 24) + Math.floor(index / 24))

export function GenerationShimmer() {
  return (
    <div className="iu-drive-matrix iu-drive-loading" aria-hidden="true">
      {cells.map((diagonal, index) => (
        <span key={index} style={{ animationDelay: `${diagonal * 0.035}s` }} />
      ))}
    </div>
  )
}

interface DilemmaCardProps {
  text: string
  category: string
}

const CATEGORY_LABELS: Record<string, string> = {
  dinero: 'Dinero',
  familia: 'Familia',
  trabajo: 'Trabajo',
  amistad: 'Amistad',
  sociedad: 'Sociedad',
  amor: 'Amor',
}

export default function DilemmaCard({ text, category }: DilemmaCardProps) {
  return (
    <div className="bg-surface-light border border-surface-lighter rounded-2xl p-6 shadow-xl">
      <span className="inline-block px-3 py-1 text-xs font-medium bg-brand-400/20 text-brand-300 rounded-full mb-4">
        {CATEGORY_LABELS[category] ?? category}
      </span>
      <p className="text-xl leading-relaxed font-medium">{text}</p>
    </div>
  )
}

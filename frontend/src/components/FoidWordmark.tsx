interface FoidWordmarkProps {
  /** Fill colour for all letters. Default: '#18181b' */
  color?: string
  /** Height of the wordmark in px. Width scales proportionally. Default: 24 */
  height?: number
  /** Extra class names on the wrapper */
  className?: string
}

/**
 * The FOID logotype as four inline SVG letter-paths.
 * Use instead of any plain-text "Foid" / "FOID" wordmark.
 */
export default function FoidWordmark({
  color = '#18181b',
  height = 24,
  className = '',
}: FoidWordmarkProps) {
  // Original viewBox dimensions per letter
  const letters = [
    // F  — 328 × 430
    { w: 328, h: 430, d: 'M0 429.494V-29.1875H327.258V61.8982H104.098V193.972L312.294 180.96V273.347L104.098 286.359V429.494H0Z' },
    // O  — 371 × 342
    { w: 371, h: 342, d: 'M0 170.46C0 55.9526 81.9771 0 185.424 0C288.221 0 370.198 55.9526 370.198 170.46C370.198 285.619 288.221 341.571 185.424 341.571C81.9771 341.571 0 285.619 0 170.46ZM104.098 170.46C104.098 225.762 135.978 250.486 185.424 250.486C234.22 250.486 266.1 225.762 266.1 170.46C266.1 115.809 234.22 91.0857 185.424 91.0857C135.978 91.0857 104.098 115.809 104.098 170.46Z' },
    // I  — 287 × 430
    { w: 287, h: 430, d: 'M134.677 68.4043C96.2906 68.4043 73.5191 50.1872 73.5191 16.3553C73.5191 -16.8259 96.2906 -35.6936 134.677 -35.6936C173.063 -35.6936 197.135 -16.8259 197.135 16.3553C197.135 50.1872 173.063 68.4043 134.677 68.4043ZM0 429.494V338.408H93.0375V188.117L13.0122 192.021V100.935L136.629 94.4288C173.063 92.477 193.232 112.646 193.232 149.08V338.408H286.269V429.494H0Z' },
    // D  — 383 × 436
    { w: 383, h: 436, d: 'M382.56 429.494H278.462V409.325L297.98 350.77H271.956C255.04 394.361 223.81 436 142.484 436C47.4947 436 0 357.927 0 264.889C0 171.852 47.4947 94.4288 142.484 94.4288C223.81 94.4288 255.04 136.068 271.956 179.659H297.98L278.462 121.104V-48.7058H382.56V429.494ZM278.462 264.889C278.462 209.587 247.232 185.514 191.28 185.514C135.327 185.514 104.098 209.587 104.098 264.889C104.098 320.191 135.327 344.914 191.28 344.914C247.232 344.914 278.462 320.191 278.462 264.889Z' },
  ]

  // Use the tallest source glyph (430) as the reference height so all letters
  // are drawn on the same baseline. Scale factor maps that reference → `height`.
  const REF_H = 430
  const scale = height / REF_H

  return (
    <span
      className={`inline-flex items-end ${className}`}
      style={{ gap: height * 0.06, lineHeight: 0 }}
      aria-label="Foid"
    >
      {letters.map((l, i) => (
        <svg
          key={i}
          width={l.w * scale}
          height={l.h * scale}
          viewBox={`0 0 ${l.w} ${l.h}`}
          fill="none"
          aria-hidden="true"
        >
          <path d={l.d} fill={color} />
        </svg>
      ))}
    </span>
  )
}

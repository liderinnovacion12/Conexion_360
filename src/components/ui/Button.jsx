import { useRef } from 'react'

// Botón con efecto ripple y variantes de marca.
export default function Button({
  children,
  variant = 'default',
  size,
  icon: Icon,
  type = 'button',
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  const onClick = (e) => {
    const el = ref.current
    if (el) {
      const circle = document.createElement('span')
      const d = Math.max(el.clientWidth, el.clientHeight)
      const rect = el.getBoundingClientRect()
      circle.className = 'ripple'
      circle.style.width = circle.style.height = `${d}px`
      circle.style.left = `${e.clientX - rect.left - d / 2}px`
      circle.style.top = `${e.clientY - rect.top - d / 2}px`
      el.appendChild(circle)
      setTimeout(() => circle.remove(), 600)
    }
    rest.onClick?.(e)
  }

  const cls = [
    'btn',
    variant !== 'default' && `btn--${variant}`,
    size && `btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} type={type} {...rest} onClick={onClick} className={cls}>
      {Icon && <Icon />}
      {children}
    </button>
  )
}

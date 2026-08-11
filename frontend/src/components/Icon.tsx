interface IconProps {
  name: string;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Material Symbols Outlined icon wrapper.
 */
export function Icon({ name, size = 18, className = "", title }: IconProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
}
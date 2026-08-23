/**
 * The platform's own chevron, path lifted verbatim from a live instance:
 * 16x16 in a 0 0 16 16 viewBox, sitting in an 18px box. Pointing down when
 * expanded, rotated a quarter turn when collapsed, which is what the
 * navigator does.
 */
export default function Chevron({ open }: { open: boolean }) {
  return (
    <span className="chevbox" data-open={open} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" focusable="false">
        <path d="M2.162 5.131a.5.5 0 0 1 .707.031L8 10.76l5.131-5.598a.5.5 0 0 1 .738.676l-5.5 6a.5.5 0 0 1-.738 0l-5.5-6a.5.5 0 0 1 .031-.707" />
      </svg>
    </span>
  );
}

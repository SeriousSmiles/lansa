
interface ProfileFooterProps {
  coverColor: string;
}

export function ProfileFooter({ coverColor }: ProfileFooterProps) {
  return (
    <footer 
      className="text-center py-6 text-sm animate-fade-in"
      style={{ color: `${coverColor}90` }}
    >
      © 2025 Lansa N.V.
    </footer>
  );
}

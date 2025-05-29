
interface ProfileFooterProps {
  coverColor: string;
}

export function ProfileFooter({ coverColor }: ProfileFooterProps) {
  return (
    <footer 
      className="w-full text-center py-6 text-sm animate-fade-in"
      style={{ 
        backgroundColor: coverColor,
        color: "#FFFFFF"
      }}
    >
      © 2025 Lansa N.V.
    </footer>
  );
}

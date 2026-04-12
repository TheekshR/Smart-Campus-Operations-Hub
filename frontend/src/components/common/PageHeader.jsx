export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

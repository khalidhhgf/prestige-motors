export function JsonLd({ data }: { data: unknown }) {
  // `<` escaped to prevent </script> breakout from user-provided strings
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

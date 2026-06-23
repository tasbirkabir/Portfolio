"use client";

/**
 * Renders one or more JSON-LD structured-data blocks in the document head.
 * Each schema object is rendered as a separate <script type="application/ld+json"> tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Fallback CSS (minimal) to avoid raw HTML if main CSS fails */}
      <link rel="stylesheet" href="/base-fallback.css" />
      <noscript>
        <link rel="stylesheet" href="/base-fallback.css" />
      </noscript>
    </>
  )
}



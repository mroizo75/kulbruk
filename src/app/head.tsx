export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Kulbruk – Markedsplass</title>
      <meta name="description" content="Kjøp og selg på Kulbruk – Finn biler, eiendom og alt til torget." />
      <meta name="theme-color" content="#0ea5e9" />
      <meta property="og:site_name" content="Kulbruk" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Kulbruk – Markedsplass" />
      <meta property="og:description" content="Kjøp og selg på Kulbruk – Finn biler, eiendom og alt til torget." />
      <meta property="og:image" content="/logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
      {/* Fallback CSS (minimal) to avoid raw HTML if main CSS fails */}
      <link rel="stylesheet" href="/base-fallback.css" />
      <noscript>
        <link rel="stylesheet" href="/base-fallback.css" />
      </noscript>
    </>
  )
}



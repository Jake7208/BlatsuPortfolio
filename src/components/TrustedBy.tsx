import React from 'react'

/** Client logos, sized as drawn in the design (all 55px tall). */
const clients = [
  { name: 'Ranker', src: '/logos/ranker.png', width: 263 },
  { name: 'Yen Press', src: '/logos/yen-press.svg', width: 76 },
  { name: 'Azuki', src: '/logos/azuki.png', width: 148 },
  { name: 'J-Novel Club', src: '/logos/j-novel-club.png', width: 263 },
  { name: 'Yen Audio', src: '/logos/yen-audio.svg', width: 88 },
  { name: 'IZE Press', src: '/logos/ize-press.svg', width: 84 },
  { name: 'Grand Archive', src: '/logos/grand-archive.png', width: 142 },
  { name: 'Anime News Network', src: '/logos/anime-news-network.svg', width: 128 },
  { name: 'TOKYOPOP', src: '/logos/tokyopop.png', width: 296 },
]

function Track({ clone = false }: { clone?: boolean }) {
  return (
    <ul className="trusted-track" aria-hidden={clone || undefined}>
      {clients.map((client) => (
        <li key={client.name}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static logo, no optimization needed */}
          <img
            src={client.src}
            alt={clone ? '' : client.name}
            width={client.width}
            height={55}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )
}

/**
 * The logo strip runs wider than the viewport in the design, so it scrolls.
 * The second track is a visual clone that makes the loop seamless — under
 * `prefers-reduced-motion` the animation stops and the strip scrolls by hand.
 */
export default function TrustedBy() {
  return (
    <section className="trusted" aria-labelledby="trusted-title">
      <p className="trusted-title" id="trusted-title">
        Trusted By Industry Leaders
      </p>
      <div className="trusted-strip">
        <Track />
        <Track clone />
      </div>
    </section>
  )
}

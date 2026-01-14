# OSRS Boss Wheel

A spin-the-wheel application for deciding which OSRS boss to fight. Built with Bun, TypeScript, and Canvas API.

## Features

- 🎡 Smooth wheel spinning animation with easing
- 🎵 Procedurally generated sound effects
- 🎨 OSRS-themed UI with custom fonts
- 📋 Copy wiki links to clipboard
- 🔧 Three configurations: Team, Duos, and Solos
- 🖼️ Boss images with aspect ratio preservation
- 🎲 Weighted random selection

## Project Structure

```
osrs-wheel/
├── public/           # Static assets
│   ├── index.html    # Main HTML file
│   ├── styles.css    # Styles
│   └── osrs.ttf      # OSRS font
├── src/              # Source code
│   ├── app.ts        # Main application logic
│   ├── sound.ts      # Sound generation
│   └── config/       # Boss configurations
│       ├── config-base.ts
│       ├── config-team.ts
│       ├── config-duos.ts
│       └── config-solos.ts
├── index.ts          # Development server
└── build.ts          # Build script
```

## Development

Install dependencies:
```bash
bun install
```

Run development server:
```bash
bun run dev
```

Open http://localhost:3000

## Building

Build for production:
```bash
bun run build
```

This creates a `dist/` folder with static files ready for deployment.

## Running Built Version

Serve the built static files from the `dist/` folder:

```bash
bun --bun serve dist
```

Or use any static file server:
```bash
cd dist
python3 -m http.server 8000
```

## Deployment

The `dist/` folder contains static files that can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- etc.

## Customization

### Adding Bosses

Edit the config files in `src/config/`:
- `config-team.ts` - Team bosses
- `config-duos.ts` - Duo bosses
- `config-solos.ts` - Solo bosses

### Visual Configuration

Edit the `WHEEL_CONFIG` object in `src/app.ts` to customize:
- Segment colors
- Image sizing
- Center circle appearance
- Text styling

## License

Private project

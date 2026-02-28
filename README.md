# Aaron's Portfolio

An interactive portfolio website built with React, Three.js, and Spring Boot. Features a 3D character, chat interface, and responsive design.

## Tech Stack

**Frontend:**
- Vite + React + TypeScript
- Three.js with React Three Fiber and Drei
- Responsive 3-column layout with frosted glass UI

**Backend:**
- Spring Boot 3.2 with Java 21
- Maven with frontend-maven-plugin for automated builds
- REST API with CORS support

## Quick Start

### Development

From the **`server`** directory, run a single command to start both the backend and Vite dev server:

```bash
cd server
mvn spring-boot:run
```

This command:
1. Installs Node.js + npm locally (no global Node required)
2. Installs frontend dependencies via `npm install` in `../client`
3. Starts the Vite dev server on `http://localhost:5173` with `--host`
4. Starts Spring Boot backend on `http://localhost:8080`

Then open **`http://localhost:5173`** in your browser.

### Production Build

Build the production artifact from the **`server`** directory:

```bash
cd server
mvn -Pprod package
```

This command:
1. Installs Node.js + npm locally
2. Runs `npm ci` in `../client`
3. Builds the React app with Vite: `npm run build` → `client/dist`
4. Copies `client/dist` into `server/src/main/resources/static`
5. Packages a runnable Spring Boot JAR

Run the JAR:

```bash
java -jar target/aaron-portfolio-server-1.0.0.jar
```

Then open **`http://localhost:8080`** to view the app. The React frontend is served at `/`, and the API is available at `/api/*`.

## File Structure

```
aaron-portfolio/
├── client/                   # Vite React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components (Sidebar, ChatPanel, CharacterPanel)
│   │   ├── App.tsx           # Main 3-column layout
│   │   └── index.css         # Global styles with CSS variables
│   ├── public/
│   │   └── models/
│   │       └── aaron.glb     # 3D character model (place your GLB here)
│   └── package.json
├── server/                   # Spring Boot Maven backend
│   ├── src/main/java/
│   │   └── com/aaron/portfolio/
│   │       ├── PortfolioApplication.java
│   │       ├── controller/   # REST endpoints
│   │       └── service/      # Business logic (ChatService)
│   ├── src/main/resources/
│   │   ├── application.yml   # Spring config, CORS, OpenAI placeholder
│   │   └── static/           # Prod build: React app served here
│   └── pom.xml               # Maven config with frontend plugin & prod profile
├── .gitignore
└── README.md
```

## 3D Model

Place your GLB 3D model at:

```
client/public/models/aaron.glb
```

### Animation Support

The 3D character component supports animations:

- **Idle (default):** Loops automatically. Found by exact name match "Idle" or fallback to first animation.
- **Flinch (click):** Plays once on character click, then returns to Idle. Found by "Flinch" or fallback to second animation.

If your model has no animations, the component provides fallbacks:
- **Idle fallback:** Subtle bobbing and swaying via `useFrame`.
- **Flinch fallback:** Quick shake/rotate for ~0.25s.

### Responsive Behavior

- On desktop (900px+): 3-column layout (sidebar | chat | 3D)
- On mobile (<900px): Stacked layout with horizontal sidebar at top

## Styling

### Background Color

Change the main background color via CSS variable:

```css
:root {
  --main-bg: #5CC8FF;  /* Default vibrant cyan-blue */
}
```

Modify in `client/src/index.css`.

### Frosted Glass UI

The chat panel uses CSS backdrop-filter for a frosted glass effect. Customize in `client/src/components/ChatPanel.css`.

## Chat API

### Endpoint

```
POST /api/chat
Content-Type: application/json

{
  "message": "Tell me about your projects"
}
```

### Response

```json
{
  "reply": "I've worked on several exciting projects..."
}
```

### Built-in Logic

The stub `ChatService` responds with:
- **Projects query:** Summary of sample projects
- **Skills query:** Summary of sample skills
- **Default:** Echo the message with a follow-up question

### Hooking Real AI (OpenAI)

1. Set the environment variable:
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

2. Uncomment and modify the commented OpenAI integration in `server/src/main/java/com/aaron/portfolio/service/ChatService.java`.

3. The `application.yml` already includes:
   ```yaml
   openai:
     apiKey: ${OPENAI_API_KEY:}
   ```

## Frontend Proxy

During dev, the Vite server proxies `/api/*` requests to `http://localhost:8080`. Configured in `client/vite.config.ts`.

## Deployment

### Via Maven

After building with `mvn -Pprod package`, the JAR includes the React frontend in its static resources. Simply:

```bash
java -jar target/aaron-portfolio-server-1.0.0.jar
```

The app is fully self-contained.

### Environment Variables

- `OPENAI_API_KEY` – (Optional) For real AI chat. Leave unset for stub responses.

## Development Notes

- **Java 21** required for Spring Boot 3.2
- **TypeScript** compiles cleanly; no TODOs in core functionality
- **Animations** are optional; fallbacks ensure smooth experience even without GLB
- **CORS** enabled for `http://localhost:5173` in dev; adjust in `server/src/main/resources/application.yml`

## License

See [LICENSE](LICENSE) file.

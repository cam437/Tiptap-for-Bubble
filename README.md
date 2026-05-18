Rich Text Editor (Tiptap.dev) — Bubble.io Plugin
A full-featured rich text editor for Bubble.io built on Tiptap v3. Drop it into any Bubble app and get a modern editing experience — formatting, tables, images, collaboration, and 55+ editor actions — without writing a line of code inside Bubble.

Install the plugin · Live demo

Why use this plugin?
Bubble's built-in rich text editor is limited. This plugin gives you:

Built-in formatting toolbar — Full suite of formatting buttons that auto-hide when their extension is disabled. Includes headings dropdown, color pickers, font/size selectors, table grid inserter, and more. Styled with the Flourish dark theme. No workflow wiring needed
Full formatting — Bold, italic, underline, strikethrough, highlight, text color, font family, font size, subscript, superscript
Structure — Headings (H1–H6), blockquotes, code blocks, horizontal rules, collapsible details/accordion sections
Lists — Bullet, numbered, and task/checklist lists with indent/outdent
Tables — Insert, resize, merge/split cells, toggle header rows and columns
Media — Images (inline or block) and YouTube embeds
Links — With custom styling and configurable protocols
Inline comments — Tag text selections with comment IDs, toolbar buttons for add/remove with events for Bubble workflow integration
Menus — Built-in toolbar, bubble menu (on text selection), and floating menu
Real-time collaboration — Via Tiptap Cloud, custom Hocuspocus server, or Liveblocks, with cursor labels, connection status, and JWT auth
Output formats — HTML, plain text, and JSON — all exposed as Bubble states
55+ workflow actions — Control the editor programmatically from Bubble workflows
Keyboard & Markdown shortcuts — Standard editor shortcuts plus Markdown-style triggers
Fully customizable — CSS overrides for every element (including the toolbar), per-extension toggles, debug mode
Fork & develop locally
Want to customize the plugin, add extensions, or contribute? Here's how to get your own copy running.

1. Fork the plugin in Bubble
Open the plugin page in Bubble and click Fork. This creates your own copy of the plugin under your Bubble account.

2. Get the plugin editor URL
Open your forked plugin in the Bubble plugin editor. Copy the URL from your browser's address bar — it will look something like:

https://bubble.io/plugin_editor?id=1234567890x987654321
3. Install Pled
Pled is a CLI that lets you pull Bubble plugin source code to local files, edit with any editor or AI agent, and push back.

Download the latest archive for your platform from the Pled releases page:

Platform	Archive
macOS (Apple Silicon)	pled-macos-arm.tar.gz
macOS (Intel)	pled-macos-x86.tar.gz
Linux (ARM)	pled-linux-arm.tar.gz
Linux (x86)	pled-linux-x86.tar.gz
Windows	pled-windows.zip
Extract and move the pled binary to your PATH:

# Example for macOS Apple Silicon
tar -xzf pled-macos-arm.tar.gz
sudo mv pled /usr/local/bin/pled
See the Pled repo for full setup details.

4. Set your Bubble cookie
Pled authenticates with Bubble using your browser session cookie. Export it as an environment variable:

export BUBBLE_COOKIE="your_bubble_session_cookie_here"
To get your cookie: open the Bubble plugin editor → open browser DevTools → Application tab → Cookies → copy the full cookie string. See the Pled README for detailed instructions.

Tip: Add the export to your shell profile (~/.zshrc, ~/.bashrc, etc.) so it persists across sessions.

5. Clone this repo and initialize
git clone https://github.com/YOUR_USERNAME/tiptap.git
cd tiptap

# Point Pled at your forked plugin
pled init https://bubble.io/plugin_editor?id=YOUR_PLUGIN_ID

# Pull the latest plugin source from Bubble
pled pull
This decodes the plugin into editable JavaScript files under src/.

6. Make changes and push
Edit any file in src/, then push your changes back to Bubble:

pled push
Or use watch mode to auto-push on every save:

pled watch
That's it. Open your Bubble app, and the plugin reflects your changes.

Project structure
src/
├── actions/                           # Server-side actions
│   ├── generate-auth-token-AEK/      # JWT auth token generation
│   └── convert-webhook-payload.../    # Hocuspocus webhook → HTML
├── elements/
│   └── tiptap-AAC/                    # Main editor element
│       ├── actions/                   # 55+ element actions (bold, italic, tables, etc.)
│       ├── initialize.js              # Editor setup, toolbar, and configuration
│       ├── update.js                  # Property change handling
│       ├── preview.js                 # Bubble editor preview
│       ├── fields.txt                 # Element property reference
│       └── reset.js                   # Teardown and cleanup
├── plugin.json                        # Plugin metadata and field definitions
└── shared.html                        # Shared HTML resources
lib/
├── index.js                           # Library imports → window.tiptap namespace
├── package.json                       # npm dependencies (Tiptap, Hocuspocus, etc.)
└── dist.js                            # Bundled output (uploaded to Bubble CDN)
Native formatting toolbar
The editor includes a built-in toolbar pinned above the editor content. It is enabled by default via the **Show toolbar** property.

**Buttons auto-hide** based on which extensions are enabled. If you disable Bold (`ext_bold`), the bold button disappears. Groups with zero visible buttons hide entirely along with their divider.

**Toolbar groups** (in order): Text formatting, Color, Font, Headings, Lists, Blocks, Insert, Links, Alignment, Comments, History, Other.

**Dropdowns**: Color picker (swatches + custom), font family list, font size list, heading level selector (respects the `headings` property), URL inputs for links/images/YouTube, and a table grid selector.

**Comment buttons** fire events instead of executing actions directly:
- **Add comment** fires `toolbar_add_comment` (greyed out when no text is selected). Your Bubble workflow generates a comment ID and calls the `add_comment` action.
- **Remove comment** fires `toolbar_remove_comment` (greyed out when cursor is not inside a comment). Your Bubble workflow handles cleanup.

**CSS override**: Use the **Toolbar CSS override** (`toolbar_adv`) property to inject custom styles.

**Keyboard shortcuts** continue to work via Tiptap extension defaults (Cmd+B, Cmd+I, etc.). Toolbar buttons mirror but do not replace them.

**Collaboration**: Undo/redo buttons auto-hide when collaboration is active, since history is disabled in collab mode.

Library management
All Tiptap libraries are centralized in lib/index.js, bundled into a single file, and exposed on window.tiptap for use in initialize.js and update.js.

To add a new library:

Add the import to lib/index.js and expose it on window.tiptap
Bundle: npm run build
Upload: pled upload dist.js
Use the returned CDN URL in the element's headers.html
Access it in initialize.js / update.js via window.tiptap
Commands
Command	What it does
pled pull	Pull latest plugin source from Bubble
pled push	Push local changes to Bubble
pled watch	Auto-push on file save
npm run build	Bundle lib/index.js → dist.js
pled upload dist.js	Upload bundled libraries to Bubble CDN
Changelog
See CHANGELOG.md for release history.

License
This plugin is available on the Bubble plugin marketplace. Fork and modify freely.
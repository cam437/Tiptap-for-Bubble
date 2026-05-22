Rich Text Editor (Tiptap.dev) — Bubble.io Plugin
A full-featured rich text editor for Bubble.io built on Tiptap v3. Drop it into any Bubble app and get a modern editing experience — formatting, tables, images, collaboration, and 55+ editor actions — without writing a line of code inside Bubble.

Install the plugin · Live demo

Why use this plugin?
Bubble's built-in rich text editor is limited. This plugin gives you:

Built-in formatting toolbar — Single-row toolbar with dropdown grouping for lists, insert blocks, and alignment. Styled with the Flourish dark theme. No workflow wiring needed
Full formatting — Bold, italic, underline, strikethrough, highlight
Structure — Headings (H1–H6), blockquotes, code blocks, horizontal rules
Lists — Bullet, numbered, and task/checklist lists with indent/outdent (collapsed into a single dropdown)
Tables — Insert via grid selector, resize, merge/split cells, toggle header rows and columns
Media — Images and YouTube embeds (via the Insert dropdown)
Links — With custom styling and configurable protocols
Inline comments — Tag text selections with comment IDs, automatic detection when comment marks are deleted or restored (undo), with events for Bubble workflow integration
Menus — Built-in toolbar, bubble menu (on text selection), and floating menu
Real-time collaboration — Via Tiptap Cloud, custom Hocuspocus server, or Liveblocks, with cursor labels, connection status, and JWT auth
Output formats — HTML, plain text, and JSON — all exposed as Bubble states
55+ workflow actions — Control the editor programmatically from Bubble workflows
Keyboard & Markdown shortcuts — Standard editor shortcuts plus Markdown-style triggers
Fully customizable — Independent toolbar and content padding/background controls, CSS overrides for every element, per-extension toggles, debug mode
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

**Toolbar layout** (left to right):

```
B  I  U  S  Highlight  |  [H▾]  |  [List▾]  |  [Insert▾]  |  Link  |  [Align▾]  |  Comment  |  Undo  Redo
```

**Groups:**

| Group | Behaviour |
|---|---|
| **Text formatting** | Bold, Italic, Underline, Strikethrough, Highlight — individual toggle buttons, always visible |
| **Headings** | Single dropdown (`H▾`). Shows the active heading level in the trigger. Lists Paragraph + H1–H6 based on the `headings` property |
| **Lists** | Single dropdown. Trigger icon reflects the active list type (bullet, numbered, or checklist). Contains: Bullet list, Numbered list, Checklist, Indent, Outdent. Indent/Outdent are disabled when not in a list context |
| **Insert** | Single dropdown with a `+` trigger icon. Contains: Blockquote, Code block, Divider, Image (URL input), Video (URL input), Table (grid selector). Items with secondary input open an inline sub-panel |
| **Link** | Single button. Opens a URL input dropdown. Unlink is handled contextually inside the link popover, not in the toolbar |
| **Alignment** | Single dropdown. Trigger icon reflects the active alignment. Contains: Left, Center, Right, Justify |
| **Comment** | Single button. Fires the `toolbar_add_comment` event (greyed out when no text is selected). Comment removal is handled contextually, not via the toolbar |
| **Undo / Redo** | Pair on the far right. Auto-hide when collaboration is active |

All dropdowns match the same visual treatment: chevron affordance, active-state highlighting, and hover/focus states.

**Comment workflow integration:**

The **Add comment** toolbar button fires `toolbar_add_comment`. Your Bubble workflow generates a comment ID and calls the `add_comment` action.

When a comment mark is fully deleted from the document — whether by text deletion, content overwrite, or programmatic removal — the plugin publishes the `removed_comment_id` state and fires the `comment_removed` event. If the comment reappears (e.g. via undo), the plugin publishes `restored_comment_id` and fires `comment_restored`. Use these events to keep your comment database in sync.

| Event | State to read | When it fires |
|---|---|---|
| `comment_clicked` | `active_comment_id` | Cursor enters a commented region |
| `toolbar_add_comment` | — | User clicks the Comment toolbar button |
| `comment_removed` | `removed_comment_id` | A comment mark is fully removed from the document |
| `comment_restored` | `restored_comment_id` | A previously-removed comment mark reappears (e.g. undo) |

Toolbar and content styling
The toolbar and content area are independent siblings inside the editor root. Each has its own padding and background — changing one has zero effect on the other.

**Toolbar properties:**

| Property | Default | Description |
|---|---|---|
| `toolbar_bg` | `#0D0A0F` (dark surface) | Toolbar background colour |
| `toolbar_padding_top` | `6px` | Top padding inside the toolbar |
| `toolbar_padding_right` | `8px` | Right padding inside the toolbar |
| `toolbar_padding_bottom` | `6px` | Bottom padding inside the toolbar |
| `toolbar_padding_left` | `8px` | Left padding inside the toolbar |

**Content properties:**

| Property | Default | Description |
|---|---|---|
| `content_padding_top` | `0px` | Top padding inside the content area |
| `content_padding_right` | `0px` | Right padding inside the content area |
| `content_padding_bottom` | `0px` | Bottom padding inside the content area |
| `content_padding_left` | `0px` | Left padding inside the content area |

**CSS override**: Use the **Toolbar CSS override** (`toolbar_adv`) property to inject custom styles beyond these properties.

**Keyboard shortcuts** continue to work via Tiptap extension defaults (Cmd+B, Cmd+I, etc.). Toolbar buttons mirror but do not replace them.

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

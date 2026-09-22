# NextGenMediaCo website

A free-to-host website with an admin panel for editing prices, portfolio, FAQ and more.

## What's in this folder

| File or folder | What it is |
|---|---|
| `index.html`, `work.html`, `services.html`, `pricing.html`, `about.html`, `careers.html`, `contact.html` | The main pages |
| `terms.html`, `privacy.html`, `refund.html` | Policy pages (needed for payment gateways) |
| `content/` | Your editable content (prices, portfolio, FAQ...). Edited through the admin panel |
| `admin/` | The admin panel at `yoursite.in/admin` |
| `css/style.css` | All colours, fonts and design |
| `js/main.js` | Animations and content loading |

To preview: double-click `index.html`. Everything works except the contact form, which only works once the site is live on Netlify.

## One-time setup (about an hour)

### 1. Put the site on GitHub
1. Create a free account at github.com.
2. Create a new repository named `nextgenmediaco` (Public or Private both work).
3. Click **uploading an existing file** and drag in everything inside this folder (not the folder itself). Commit.

### 2. Publish it on Netlify
1. Create a free account at netlify.com and sign in with GitHub.
2. **Add new site > Import an existing project > GitHub**, and pick `nextgenmediaco`.
3. Leave all build settings empty. Click **Deploy**.
4. Your site is live on a `something.netlify.app` address.

### 3. Connect your domain
1. In Netlify: **Domain management > Add a domain** and type `nextgenmediaco.in`.
2. Netlify shows you DNS records or nameservers. Enter them where you bought the domain.
3. HTTPS turns on automatically once the domain connects (can take a few hours).

### 4. Turn on the admin panel
1. Open `admin/config.yml` on GitHub (click it, then the pencil icon) and replace `YOUR-GITHUB-USERNAME` with your GitHub username. Commit.
2. On GitHub: **Settings > Developer settings > OAuth Apps > New OAuth App**.
   - Homepage URL: `https://nextgenmediaco.in`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Create it, then generate a client secret.
3. In Netlify: **Site configuration > Access & security > OAuth > Install provider > GitHub**, and paste the Client ID and Secret.
4. Go to `https://nextgenmediaco.in/admin` and log in with GitHub.

### 5. Contact form
Nothing to set up. Netlify detects the form automatically. Submissions appear under **Forms** in Netlify. Turn on email notifications there so enquiries reach your inbox.

### 6. Make your email addresses work
The site lists info@, hello@ and careers@nextgenmediaco.in. Set up free forwarding to your Gmail with Cloudflare Email Routing or Zoho Mail's free plan, or those emails will bounce.

### 7. Tell Google about the site
Add the site in Google Search Console and submit `https://nextgenmediaco.in/sitemap.xml`.

## Editing content

Go to `yoursite.in/admin`, log in, click **Website content**, pick a section, edit, and click **Publish**. The site updates in about a minute.

| Section | What you can change |
|---|---|
| Pricing plans | Prices, setup fee, features, which plan is "Most popular" |
| Portfolio | Add real Reels by pasting an Instagram or YouTube link |
| Client testimonials | The section stays hidden until you add one |
| FAQ | Questions shown on Services and Pricing |
| Industries | The bubbles |
| Careers | Stipend, tasks, skills, or switch "Hiring right now" off |
| About page | Story, values, founder block (hidden until a name is added) |
| Contact details | Emails, WhatsApp number, address, social links |

**Add your WhatsApp number first.** The WhatsApp chat buttons across the site only appear once it's filled in.

Service descriptions (the four service groups) and policy text live in the HTML files. Edit them on GitHub with the pencil icon, or ask for help.

## Before you go live, check these
- The FAQ answer about ads and websites being "quoted separately", and everything in the three policy pages, were written as sensible defaults. Make sure they match how you actually work, and have the policy pages reviewed if you are unsure.
- The portfolio currently shows **Concept** cards. Replace them with real Reels as soon as you have them.
- Add your business address in Contact details. Payment gateways usually look for it.

# DNS Configuration for createandcolor.aivantageworks.com

## Where to Configure DNS

Go to your domain registrar where you purchased **aivantageworks.com** (e.g., GoDaddy, Namecheap, Google Domains, etc.)

## DNS Records to Add

### Option 1: CNAME Record (Recommended by Vercel)

| Setting | Value |
|---------|-------|
| **Type** | CNAME |
| **Host/Name** | `createandcolor` |
| **Points to/Value** | `cname.vercel-dns.com` |
| **TTL** | `3600` (or Auto) |

### Option 2: A Record (If CNAME doesn't work)

| Setting | Value |
|---------|-------|
| **Type** | A |
| **Host/Name** | `createandcolor` |
| **Points to/Value** | `76.76.21.21` |
| **TTL** | `3600` (or Auto) |

> **Note**: Vercel will show you the exact value to use after you add the domain in their dashboard. Use that value if it's different from above.

## Common Domain Registrars - Where to Find DNS Settings

### GoDaddy
1. Log in to GoDaddy
2. Go to "My Products"
3. Click "DNS" next to aivantageworks.com
4. Click "Add" to add a new record

### Namecheap
1. Log in to Namecheap
2. Click "Domain List"
3. Click "Manage" next to aivantageworks.com
4. Go to "Advanced DNS" tab
5. Click "Add New Record"

### Google Domains
1. Log in to Google Domains
2. Click on aivantageworks.com
3. Go to "DNS" in the left sidebar
4. Scroll to "Custom records"
5. Click "Manage custom records"

### Cloudflare
1. Log in to Cloudflare
2. Select aivantageworks.com
3. Go to "DNS" tab
4. Click "Add record"

## Verification

After adding the DNS record:

1. **Wait**: DNS propagation takes 5 minutes to 48 hours (usually ~30 minutes)

2. **Check propagation**: Use [dnschecker.org](https://dnschecker.org)
   - Enter: `createandcolor.aivantageworks.com`
   - Check if it resolves globally

3. **Test**: Visit https://createandcolor.aivantageworks.com

## What Result Should You See?

After DNS propagation:
- ✅ `createandcolor.aivantageworks.com` should point to your Vercel deployment
- ✅ HTTPS should work automatically (Vercel handles SSL)
- ✅ Your app should load

## Troubleshooting

### DNS not working after 24 hours?
- Double-check the record type (CNAME, not A record initially)
- Verify the host/name is exactly `createandcolor` (no extra dots or spaces)
- Contact your domain registrar support

### "This site can't be reached"?
- DNS hasn't propagated yet - wait longer
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Try from a different device/network

### Vercel shows "Domain not verified"?
- Wait for DNS propagation
- Click "Refresh" in Vercel dashboard
- Re-add the domain in Vercel if needed

## Need Help?

Contact your domain registrar's support team and say:
> "I need to add a CNAME record for the subdomain 'createandcolor' that points to 'cname.vercel-dns.com'"

They should be able to help you add it correctly.

---

**Your Domain**: aivantageworks.com
**Subdomain**: createandcolor.aivantageworks.com
**Platform**: Vercel
**SSL**: Automatic (via Vercel)

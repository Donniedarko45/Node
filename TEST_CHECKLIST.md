# ✅ Nodebase - Testing Checklist

## Database Migration Complete! 🎉

The database has been successfully updated with all new features.

---

## 🧪 Testing Steps

### 1. **Restart Development Server**

If your dev server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Test Workflows**

✅ **Navigate to `/workflows`**
- Should load without errors
- Click "New workflow"
- Should redirect to editor

✅ **Test Editor**
- Should see INITIAL node on canvas
- Click "Add Node" button
- Should open node selector
- Try adding a node (e.g., HTTP Request)
- Should appear on canvas

✅ **Test Node Configuration**
- Click settings icon on a node
- Should open settings panel
- Fill in some fields
- Click "Save Changes"
- Should close panel

✅ **Test Node Connections**
- Drag from INITIAL node's output handle (right side)
- Drop on another node's input handle (left side)
- Should create connection line

✅ **Test Node Deletion**
- Click settings icon on a node (not INITIAL)
- Click "Delete"
- Should remove node and connections

### 3. **Test Credentials**

✅ **Navigate to `/credenetials`** (note the typo in URL)
- Should load without errors
- Click "New credential"
- Should open dialog

⚠️ **Premium Feature**
- If you don't have a Polar subscription, you'll see an upgrade modal
- This is expected behavior

✅ **With Premium** (if subscribed)
- Fill in credential form
- Select type (e.g., OpenAI)
- Enter API key
- Click "Create"
- Should appear in list with masked value

### 4. **Test Executions**

✅ **Navigate to `/executions`**
- Should load without errors
- Should show empty state (no executions yet)
- This is expected - execution engine not built yet

---

## 🐛 Common Issues & Fixes

### Issue: "Column does not exist" error

**Fix:**
```bash
npx prisma migrate dev
npx prisma generate
# Restart dev server
```

### Issue: "Module not found" errors

**Fix:**
```bash
npm install
# Restart dev server
```

### Issue: Nodes don't appear in selector

**Fix:**
- Check browser console for errors
- Ensure all node type files are created
- Restart dev server

### Issue: Settings panel doesn't open

**Fix:**
- Check browser console
- Ensure custom event listener is working
- Try refreshing the page

### Issue: "ENCRYPTION_KEY not found"

**Fix:**
- Check `.env` file has `ENCRYPTION_KEY`
- Restart dev server after adding

---

## 🎯 Expected Behavior

### ✅ What Should Work:

1. **Authentication**
   - Sign up / Login
   - Session persistence
   - Protected routes

2. **Workflows**
   - Create new workflows
   - View workflow list
   - Search workflows
   - Delete workflows
   - Open editor

3. **Editor**
   - Load workflow from database
   - Display INITIAL node
   - Add new nodes (10 types)
   - Configure node settings
   - Connect nodes
   - Delete nodes
   - Zoom/pan canvas

4. **Credentials**
   - View credentials list
   - Create credentials (premium)
   - Delete credentials
   - Encrypted storage

5. **Executions**
   - View executions list
   - Empty state (no runs yet)

### ⚠️ What Won't Work Yet:

1. **Saving Node Changes**
   - Changes are in-memory only
   - Refresh loses changes
   - Coming in Phase 2

2. **Running Workflows**
   - No execution engine yet
   - Nodes are visual only
   - Coming in Phase 3

3. **Templating**
   - Variables like `{{ data }}` don't resolve
   - Just displayed as text
   - Coming in Phase 2

4. **Webhook Triggers**
   - Endpoints not implemented
   - Coming in Phase 4

---

## 📊 Database Verification

### Check Tables Exist:

```bash
npx prisma studio
```

Should see these tables:
- ✅ user
- ✅ session
- ✅ account
- ✅ verification
- ✅ Workflow
- ✅ Node
- ✅ Connection
- ✅ execution (NEW)
- ✅ credential (NEW)

### Check Enums:

In Prisma Studio, check Node table:
- `type` field should have 10 options:
  - INITIAL
  - MANUAL_TRIGGER
  - HTTP_REQUEST
  - GOOGLE_FORM_TRIGGER
  - STRIPE_TRIGGER
  - OPENAI
  - GEMINI
  - ANTHROPIC
  - DISCORD
  - SLACK

---

## 🎨 Visual Test

### Editor Should Look Like:

```
┌─────────────────────────────────────────────┐
│  My Workflow              [Add Node] ⚙️     │
├─────────────────────────────────────────────┤
│                                              │
│   ┌──────────────────┐                      │
│   │ 🎯 Start    ⚙️  │                      │
│   │ Initial Node     │                      │
│   └──────────────────┘                      │
│                                              │
│   [Zoom controls]  [Minimap]                │
│                                              │
└─────────────────────────────────────────────┘
```

### Node Selector Should Show:

```
┌─────────────────────────────────┐
│  Add Node                  ✕    │
├─────────────────────────────────┤
│  🔍 Search nodes...             │
│                                  │
│  ┌─────────┬─────────┐         │
│  │Triggers │ Actions │         │
│  └─────────┴─────────┘         │
│                                  │
│  Actions (7)                    │
│                                  │
│  🌐 HTTP Request                │
│  🧠 OpenAI                      │
│  ✨ Anthropic                   │
│  ✨ Gemini                      │
│  💬 Discord                     │
│  💬 Slack                       │
└─────────────────────────────────┘
```

---

## ✅ Success Criteria

Your app is working correctly if:

1. ✅ No console errors on page load
2. ✅ Can create new workflow
3. ✅ Editor loads with INITIAL node
4. ✅ Can open "Add Node" selector
5. ✅ Can add nodes to canvas
6. ✅ Can open node settings
7. ✅ Can connect nodes
8. ✅ Can delete nodes
9. ✅ Credentials page loads
10. ✅ Executions page loads

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add node system, credentials, and executions"
   ```

2. **Start Phase 2: Persistence**
   - Save node changes to database
   - Implement templating system

3. **Or continue exploring**
   - Try all 10 node types
   - Test different configurations
   - Experiment with connections

---

## 💡 Pro Tips

1. **Use Browser DevTools**
   - Open Console (F12) to see errors
   - Check Network tab for API calls
   - Use React DevTools to inspect components

2. **Check Database**
   - Use Prisma Studio to view data
   - Verify workflows are created
   - Check node types are correct

3. **Test Incrementally**
   - Test one feature at a time
   - Don't skip steps
   - Note any issues

4. **Clear Cache if Needed**
   - Hard refresh: Ctrl+Shift+R
   - Clear browser cache
   - Restart dev server

---

**Ready to test? Start with step 1!** 🧪

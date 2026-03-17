import { Router } from "express"

const router = Router()

router.post("/apply", async (req, res) => {
  const { name, email, title, company, bio, linkedin } = req.body

  if (!name || !email || !title || !company || !bio || !linkedin) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  console.log(`[APPLY] New application from: ${name} <${email}> — ${title} at ${company}`)

  return res.json({ success: true, message: "Application received. Our AI review runs in minutes." })
})

export default router

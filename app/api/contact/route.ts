import { NextRequest, NextResponse } from 'next/server'
import { logContactInDrive, isDriveConfigured } from '@/lib/google-drive'
import { sendContactFormNotification } from '@/lib/email'
import { saveContact } from '@/lib/firebase-admin-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, service } = body

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`\n💬 New Contact: ${name}`)

    // Save to Firebase (primary data store)
    try {
      await saveContact({ name, email, phone, message, service })
    } catch (fbError: any) {
      console.error('❌ Firebase save error (non-fatal):', fbError?.message || fbError)
    }

    // Log to Google Drive
    if (isDriveConfigured()) {
      try {
        await logContactInDrive({ name, email, phone, message, service })
        console.log('✅ Contact logged to Google Drive')
      } catch (driveError: any) {
        console.error('❌ Google Drive error (non-fatal):', driveError?.message || driveError)
      }
    }

    // Send email notification
    try {
      console.log('📧 Sending contact notification...')
      await sendContactFormNotification({ name, email, phone, message, service })
      console.log('📧 Contact notification sent ✅')
    } catch (emailError: any) {
      console.error('❌ Email error:', emailError?.message || emailError)
    }

    return NextResponse.json({ success: true, message: 'Message sent!' })
  } catch (error: any) {
    console.error('❌ Error processing contact:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

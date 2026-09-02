import { NextResponse } from "next/server";
import { OffersNotificationTemplate } from "@/components/templates/offers-notification-template";
import { OffersTemplate } from "@/components/templates/offers-template";
import { ContactNotificationTemplate } from "@/components/templates/contact-notification-template";
import { ContactTemplate } from "@/components/templates/contact-template";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || "";
  const FROM_EMAIL = process.env.FROM_EMAIL || "";
  const ALTERNATE_EMAIL = process.env.ALTERNATE_EMAIL || "";

  try {
    const body = await req.json();
    const { 
      type = "offer", // "offer" or "contact"
      userName, 
      phone, 
      whatsapp, 
      email, 
      offerTitle, 
      offerSlug,
      message,
      website_url, // Honeypot field
    } = body;

    // Honeypot Check (Spam Prevention)
    if (website_url) {
      console.log("Spam attempt blocked (Honeypot):", { ip: req.headers.get("x-forwarded-for"), website_url });
      // Return success to fool the bot (Shadow Ban)
      return NextResponse.json({ success: true });
    }

    if (type === "offer") {
      // 1. Send notification to Business Team
      await resend.emails.send({
        from: `Offers Portal <${FROM_EMAIL}>`,
        to: [BUSINESS_EMAIL, ALTERNATE_EMAIL],
        subject: `New Offer Claim: ${offerTitle} from ${userName}`,
        react: OffersNotificationTemplate({
          userName,
          phone,
          whatsapp,
          email,
          offerTitle,
          offerSlug,
        }),
      });

      // 2. Send acknowledgement to User (if email provided)
      if (email) {
        await resend.emails.send({
          from: `Corban Technologies <${FROM_EMAIL}>`,
          to: [email],
          subject: `We've received your claim for: ${offerTitle}`,
          react: OffersTemplate({
            userName,
            offerTitle,
          }),
        });
      }
    } else {
      // General Contact Form
      // 1. Send notification to Business Team
      await resend.emails.send({
        from: `Contact Portal <${FROM_EMAIL}>`,
        to: [BUSINESS_EMAIL, ALTERNATE_EMAIL],
        subject: `New Inquiry from ${userName}`,
        react: ContactNotificationTemplate({
          userName,
          userEmail: email,
          message,
        }),
      });

      // 2. Send acknowledgement to User
      await resend.emails.send({
        from: `Corban Technologies <${FROM_EMAIL}>`,
        to: [email],
        subject: `We've received your message, ${userName}`,
        react: ContactTemplate({
          userName,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

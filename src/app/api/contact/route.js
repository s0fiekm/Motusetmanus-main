

import { Resend } from "resend";

export async function POST(req) {
  try {
    // Kontroller API-nøgle
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY mangler");
      return Response.json(
        { error: "Mailserveren er ikke konfigureret." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();

    const {
      name,
      email,
      phone,
      company_name,
      employees,
      message,
    } = body;

    // Valider obligatoriske felter
    if (!name || !email || !phone || !company_name || !employees) {
      return Response.json(
        { error: "Udfyld venligst alle obligatoriske felter." },
        { status: 400 }
      );
    }

    // Send e-mail
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Ny henvendelse fra ${name}`,
      text: `
Ny henvendelse fra hjemmesiden

Navn: ${name}
Email: ${email}
Telefon: ${phone}
Virksomhed: ${company_name}
Antal ansatte: ${employees}

Besked:
${message || "Ingen besked"}
      `,
    });

    if (error) {
      console.error("Resend-fejl:", error);

      return Response.json(
        { error: "Kunne ikke sende e-mail." },
        { status: 500 }
      );
    }

    console.log("E-mail sendt succesfuldt.");

    return Response.json({ success: true });

  } catch (error) {
    console.error("Kontaktformular fejl:", error);

    return Response.json(
      { error: "Der opstod en fejl. Prøv igen." },
      { status: 500 }
    );
  }
}
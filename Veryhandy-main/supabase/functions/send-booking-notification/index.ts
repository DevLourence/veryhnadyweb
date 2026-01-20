
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// ⚠️ IMPORTANT: Replace this with the actual Admin Email where you want to receive new booking alerts
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        const { bookingId, newStatus, type, rating, comment } = await req.json();

        // Fetch booking details including client profile
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*, profiles:client_id(full_name, email)")
            .eq("id", bookingId)
            .single();

        if (bookingError || !booking) {
            throw new Error("Booking lookup failed");
        }

        const clientEmail = booking.profiles?.email;
        const clientName = booking.profiles?.full_name || "Valued Client";
        const serviceType = booking.service_type;
        const bookingDate = new Date(booking.booking_date).toLocaleString();

        let emailTo = "";
        let subject = "";
        let htmlContent = "";

        // === SCENARIO 1: NEW BOOKING (Notify Admin) ===
        if (type === 'new_booking') {
            if (!ADMIN_EMAIL || ADMIN_EMAIL === "admin@example.com") {
                console.warn("Admin email not configured properly.");
            }
            emailTo = ADMIN_EMAIL;
            subject = `🔔 New Project Request: ${serviceType}`;
            htmlContent = `
            <div style="font-family: sans-serif; color: #334155;">
                <h2 style="color: #2563eb;">New Service Opportunity</h2>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Email:</strong> ${clientEmail}</p>
                <p><strong>Service Requested:</strong> ${serviceType}</p>
                <p><strong>Scheduled For:</strong> ${bookingDate}</p>
                <br/>
                <a href="${SUPABASE_URL}" style="background: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Admin Dashboard</a>
            </div>
        `;
        }
        // === SCENARIO 2: NEW REVIEW (Notify Admin) ===
        else if (type === 'new_review') {
            emailTo = ADMIN_EMAIL;
            subject = `⭐ A Client Left a Review!`;
            htmlContent = `
            <div style="font-family: sans-serif; color: #334155;">
                <h2 style="color: #f59e0b;">New Client Feedback</h2>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Rating:</strong> ${rating} / 5 Stars</p>
                <br/>
                <p style="background: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; font-style: italic;">"${comment}"</p>
                <br/>
                <a href="${SUPABASE_URL}" style="background: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check Reviews</a>
            </div>
            `;
        }
        // === SCENARIO 3: STATUS UPDATE (Notify Client) ===
        else {
            emailTo = clientEmail;
            subject = `Update regarding: ${serviceType}`;

            let statusMessage = "";
            let color = "#3b82f6"; // blue

            switch (newStatus) {
                case 'confirmed':
                    statusMessage = "Good news! Your booking has been confirmed. Our team is preparing for your service.";
                    color = "#10b981"; // emerald
                    break;
                case 'completed':
                    statusMessage = "Service completed! We hope you are satisfied with the results.";
                    color = "#2563eb"; // blue
                    break;
                case 'rejected':
                    statusMessage = "We review all requests carefully. At this time, we cannot fulfill your specific request.";
                    color = "#f43f5e"; // rose
                    break;
                default:
                    statusMessage = `The status of your booking is now: ${newStatus}`;
            }

            htmlContent = `
            <div style="font-family: sans-serif; color: #334155;">
                <h2 style="color: ${color}; text-transform: uppercase;">Booking ${newStatus}</h2>
                <p>Hi ${clientName},</p>
                <p style="font-size: 16px;">${statusMessage}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p><strong>Service:</strong> ${serviceType}</p>
                <p><strong>Date:</strong> ${bookingDate}</p>
                <br/>
                <p style="font-size: 12px; color: #94a3b8;">Thank you for choosing Very Handy Solutions.</p>
            </div>
        `;
        }

        if (!emailTo) {
            throw new Error("Recipient email not found.");
        }

        // Send via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Very Handy <updates@resend.dev>",
                to: [emailTo],
                subject: subject,
                html: htmlContent,
            }),
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.user_message || error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

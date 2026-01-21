
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
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
        const { bookingId, newStatus, type, rating, comment, otp: inputOtp, email, name } = await req.json();

        let recipientEmail = email;
        let displayClientEmail = email;
        let clientName = name || "Valued User";
        let serviceType = "";
        let bookingDate = "";
        let displayOtp = inputOtp;

        // Fetch booking context if needed
        if (type !== 'otp_verification' && type !== 'password_reset' && bookingId) {
            const { data: booking, error: bookingError } = await supabase
                .from("bookings")
                .select("*, profiles:client_id(full_name, email)")
                .eq("id", bookingId)
                .single();

            if (!bookingError && booking) {
                displayClientEmail = booking.profiles?.email;
                clientName = booking.profiles?.full_name || "Valued Client";
                serviceType = booking.service_type;
                bookingDate = new Date(booking.booking_date).toLocaleString();
                recipientEmail = displayClientEmail;
            }
        }

        let subject = "";
        let htmlContent = "";

        // === TEMPLATES ===
        if (type === 'otp_verification') {
            subject = `🔐 Verification Code: ${displayOtp}`;
            htmlContent = `
        <div style="background-color: #f1f5f9; font-family: sans-serif; padding: 40px 0;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">VeryHandy Security</h1>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p>Hello <strong>${clientName}</strong>,</p>
                    <p>Use this code to verify your identity:</p>
                    <div style="background-color: #eff6ff; color: #2563eb; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0;">
                        ${displayOtp}
                    </div>
                     <p style="font-size: 12px; color: #888;">(If testing, this only works if sent to the Resend Admin email)</p>
                </div>
            </div>
        </div>`;
        } else if (type === 'password_reset') {
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: recipientEmail
            });
            if (linkError || !linkData) throw new Error("Failed to generate reset link");
            displayOtp = linkData.properties?.email_otp;

            subject = '🔐 Reset Your Password';
            htmlContent = `
        <div style="background-color: #f1f5f9; font-family: sans-serif; padding: 40px 0;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden;">
                 <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">VeryHandy Security</h1>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p>Reset Code:</p>
                    <div style="background-color: #eff6ff; color: #2563eb; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0;">
                        ${displayOtp}
                    </div>
                </div>
            </div>
        </div>`;
        } else if (type === 'new_booking') {
            recipientEmail = ADMIN_EMAIL;
            subject = `🔔 New Project: ${serviceType}`;
            htmlContent = `
        <div>
            <h2>New Request</h2>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Service:</strong> ${serviceType}</p>
        </div>`;
        } else if (type === 'new_review') {
            recipientEmail = ADMIN_EMAIL;
            subject = `⭐ New Review: ${rating}/5`;
            htmlContent = `
        <div>
            <h2>Review Received</h2>
            <p>"${comment}"</p>
            <p>- ${clientName}</p>
        </div>`;
        } else {
            // Status Update
            subject = `Update: ${serviceType}`;
            htmlContent = `
        <div>
            <h2>Booking ${newStatus}</h2>
            <p>Hi ${clientName}, your booking is now <strong>${newStatus}</strong>.</p>
        </div>`;
        }

        if (!recipientEmail) throw new Error("No recipient email.");

        // === RESEND LOGIC ===
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "VeryHandy <onboarding@resend.dev>", // Force Test Mode Sender
                to: recipientEmail,
                subject: subject,
                html: htmlContent,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return new Response(JSON.stringify({ success: false, error: data }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200, // Return 200 so client sees the error body, not a generic 400
            });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
});
